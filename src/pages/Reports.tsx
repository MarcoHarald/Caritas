import React from 'react';
import WeeklyReport from '../components/WeeklyReport';

const Reports: React.FC = () => {
  return (
    <div>
      <h1>Reports</h1>
      <WeeklyReport />
      {/* Add more report types here */}
    </div>
  );
};

export default Reports;