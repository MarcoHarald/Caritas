import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const LendingSummary: React.FC = () => {
  const [onLoan, setOnLoan] = useState(0);
  const [returned, setReturned] = useState(0);

  useEffect(() => {
    const fetchLendingData = async () => {
      const lendingRef = collection(db, 'lendingItems');
      const onLoanQuery = query(lendingRef, where('dateReturned', '==', null));
      const returnedQuery = query(lendingRef, where('dateReturned', '!=', null));

      const [onLoanSnapshot, returnedSnapshot] = await Promise.all([
        getDocs(onLoanQuery),
        getDocs(returnedQuery)
      ]);

      setOnLoan(onLoanSnapshot.size);
      setReturned(returnedSnapshot.size);
    };

    fetchLendingData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Lending Summary</h2>
      <p>Items out on loan: {onLoan}</p>
      <p>Items returned: {returned}</p>
    </div>
  );
};

export default LendingSummary;