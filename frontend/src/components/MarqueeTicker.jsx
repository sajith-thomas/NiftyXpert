import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Marquee from "react-fast-marquee";

const MarqueeTicker = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fallbackData = [
    { symbol: 'NIFTY 50', price: 24442.35, change: -0.26, isGainer: true, updated: new Date().toISOString() },
    { symbol: 'SENSEX', price: 80814.92, change: -0.35, isGainer: true, updated: new Date().toISOString() },
    { symbol: 'TCS.NSE', price: 3404, change: -1.29, isGainer: true, updated: new Date().toISOString() }
  ];

  const fetchStockData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stocks');
      if (response.data.length > 0) {
        setStockData(response.data);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
      } else {
        throw new Error("Empty response, loading fallback data...");
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Live data unavailable - Showing last known data');
      setStockData(fallbackData);
      setLastUpdated(new Date(fallbackData[0].updated).toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-gray-800 to-gray-900 py-3 border-y border-gray-700"
    >
      <div className="relative">
        {error && (
          <div className="absolute top-0 left-0 right-0 text-center text-yellow-400 text-sm bg-black bg-opacity-75 py-1 z-10">
            {error} (Last updated: {lastUpdated})
          </div>
        )}

        {loading && (
          <div className="absolute top-0 left-0 right-0 text-center text-gray-400 text-sm bg-black bg-opacity-75 py-1 z-10">
            Loading live market data...
          </div>
        )}

        <Marquee speed={40} gradient={false} pauseOnHover>
          {stockData.map((stock, index) => (
            <div key={index} className="flex items-center mx-8 transition-opacity hover:opacity-90">
              <span className="font-semibold text-gray-200 min-w-[120px]">
                {stock.symbol}
              </span>
              <span className={`text-lg mx-3 ${
                stock.isGainer ? 'text-green-400' : 'text-red-400'
              }`}>
                ₹{stock.price.toLocaleString('en-IN')}
              </span>
              <span className={`text-sm px-2 py-1 rounded-lg ${
                stock.isGainer 
                  ? 'bg-green-900/50 text-green-300'
                  : 'bg-red-900/50 text-red-300'
              }`}>
                {stock.isGainer ? '▲' : '▼'} {Math.abs(stock.change)}%
              </span>

              
            </div>
          ))}
        </Marquee>
      </div>
    </motion.div>
  );
};

export default MarqueeTicker;
