import React, { useState, useEffect } from 'react';
import SalesIncomeForm from '../components/SalesIncomeForm';
import ExpenseForm from '../components/ExpenseForm';
import { collection, query, orderBy, limit, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

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
      setHighlightedEntryId(null);
    }, 5000);
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

  const handleCancel = () => {
    setEditingEntry(null);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="dashboard-buttons">
        <button 
          onClick={() => toggleForm('sales')}
          className={`btn-sales ${activeForm === 'sales' ? 'active' : ''}`}
        >
          {activeForm === 'sales' ? 'Hide Sales Form' : 'Add Sales'}
        </button>
        <button 
          onClick={() => toggleForm('expenses')}
          className={`btn-expenses ${activeForm === 'expenses' ? 'active' : ''}`}
        >
          {activeForm === 'expenses' ? 'Hide Expense Form' : 'Add Expenses'}
        </button>
      </div>
      {activeForm === 'sales' && (
        <div className="form-container sales-form">
          <SalesIncomeForm onEntryAdded={handleEntryAdded} />
          {lastAddedEntry && lastAddedEntry.type === 'sale' && (
            <div className="entry-added-popup sales-popup">
              <h3>Entry Added Successfully</h3>
              <p>Date: {lastAddedEntry.date}</p>
              <p>Type: Sale</p>
              <p>Item Name: {lastAddedEntry.itemName}</p>
              <p>Amount: ${lastAddedEntry.amount.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}
      {activeForm === 'expenses' && (
        <div className="form-container expenses-form">
          <ExpenseForm onEntryAdded={handleEntryAdded} />
          {lastAddedEntry && lastAddedEntry.type === 'expense' && (
            <div className="entry-added-popup expenses-popup">
              <h3>Entry Added Successfully</h3>
              <p>Date: {lastAddedEntry.date}</p>
              <p>Type: Expense</p>
              <p>Item Name: {lastAddedEntry.itemName}</p>
              <p>Amount: ${lastAddedEntry.amount.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}
      <div className="recent-entries">
        <h2>Recent Entries</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Item Name</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentEntries.map((entry) => (
              <tr key={entry.id} className={entry.id === highlightedEntryId ? 'highlighted' : ''}>
                {editingEntry && editingEntry.id === entry.id ? (
                  <>
                    <td>
                      <input
                        type="date"
                        value={editingEntry.date}
                        onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                      />
                    </td>
                    <td>{entry.type === 'sale' ? 'Sale' : 'Expense'}</td>
                    <td>
                      <input
                        type="text"
                        value={editingEntry.itemName}
                        onChange={(e) => setEditingEntry({ ...editingEntry, itemName: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingEntry.amount}
                        onChange={(e) => setEditingEntry({ ...editingEntry, amount: parseFloat(e.target.value) })}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleSave(editingEntry)}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{entry.date}</td>
                    <td>{entry.type === 'sale' ? 'Sale' : 'Expense'}</td>
                    <td>{entry.itemName}</td>
                    <td>${entry.amount.toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleEdit(entry)}>Edit</button>
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