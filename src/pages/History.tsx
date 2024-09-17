import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PDFDocument, rgb } from 'pdf-lib';
import { format as formatDate } from 'date-fns';
import { format } from 'date-fns';

interface Entry {
  id: string;
  date: string;
  itemName: string;
  amount: number;
  type: 'sale' | 'expense';
  createdAt: Timestamp;
}

const History: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [startBalance, setStartBalance] = useState(0);
  const [endBalance, setEndBalance] = useState(0);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const fetchEntries = async () => {
    const salesQuery = query(
      collection(db, 'sales'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const [salesSnapshot, expensesSnapshot] = await Promise.all([
      getDocs(salesQuery),
      getDocs(expensesQuery),
    ]);

    const salesEntries = salesSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      type: 'sale' as const
    }));

    const expenseEntries = expensesSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      type: 'expense' as const
    }));

    const allEntries = [...salesEntries, ...expenseEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setEntries(allEntries as Entry[]);

    // Calculate balances
    const totalSales = salesEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
    setEndBalance(totalSales - totalExpenses);
    // Note: startBalance should be fetched from a separate balance tracking system
    // For now, we'll assume it's 0
    setStartBalance(0);
  };

  useEffect(() => {
    fetchEntries();
  }, [startDate, endDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
  };

  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    const fontSize = 10;
    const lineHeight = fontSize * 1.5;

    const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');

    // Add title
    page.drawText('Financial History Report', {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0.1, 0.1, 0.1),
      font: helveticaBold,
    });

    // Add date range
    page.drawText(`Date Range: ${formatDate(new Date(startDate), 'MMMM d, yyyy')} to ${formatDate(new Date(endDate), 'MMMM d, yyyy')}`, {
      x: 50,
      y: height - 80,
      size: fontSize,
      color: rgb(0.3, 0.3, 0.3),
    });

    const drawTable = (entries: Entry[], startY: number, title: string) => {
      let yOffset = startY;
      
      // Draw section title
      page.drawText(title, {
        x: 50,
        y: yOffset,
        size: fontSize + 2,
        color: rgb(0.1, 0.1, 0.1),
        font: helveticaBold,
      });
      yOffset -= lineHeight * 1.5;

      // Draw table header
      const columnWidths = [80, 200, 80];
      const headers = ['Date', 'Item Name', 'Amount'];

      page.drawRectangle({
        x: 50,
        y: yOffset - lineHeight,
        width: width - 100,
        height: lineHeight,
        color: rgb(0.9, 0.9, 0.9),
      });

      let xOffset = 50;
      headers.forEach((header, index) => {
        page.drawText(header, {
          x: xOffset + 5,
          y: yOffset - fontSize,
          size: fontSize,
          color: rgb(0.1, 0.1, 0.1),
          font: helveticaBold,
        });
        xOffset += columnWidths[index];
      });

      yOffset -= lineHeight;

      // Draw table rows
      let subtotal = 0;
      for (const entry of entries) {
        if (yOffset < 50) {
          page = pdfDoc.addPage([595.28, 841.89]);
          yOffset = height - 50;
        }

        subtotal += entry.amount;

        page.drawLine({
          start: { x: 50, y: yOffset },
          end: { x: width - 50, y: yOffset },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });

        xOffset = 50;
        [
          formatDate(new Date(entry.date), 'MMM d, yyyy'),
          entry.itemName || '',
          `$${entry.amount.toFixed(2)}`,
        ].forEach((text, index) => {
          if (text !== undefined) {
            page.drawText(text, {
              x: xOffset + 5,
              y: yOffset - fontSize,
              size: fontSize,
              color: rgb(0.2, 0.2, 0.2),
            });
          }
          xOffset += columnWidths[index];
        });

        yOffset -= lineHeight;
      }

      // Draw subtotal
      yOffset -= lineHeight;
      page.drawText('Subtotal:', {
        x: 50,
        y: yOffset,
        size: fontSize,
        color: rgb(0.1, 0.1, 0.1),
        font: helveticaBold,
      });
      page.drawText(`$${subtotal.toFixed(2)}`, {
        x: width - 130,
        y: yOffset,
        size: fontSize,
        color: rgb(0.1, 0.1, 0.1),
        font: helveticaBold,
      });

      return yOffset - lineHeight * 2;
    };

    const salesEntries = entries.filter(entry => entry.type === 'sale');
    const expenseEntries = entries.filter(entry => entry.type === 'expense');

    let currentY = height - 120;
    currentY = drawTable(salesEntries, currentY, 'Sales');
    currentY = drawTable(expenseEntries, currentY, 'Expenses');

    // Add summary
    currentY -= lineHeight;
    page.drawText('Summary:', {
      x: 50,
      y: currentY,
      size: fontSize + 2,
      color: rgb(0.1, 0.1, 0.1),
      font: helveticaBold,
    });
    currentY -= lineHeight;

    const summaryItems = [
      { label: 'Balance at start:', value: startBalance },
      { label: 'Total Sales:', value: salesEntries.reduce((sum, entry) => sum + entry.amount, 0) },
      { label: 'Total Expenses:', value: expenseEntries.reduce((sum, entry) => sum + entry.amount, 0) },
      { label: 'Balance at end:', value: endBalance },
      { label: 'Change in balance:', value: endBalance - startBalance },
    ];

    summaryItems.forEach(item => {
      page.drawText(item.label, {
        x: 50,
        y: currentY,
        size: fontSize,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText(`$${item.value.toFixed(2)}`, {
        x: 200,
        y: currentY,
        size: fontSize,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= lineHeight;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financial_history_${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`;
    link.click();
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
  };

  const handleSave = async (updatedEntry: Entry) => {
    try {
      const entryRef = doc(db, updatedEntry.type === 'sale' ? 'sales' : 'expenses', updatedEntry.id);
      await updateDoc(entryRef, {
        date: updatedEntry.date,
        itemName: updatedEntry.itemName,
        amount: updatedEntry.amount,
      });
      setEditingEntry(null);
      fetchEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Error updating entry. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingEntry(null);
  };

  const handleDelete = async (entry: Entry) => {
    if (window.confirm(`Are you sure you want to delete this ${entry.type}?`)) {
      try {
        const entryRef = doc(db, entry.type === 'sale' ? 'sales' : 'expenses', entry.id);
        await deleteDoc(entryRef);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">History</h1>
      <div className="date-selector mb-4">
        <label className="mr-4">
          Start Date:
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
            className="ml-2 p-2 border rounded"
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
            className="ml-2 p-2 border rounded"
          />
        </label>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Date</th>
            <th className="text-left">Type</th>
            <th className="text-left">Description</th>
            <th className="text-left">Amount</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              {editingEntry && editingEntry.id === entry.id ? (
                <>
                  <td>
                    <input
                      type="date"
                      value={editingEntry.date}
                      onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                      className="p-1 border rounded"
                    />
                  </td>
                  <td>{entry.type === 'sale' ? 'Income' : 'Expense'}</td>
                  <td>
                    <input
                      type="text"
                      value={editingEntry.itemName}
                      onChange={(e) => setEditingEntry({ ...editingEntry, itemName: e.target.value })}
                      className="p-1 border rounded w-full"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editingEntry.amount}
                      onChange={(e) => setEditingEntry({ ...editingEntry, amount: parseFloat(e.target.value) })}
                      className="p-1 border rounded w-full"
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSave(editingEntry)} className="bg-blue-500 text-white px-2 py-1 rounded mr-1">Save</button>
                    <button onClick={handleCancel} className="bg-gray-300 text-gray-800 px-2 py-1 rounded mr-1">Cancel</button>
                    <button onClick={() => handleDelete(entry)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{formatDate(entry.date)}</td>
                  <td>{entry.type === 'sale' ? 'Income' : 'Expense'}</td>
                  <td>{entry.itemName}</td>
                  <td>${entry.amount.toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleEdit(entry)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="balance-summary mt-4 p-4 bg-gray-100 rounded">
        <p>Balance at the start of period: ${startBalance.toFixed(2)}</p>
        <p>Balance at the end of period: ${endBalance.toFixed(2)}</p>
        <p>Change in balance: ${(endBalance - startBalance).toFixed(2)}</p>
        <button onClick={generatePDF} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
          Download PDF Report
        </button>
      </div>
    </div>
  );
};

export default History;