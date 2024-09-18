import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfMonth, endOfMonth, format, parseISO, subMonths } from 'date-fns';

interface DisposedTrashChartProps {
  groupBy: 'daily' | 'weekly' | 'monthly';
}

const DisposedTrashChart: React.FC<DisposedTrashChartProps> = ({ groupBy }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDisposedTrashData = async () => {
      const disposedTrashRef = collection(db, 'disposedTrash');
      const sixMonthsAgo = subMonths(new Date(), 6);
      const disposedTrashQuery = query(
        disposedTrashRef,
        orderBy('date', 'asc')
      );

      const disposedTrashSnapshot = await getDocs(disposedTrashQuery);
      const allData = disposedTrashSnapshot.docs
        .map(doc => ({ ...doc.data(), date: parseISO(doc.data().date) }))
        .filter(item => item.date >= sixMonthsAgo);

      const groupedData = groupDataByPeriod(allData, groupBy);
      setData(groupedData);
    };

    fetchDisposedTrashData();
  }, [groupBy]);

  const groupDataByPeriod = (data: any[], grouping: 'daily' | 'weekly' | 'monthly') => {
    const grouped: { [key: string]: { blueBags: number, yellowBags: number, tripsToLandfill: number } } = {};

    data.forEach((item) => {
      let key: string;
      if (grouping === 'daily') {
        key = format(item.date, 'yyyy-MM-dd');
      } else if (grouping === 'weekly') {
        key = `Week ${format(item.date, 'w, yyyy')}`;
      } else {
        key = format(item.date, 'MMM yyyy');
      }

      if (!grouped[key]) {
        grouped[key] = { blueBags: 0, yellowBags: 0, tripsToLandfill: 0 };
      }
      grouped[key].blueBags += item.blueBags;
      grouped[key].yellowBags += item.yellowBags;
      grouped[key].tripsToLandfill += item.tripsToLandfill;
    });

    return Object.entries(grouped).map(([date, values]) => ({ date, ...values }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Disposed Trash</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="blueBags" fill="#3b82f6" name="Blue Bags" />
          <Bar dataKey="yellowBags" fill="#eab308" name="Yellow Bags" />
          <Bar dataKey="tripsToLandfill" fill="#22c55e" name="Trips to Landfill" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DisposedTrashChart;