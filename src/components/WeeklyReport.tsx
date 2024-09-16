import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type GroupBy = 'daily' | 'weekly' | 'monthly';

const WeeklyReport: React.FC = () => {
  const [salesData, setSalesData] = useState<number[]>([]);
  const [expensesData, setExpensesData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>('weekly');

  useEffect(() => {
    const fetchData = async () => {
      const endDate = new Date();
      let startDate: Date;
      
      switch (groupBy) {
        case 'daily':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(endDate.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(endDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const salesQuery = query(
        collection(db, 'sales'),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
      );

      const expensesQuery = query(
        collection(db, 'expenses'),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
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

      const groupData = (data: { [key: string]: number }) => {
        if (groupBy === 'daily') return data;

        const groupedData: { [key: string]: number } = {};
        Object.entries(data).forEach(([date, amount]) => {
          const key = groupBy === 'weekly'
            ? getWeekStart(new Date(date)).toISOString().split('T')[0]
            : date.slice(0, 7); // YYYY-MM for monthly
          groupedData[key] = (groupedData[key] || 0) + amount;
        });
        return groupedData;
      };

      const salesByGroup = groupData(salesByDate);
      const expensesByGroup = groupData(expensesByDate);

      const dates = Object.keys(salesByGroup).sort();

      setLabels(dates);
      setSalesData(dates.map((date) => salesByGroup[date] || 0));
      setExpensesData(dates.map((date) => expensesByGroup[date] || 0));
    };

    fetchData();
  }, [groupBy]);

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Sales',
        data: salesData,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Expenses',
        data: expensesData,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h2>Financial Report</h2>
      <div>
        <label>Group by: </label>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <Line data={data} />
      <div>
        <h3>Summary</h3>
        <p>Total Sales: ${salesData.reduce((a, b) => a + b, 0).toFixed(2)}</p>
        <p>Total Expenses: ${expensesData.reduce((a, b) => a + b, 0).toFixed(2)}</p>
        <p>Net Profit/Loss: ${(salesData.reduce((a, b) => a + b, 0) - expensesData.reduce((a, b) => a + b, 0)).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default WeeklyReport;