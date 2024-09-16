import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

const WeeklyReport: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const fetchData = async () => {
      const endDate = new Date();
      let startDate: Date;
      
      switch (groupBy) {
        case 'daily':
          startDate = subDays(endDate, 7);
          break;
        case 'weekly':
          startDate = subDays(endDate, 28);
          break;
        case 'monthly':
          startDate = subDays(endDate, 180);
          break;
      }

      const salesQuery = query(
        collection(db, 'sales'),
        where('date', '>=', startOfDay(startDate).toISOString().split('T')[0]),
        where('date', '<=', endOfDay(endDate).toISOString().split('T')[0])
      );

      const expensesQuery = query(
        collection(db, 'expenses'),
        where('date', '>=', startOfDay(startDate).toISOString().split('T')[0]),
        where('date', '<=', endOfDay(endDate).toISOString().split('T')[0])
      );

      const salesSnapshot = await getDocs(salesQuery);
      const expensesSnapshot = await getDocs(expensesQuery);

      const salesByDate: { [key: string]: number } = {};
      const expensesByDate: { [key: string]: number } = {};

      salesSnapshot.forEach((doc) => {
        const { date, amount } = doc.data();
        salesByDate[date] = (salesByDate[date] || 0) + amount;
      });

      expensesSnapshot.forEach((doc) => {
        const { date, amount } = doc.data();
        expensesByDate[date] = (expensesByDate[date] || 0) + amount;
      });

      const combinedData = Object.keys({ ...salesByDate, ...expensesByDate })
        .sort()
        .map((date) => ({
          date,
          sales: salesByDate[date] || 0,
          expenses: expensesByDate[date] || 0,
        }));

      const groupedData = groupData(combinedData, groupBy);
      setData(groupedData);
    };

    fetchData();
  }, [groupBy]);

  const groupData = (data: any[], grouping: 'daily' | 'weekly' | 'monthly') => {
    if (grouping === 'daily') return data;

    const grouped: { [key: string]: { sales: number; expenses: number } } = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      let key: string;

      if (grouping === 'weekly') {
        key = `Week ${format(date, 'w')}`;
      } else {
        key = format(date, 'MMM yyyy');
      }

      if (!grouped[key]) {
        grouped[key] = { sales: 0, expenses: 0 };
      }
      grouped[key].sales += item.sales;
      grouped[key].expenses += item.expenses;
    });

    return Object.entries(grouped).map(([date, values]) => ({ date, ...values }));
  };

  const formatXAxis = (tickItem: string) => {
    if (groupBy === 'daily') {
      return format(new Date(tickItem), 'MMM d');
    }
    return tickItem;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Financial Report</h2>
      <div className="mb-4">
        <label className="mr-2">
          Group by:
          <select 
            value={groupBy} 
            onChange={(e) => setGroupBy(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="ml-2 p-2 border rounded"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatXAxis} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#10B981" name="Income" /> {/* Green color for sales/income */}
          <Bar dataKey="expenses" fill="#EF4444" name="Expenses" /> {/* Red color for expenses */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyReport;