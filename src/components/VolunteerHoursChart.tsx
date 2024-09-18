import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfMonth, endOfMonth, format, parseISO, subMonths } from 'date-fns';

interface VolunteerHoursChartProps {
  groupBy: 'daily' | 'weekly' | 'monthly';
}

const VolunteerHoursChart: React.FC<VolunteerHoursChartProps> = ({ groupBy }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchVolunteerHoursData = async () => {
      const volunteerSessionsRef = collection(db, 'volunteerSessions');
      const sixMonthsAgo = subMonths(new Date(), 6);
      const volunteerSessionsQuery = query(
        volunteerSessionsRef,
        orderBy('date', 'asc')
      );

      const volunteerSessionsSnapshot = await getDocs(volunteerSessionsQuery);
      const allData = volunteerSessionsSnapshot.docs
        .map(doc => ({ ...doc.data(), date: parseISO(doc.data().date) }))
        .filter(item => item.date >= sixMonthsAgo);

      const groupedData = groupDataByPeriod(allData, groupBy);
      setData(groupedData);
    };

    fetchVolunteerHoursData();
  }, [groupBy]);

  const groupDataByPeriod = (data: any[], grouping: 'daily' | 'weekly' | 'monthly') => {
    const grouped: { [key: string]: number } = {};

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
        grouped[key] = 0;
      }
      grouped[key] += item.hours;
    });

    return Object.entries(grouped).map(([date, hours]) => ({ date, hours }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Volunteer Hours</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="hours" fill="#8b5cf6" name="Volunteer Hours" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolunteerHoursChart;