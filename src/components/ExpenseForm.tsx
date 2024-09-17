import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface ExpenseFormProps {
  onEntryAdded: (entry: Entry) => void;
  buttonStyle: string;
  titleStyle: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onEntryAdded, buttonStyle, titleStyle }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        date,
        itemName,
        amount: parseFloat(amount),
        createdAt: serverTimestamp(),
      });
      const newEntry = {
        id: docRef.id,
        date,
        itemName,
        amount: parseFloat(amount),
        type: 'expense' as const,
        createdAt: new Date(),
      };
      onEntryAdded(newEntry);
      setItemName('');
      setAmount('');
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Error saving entry. Please try again.');
    }
  };

  return (
    <div className="card">
      <h2 className={titleStyle}>Add Expenses</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="itemName">Item Name</label>
          <input
            id="itemName"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item Name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            required
          />
        </div>
        <button type="submit" className={buttonStyle}>Save Expense Entry</button>
      </form>
    </div>
  );
};

export default ExpenseForm;