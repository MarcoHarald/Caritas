import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const salesQuery = query(
        collection(db, 'sales'),
        where('date', '==', selectedDate)
      );
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('date', '==', selectedDate)
      );

      const [salesSnapshot, expensesSnapshot] = await Promise.all([
        getDocs(salesQuery),
        getDocs(expensesQuery),
      ]);

      const salesEntries = salesSnapshot.docs.map((doc) => ({ ...doc.data(), type: 'sale', id: doc.id }));
      const expenseEntries = expensesSnapshot.docs.map((doc) => ({ ...doc.data(), type: 'expense', id: doc.id }));

      setEntries([...salesEntries, ...expenseEntries]);
    };

    fetchEntries();
  }, [selectedDate]);

  return (
    <div>
      <h2>Calendar View</h2>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <div>
        <h3>Entries for {selectedDate}</h3>
        {entries.map((entry) => (
          <div key={entry.id}>
            <p>{entry.type === 'sale' ? 'Sale' : 'Expense'}: ${entry.amount}</p>
            <p>{entry.type === 'sale' ? entry.description : entry.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;