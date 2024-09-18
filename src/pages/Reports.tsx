import React, { useState, useEffect } from 'react';
import WeeklyReport from '../components/WeeklyReport';
import LendingSummary from '../components/LendingSummary';
import GiftedItemsSummary from '../components/GiftedItemsSummary';
import DisposedTrashChart from '../components/DisposedTrashChart';
import VolunteerHoursChart from '../components/VolunteerHoursChart';

const Reports: React.FC = () => {
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      
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

      <WeeklyReport groupBy={groupBy} />
      
      <div className="mt-12 grid grid-cols-2 gap-8">
        <LendingSummary />
        <GiftedItemsSummary />
      </div>

      <div className="mt-12">
        <DisposedTrashChart groupBy={groupBy} />
      </div>

      <div className="mt-12">
        <VolunteerHoursChart groupBy={groupBy} />
      </div>
    </div>
  );
};

export default Reports;