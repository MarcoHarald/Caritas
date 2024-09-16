import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfDay, endOfDay, subMonths, format, parseISO } from 'date-fns';

const WeeklyReport: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    const fetchData = async () => {
      const endDate = new Date();
      let startDate: Date;
      
      switch (groupBy) {
        case 'daily':
          startDate = subMonths(endDate, 1); // Show last month for daily view
          break;
        case 'weekly':
          startDate = subMonths(endDate, 3); // Show last 3 months for weekly view
          break;
        case 'monthly':
          startDate = subMonths(endDate, 12); // Show last 12 months for monthly view
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
      const date = parseISO(item.date);
      let key: string;

      if (grouping === 'weekly') {
        key = `Week ${format(date, 'w, yyyy')}`;
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

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'MMM d');
    } catch {
      return date;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-4 border rounded shadow">
          <p className="label font-bold">{groupBy === 'daily' ? formatDate(label) : label}</p>
          <p className="income text-green-600">Income: ${payload[0].value.toFixed(2)}</p>
          <p className="expenses text-red-600">Expenses: ${payload[1].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem: string) => {
    if (groupBy === 'daily') {
      try {
        return format(parseISO(tickItem), 'MMM d');
      } catch {
        return tickItem;
      }
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
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="sales" fill="#10B981" name="Income" />
            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No data available for the selected period.</p>
      )}
    </div>
  );
};

export default WeeklyReport;