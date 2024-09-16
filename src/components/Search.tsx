import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Entry {
  type: 'sale' | 'expense';
  id: string;
  date: string;
  amount: number;
  category?: string;
  description?: string;
}

const Search: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<Entry[]>([]);

  const handleSearch = async () => {
    const salesQuery = query(
      collection(db, 'sales'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    const [salesSnapshot, expensesSnapshot] = await Promise.all([
      getDocs(salesQuery),
      getDocs(expensesQuery),
    ]);

    const salesResults: Entry[] = salesSnapshot.docs.map((doc) => ({ ...doc.data(), type: 'sale', id: doc.id } as Entry));
    const expenseResults: Entry[] = expensesSnapshot.docs.map((doc) => ({ ...doc.data(), type: 'expense', id: doc.id } as Entry));

    let filteredResults = [...salesResults, ...expenseResults];

    if (category) {
      filteredResults = filteredResults.filter((result) => 
        result.type === 'expense' && result.category === category
      );
    }

    setResults(filteredResults);
  };

  return (
    <div>
      <h2>Search</h2>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        placeholder="Start Date"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        placeholder="End Date"
      />
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Expense Category (optional)"
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        <h3>Results</h3>
        {results.map((result) => (
          <div key={result.id}>
            <p>{result.date}: {result.type === 'sale' ? 'Sale' : 'Expense'} - ${result.amount}</p>
            <p>{result.type === 'sale' ? result.description : result.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;