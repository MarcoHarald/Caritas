import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

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

  return (
    <div>
      <h1>History</h1>
      <div className="date-selector">
        <label>
          Start Date:
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
          />
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Item Name</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.date}</td>
              <td>{entry.type === 'sale' ? 'Sale' : 'Expense'}</td>
              <td>{entry.itemName}</td>
              <td>${entry.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="balance-summary">
        <p>Balance at the start of period: ${startBalance.toFixed(2)}</p>
        <p>Balance at the end of period: ${endBalance.toFixed(2)}</p>
        <p>Change in balance: ${(endBalance - startBalance).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default History;