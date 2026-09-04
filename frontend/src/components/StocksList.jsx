import React from 'react';
import { Link } from 'react-router-dom';

const stocks = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
];

const StocksList = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">NSE Stocks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock) => (
          <Link 
            to={`/stocks/${stock.symbol}`} 
            key={stock.symbol}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold">{stock.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{stock.symbol}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StocksList;