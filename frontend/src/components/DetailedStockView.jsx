import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';

const StockDetailsPage = () => {
  const { symbol = 'TCS.NS' } = useParams();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stock-details/${symbol}`);
        if (!response.ok) throw new Error('Failed to fetch stock data');
        const data = await response.json();
        setStockData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [symbol]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{stockData.info.longName}</h1>
            <p className="text-gray-600 dark:text-gray-300">{stockData.info.symbol}</p>
            <p className="text-gray-600 dark:text-gray-300">{stockData.info.exchange}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">₹{stockData.currentPrice.toFixed(2)}</p>
            <p className={`text-lg ${stockData.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stockData.priceChange >= 0 ? '+' : ''}{stockData.priceChange.toFixed(2)} ({stockData.priceChangePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {['Overview', 'Fundamentals', 'Financials', 'Events', 'Analysis'].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow">
            <OverviewTab data={stockData} />
          </Tab.Panel>
          <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow">
            <FundamentalsTab data={stockData} />
          </Tab.Panel>
          <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow">
            <FinancialsTab data={stockData} />
          </Tab.Panel>
          <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow">
            <EventsTab data={stockData} />
          </Tab.Panel>
          <Tab.Panel className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow">
            <AnalysisTab data={stockData} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

// Tab components would go here...
// Example for OverviewTab:
const OverviewTab = ({ data }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-semibold">About</h3>
      <p className="text-gray-700 dark:text-gray-300">{data.info.longBusinessSummary}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium">Key Information</h4>
        <ul className="mt-2 space-y-2">
          <li>CEO: {data.info.companyOfficers?.[0]?.name || 'N/A'}</li>
          <li>Employees: {data.info.fullTimeEmployees?.toLocaleString() || 'N/A'}</li>
          <li>Sector: {data.info.sector || 'N/A'}</li>
          <li>Industry: {data.info.industry || 'N/A'}</li>
        </ul>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium">Trading Information</h4>
        <ul className="mt-2 space-y-2">
          <li>Market Cap: ₹{(data.info.marketCap / 1e12).toFixed(2)}T</li>
          <li>Volume: {(data.info.volume / 1e6).toFixed(2)}M</li>
          <li>52W Range: ₹{data.info.fiftyTwoWeekLow} - ₹{data.info.fiftyTwoWeekHigh}</li>
          <li>Avg Volume: {(data.info.averageVolume / 1e6).toFixed(2)}M</li>
        </ul>
      </div>
    </div>
  </div>
);

// Similar components for FundamentalsTab, FinancialsTab, etc...

export default StockDetailsPage;