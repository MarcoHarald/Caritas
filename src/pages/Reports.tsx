import React, { useState, useEffect } from 'react';
import WeeklyReport from '../components/WeeklyReport';
import LendingSummary from '../components/LendingSummary';
import GiftedItemsSummary from '../components/GiftedItemsSummary';
import DisposedTrashChart from '../components/DisposedTrashChart';
import VolunteerHoursChart from '../components/VolunteerHoursChart';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

const Reports: React.FC = () => {
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [volunteerHours, setVolunteerHours] = useState<any[]>([]);
  const [disposedTrash, setDisposedTrash] = useState<any[]>([]);
  const [lendingItems, setLendingItems] = useState<any[]>([]);
  const [giftedItems, setGiftedItems] = useState<any[]>([]);

  useEffect(() => {
    fetchAvailablePeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchFinancialData();
      fetchVolunteerHours();
      fetchDisposedTrash();
      fetchLendingItems();
      fetchGiftedItems();
    }
  }, [selectedPeriod]);

  const fetchAvailablePeriods = async () => {
    const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'), limit(1));
    const expensesQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'), limit(1));

    const [salesSnapshot, expensesSnapshot] = await Promise.all([
      getDocs(salesQuery),
      getDocs(expensesQuery),
    ]);

    const latestSaleDate = salesSnapshot.docs[0]?.data().date;
    const latestExpenseDate = expensesSnapshot.docs[0]?.data().date;

    const latestDate = new Date(Math.max(
      latestSaleDate ? new Date(latestSaleDate).getTime() : 0,
      latestExpenseDate ? new Date(latestExpenseDate).getTime() : 0
    ));

    const periods: string[] = [];
    let currentDate = latestDate;
    const oldestDate = new Date(Math.min(
      latestSaleDate ? new Date(latestSaleDate).getTime() : Date.now(),
      latestExpenseDate ? new Date(latestExpenseDate).getTime() : Date.now()
    ));

    while (currentDate >= oldestDate) {
      periods.push(format(currentDate, 'yyyy-MM'));
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    }

    setAvailablePeriods(periods);
    setSelectedPeriod(periods[0]);
  };

  const fetchFinancialData = async () => {
    const [year, month] = selectedPeriod.split('-');
    const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
    const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));

    const salesQuery = query(
      collection(db, 'sales'),
      where('date', '>=', format(startDate, 'yyyy-MM-dd')),
      where('date', '<=', format(endDate, 'yyyy-MM-dd'))
    );

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', format(startDate, 'yyyy-MM-dd')),
      where('date', '<=', format(endDate, 'yyyy-MM-dd'))
    );

    const [salesSnapshot, expensesSnapshot] = await Promise.all([
      getDocs(salesQuery),
      getDocs(expensesQuery),
    ]);

    const incomeData = salesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const expensesData = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setIncomeData(incomeData);
    setExpensesData(expensesData);
  };

  const fetchVolunteerHours = async () => {
    const [year, month] = selectedPeriod.split('-');
    const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
    const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));

    const volunteerQuery = query(
      collection(db, 'volunteerSessions'),
      where('date', '>=', format(startDate, 'yyyy-MM-dd')),
      where('date', '<=', format(endDate, 'yyyy-MM-dd')),
      orderBy('date', 'asc')
    );

    const volunteerSnapshot = await getDocs(volunteerQuery);
    const volunteerData = volunteerSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setVolunteerHours(volunteerData);
  };

  const fetchDisposedTrash = async () => {
    const [year, month] = selectedPeriod.split('-');
    const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
    const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));

    const trashQuery = query(
      collection(db, 'disposedTrash'),
      where('date', '>=', format(startDate, 'yyyy-MM-dd')),
      where('date', '<=', format(endDate, 'yyyy-MM-dd')),
      orderBy('date', 'asc')
    );

    const trashSnapshot = await getDocs(trashQuery);
    const trashData = trashSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setDisposedTrash(trashData);
  };

  const fetchLendingItems = async () => {
    const [year, month] = selectedPeriod.split('-');
    const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
    const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));

    const lendingQuery = query(
      collection(db, 'lendingItems'),
      where('dateLent', '>=', format(startDate, 'yyyy-MM-dd')),
      where('dateLent', '<=', format(endDate, 'yyyy-MM-dd')),
      orderBy('dateLent', 'asc')
    );

    const lendingSnapshot = await getDocs(lendingQuery);
    const lendingData = lendingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLendingItems(lendingData);
  };

  const fetchGiftedItems = async () => {
    const [year, month] = selectedPeriod.split('-');
    const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
    const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));

    const giftedQuery = query(
      collection(db, 'giftedItems'),
      where('dateGifted', '>=', format(startDate, 'yyyy-MM-dd')),
      where('dateGifted', '<=', format(endDate, 'yyyy-MM-dd')),
      orderBy('dateGifted', 'asc')
    );

    const giftedSnapshot = await getDocs(giftedQuery);
    const giftedData = giftedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setGiftedItems(giftedData);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      
      <div className="mb-6 flex items-center">
        <label className="mr-4">
          Select Period:
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="ml-2 p-2 border rounded"
          >
            {availablePeriods.map((period) => (
              <option key={period} value={period}>
                {format(parseISO(period), 'MMMM yyyy')}
              </option>
            ))}
          </select>
        </label>
        <label>
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

      <WeeklyReport groupBy={groupBy} data={incomeData} expensesData={expensesData} />
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Financial Details</h2>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <h3 className="text-xl font-semibold mb-2">Income</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Item</th>
                  <th className="border border-gray-300 p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-2">{item.date}</td>
                    <td className="border border-gray-300 p-2">{item.itemName}</td>
                    <td className="border border-gray-300 p-2">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>Total</td>
                  <td className="border border-gray-300 p-2">
                    ${incomeData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="w-1/2">
            <h3 className="text-xl font-semibold mb-2">Expenses</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Item</th>
                  <th className="border border-gray-300 p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expensesData.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-2">{item.date}</td>
                    <td className="border border-gray-300 p-2">{item.itemName}</td>
                    <td className="border border-gray-300 p-2">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>Total</td>
                  <td className="border border-gray-300 p-2">
                    ${expensesData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <DisposedTrashChart groupBy={groupBy} />
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Disposed Trash Breakdown</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Blue Bags</th>
                <th className="border border-gray-300 p-2">Yellow Bags</th>
                <th className="border border-gray-300 p-2">Trips to Landfill</th>
              </tr>
            </thead>
            <tbody>
              {disposedTrash.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.date}</td>
                  <td className="border border-gray-300 p-2">{item.blueBags}</td>
                  <td className="border border-gray-300 p-2">{item.yellowBags}</td>
                  <td className="border border-gray-300 p-2">{item.tripsToLandfill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12">
        <VolunteerHoursChart groupBy={groupBy} />
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Volunteer Hours Breakdown</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Volunteer</th>
                <th className="border border-gray-300 p-2">Hours</th>
              </tr>
            </thead>
            <tbody>
              {volunteerHours.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.date}</td>
                  <td className="border border-gray-300 p-2">{item.volunteerName}</td>
                  <td className="border border-gray-300 p-2">{item.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12">
        <LendingSummary />
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Lending Items Details</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date Lent</th>
                <th className="border border-gray-300 p-2">Item Name</th>
                <th className="border border-gray-300 p-2">Organization</th>
                <th className="border border-gray-300 p-2">Date Returned</th>
                <th className="border border-gray-300 p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {lendingItems.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.dateLent}</td>
                  <td className="border border-gray-300 p-2">{item.itemName}</td>
                  <td className="border border-gray-300 p-2">{item.organization}</td>
                  <td className="border border-gray-300 p-2">{item.dateReturned || 'Not returned'}</td>
                  <td className="border border-gray-300 p-2">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12">
        <GiftedItemsSummary />
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Gifted Items Details</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date Gifted</th>
                <th className="border border-gray-300 p-2">Item Name</th>
                <th className="border border-gray-300 p-2">Organization</th>
                <th className="border border-gray-300 p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {giftedItems.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.dateGifted}</td>
                  <td className="border border-gray-300 p-2">{item.itemName}</td>
                  <td className="border border-gray-300 p-2">{item.organization}</td>
                  <td className="border border-gray-300 p-2">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;