import React, { useState, useEffect } from 'react';
import SalesIncomeForm from '../components/SalesIncomeForm';
import ExpenseForm from '../components/ExpenseForm';
import { collection, query, orderBy, limit, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';

interface Entry {
  id: string;
  date: string;
  itemName: string;
  amount: number;
  type: 'sale' | 'expense';
  createdAt: Timestamp;
}

const Dashboard: React.FC = () => {
  const [activeForm, setActiveForm] = useState<'sales' | 'expenses' | null>(null);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [lastAddedEntry, setLastAddedEntry] = useState<Entry | null>(null);
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const fetchRecentEntries = async () => {
    const salesQuery = query(collection(db, 'sales'), orderBy('createdAt', 'desc'), limit(10));
    const expensesQuery = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'), limit(10));

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
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, 10);

    setRecentEntries(allEntries as Entry[]);
  };

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const toggleForm = (formType: 'sales' | 'expenses') => {
    setActiveForm(activeForm === formType ? null : formType);
  };

  const handleEntryAdded = (newEntry: Entry) => {
    setLastAddedEntry(newEntry);
    fetchRecentEntries();
    setHighlightedEntryId(newEntry.id);
    setTimeout(() => {
      setLastAddedEntry(null);
    }, 3000);
    setTimeout(() => {
      setHighlightedEntryId(null);
    }, 10000);
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
      fetchRecentEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Error updating entry. Please try again.');
    }
  };

  const handleDelete = async (entry: Entry) => {
    if (window.confirm(`Are you sure you want to delete this ${entry.type}?`)) {
      try {
        const entryRef = doc(db, entry.type === 'sale' ? 'sales' : 'expenses', entry.id);
        await deleteDoc(entryRef);
        setRecentEntries(recentEntries.filter(e => e.id !== entry.id));
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setEditingEntry(null);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <div className="dashboard relative">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="dashboard-buttons mb-4">
        <button 
          onClick={() => toggleForm('sales')}
          className={`btn-sales ${activeForm === 'sales' ? 'active' : ''} bg-green-500 text-white px-4 py-2 rounded mr-2`}
        >
          {activeForm === 'sales' ? 'Hide Sales Form' : 'Add Sales'}
        </button>
        <button 
          onClick={() => toggleForm('expenses')}
          className={`btn-expenses ${activeForm === 'expenses' ? 'active' : ''} bg-red-500 text-white px-4 py-2 rounded`}
        >
          {activeForm === 'expenses' ? 'Hide Expense Form' : 'Add Expenses'}
        </button>
      </div>
      <div className="form-container relative">
        {activeForm === 'sales' && (
          <div className="sales-form mb-4">
            <SalesIncomeForm 
              onEntryAdded={handleEntryAdded} 
              buttonStyle="bg-green-500 text-white px-2 py-1 rounded" 
              titleStyle="text-xl font-semibold mb-2 text-green-600"
            />
          </div>
        )}
        {activeForm === 'expenses' && (
          <div className="expenses-form mb-4">
            <ExpenseForm 
              onEntryAdded={handleEntryAdded} 
              buttonStyle="bg-red-500 text-white px-2 py-1 rounded" 
              titleStyle="text-xl font-semibold mb-2 text-red-600"
            />
          </div>
        )}
        {lastAddedEntry && (
          <div className={`absolute inset-0 flex items-center justify-center bg-opacity-90 ${
            lastAddedEntry.type === 'sale' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className={`p-4 rounded-lg shadow-lg ${
              lastAddedEntry.type === 'sale' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              <h3 className="text-lg font-semibold mb-2">Great! Your entry has been added.</h3>
              <p><span className="font-medium">Date:</span> {formatDate(lastAddedEntry.date)}</p>
              <p><span className="font-medium">Type:</span> {lastAddedEntry.type === 'sale' ? 'Income' : 'Expense'}</p>
              <p><span className="font-medium">Description:</span> {lastAddedEntry.itemName}</p>
              <p><span className="font-medium">Amount:</span> ${lastAddedEntry.amount.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
      <div className="recent-entries">
        <h2 className="text-xl font-semibold mb-2">Recent Entries</h2>
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
            {recentEntries.map((entry) => (
              <tr key={entry.id} className={`transition-all duration-300 ${entry.id === highlightedEntryId ? 'bg-yellow-100' : ''}`}>
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
      </div>
    </div>
  );
};

export default Dashboard;