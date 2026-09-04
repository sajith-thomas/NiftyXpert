import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowRight 
} from 'lucide-react';

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [marqueeStocks, setMarqueeStocks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, sectorsRes, marqueeRes] = await Promise.all([
          axios.get('/api/stocks'),
          axios.get('/api/sectors'),
          axios.get('/api/marquee-stocks')
        ]);

        setStocks(stocksRes.data);
        setSectors(sectorsRes.data);
        setMarqueeStocks(marqueeRes.data);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Marquee Stock Ticker */}
      <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
        <div className="flex animate-marquee space-x-8 p-2">
          {marqueeStocks.map((stock) => (
            <div key={stock.symbol} className="flex items-center">
              <span className="font-bold mr-2">{stock.symbol}</span>
              <span className={`${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.price} ({stock.change}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Stocks Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {/* Stocks List */}
        <div className="md:col-span-2 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Activity className="mr-2" /> Top Stocks
          </h2>
          {stocks.map((stock) => (
            <Link 
              to={`/stock/${stock.symbol}`} 
              key={stock.symbol}
              className="block hover:bg-gray-50 transition p-3 border-b last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold">{stock.symbol}</span>
                  <span className="text-gray-500 ml-2">{stock.name}</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.price}
                  </span>
                  {stock.change > 0 ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trending Sectors */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <TrendingUp className="mr-2" /> Trending Sectors
          </h2>
          {sectors.map((sector) => (
            <div 
              key={sector.name} 
              className="flex justify-between items-center p-3 border-b last:border-b-0"
            >
              <span>{sector.name}</span>
              <span className={`font-bold ${sector.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {sector.change}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;