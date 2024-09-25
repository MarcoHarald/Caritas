import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface WeeklyReportProps {
  groupBy: 'daily' | 'weekly' | 'monthly';
  data: any[];
  expensesData: any[];
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ groupBy, data, expensesData }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const combinedData = combineData(data, expensesData);
    const groupedData = groupData(combinedData, groupBy);
    setChartData(groupedData);
  }, [groupBy, data, expensesData]);

  const combineData = (incomeData: any[], expensesData: any[]) => {
    const combined: { [key: string]: { income: number; expenses: number } } = {};

    incomeData.forEach((item) => {
      if (!combined[item.date]) {
        combined[item.date] = { income: 0, expenses: 0 };
      }
      combined[item.date].income += item.amount;
    });

    expensesData.forEach((item) => {
      if (!combined[item.date]) {
        combined[item.date] = { income: 0, expenses: 0 };
      }
      combined[item.date].expenses += item.amount;
    });

    return Object.entries(combined).map(([date, values]) => ({ date, ...values }));
  };

  const groupData = (data: any[], grouping: 'daily' | 'weekly' | 'monthly') => {
    if (grouping === 'daily') return data;

    const grouped: { [key: string]: { income: number; expenses: number } } = {};

    data.forEach((item) => {
      const date = parseISO(item.date);
      let key: string;

      if (grouping === 'weekly') {
        key = `Week ${format(date, 'w, yyyy')}`;
      } else {
        key = format(date, 'MMM yyyy');
      }

      if (!grouped[key]) {
        grouped[key] = { income: 0, expenses: 0 };
      }
      grouped[key].income += item.income;
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

  return (
    <div>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={groupBy === 'daily' ? formatDate : undefined} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" fill="#10B981" name="Income" />
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