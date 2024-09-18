import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { startOfMonth, endOfMonth } from 'date-fns';

const GiftedItemsSummary: React.FC = () => {
  const [currentMonthEntries, setCurrentMonthEntries] = useState(0);

  useEffect(() => {
    const fetchGiftedItemsData = async () => {
      const startOfCurrentMonth = startOfMonth(new Date());
      const endOfCurrentMonth = endOfMonth(new Date());

      const giftedItemsRef = collection(db, 'giftedItems');
      const giftedItemsQuery = query(
        giftedItemsRef,
        where('dateGifted', '>=', startOfCurrentMonth.toISOString()),
        where('dateGifted', '<=', endOfCurrentMonth.toISOString())
      );

      const giftedItemsSnapshot = await getDocs(giftedItemsQuery);
      setCurrentMonthEntries(giftedItemsSnapshot.size);
    };

    fetchGiftedItemsData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Gifted Items Summary</h2>
      <p>Entries for the current month: {currentMonthEntries}</p>
    </div>
  );
};

export default GiftedItemsSummary;