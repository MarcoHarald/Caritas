import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeeklyReport: React.FC = () => {
  const [salesData, setSalesData] = useState<number[]>([]);
  const [expensesData, setExpensesData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

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

      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        return d.toISOString().split('T')[0];
      });

      setLabels(dates);
      setSalesData(dates.map((date) => salesByDate[date] || 0));
      setExpensesData(dates.map((date) => expensesByDate[date] || 0));
    };

    fetchData();
  }, []);

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
      <h2>Weekly Report</h2>
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