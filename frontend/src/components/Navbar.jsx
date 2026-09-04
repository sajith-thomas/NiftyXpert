import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LineChart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Navbar = () => {
  const sectors = [
    { name: 'IT', change: 1.59, status: 'up' },
    { name: 'Electric', change: 0.90, status: 'up' },
    { name: 'Banking', change: 0.01, status: 'neutral' },
    { name: 'Pharma', change: -1.18, status: 'down' },
    { name: 'Nifty Auto', change: 0.50, status: 'up' }
  ];

  const getSectorClass = (status) => {
    return status === 'up' ? 'text-green-400' : 
           status === 'down' ? 'text-red-400' : 
           'text-gray-400';
  };

  const getTrendIcon = (status) => {
    switch(status) {
      case 'up': return <TrendingUp size={16} className="mr-1" />;
      case 'down': return <TrendingDown size={16} className="mr-1" />;
      default: return <Minus size={16} className="mr-1" />;
    }
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-[#111346] to-[#1a1c4d] p-4 sticky top-0 z-50 shadow-lg"
    >
      <div className="container mx-auto flex flex-col">
        
        {/* Top Section: Logo & Links */}
        <div className="flex justify-between items-center">
          
          {/* Logo with subtle animation */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-white flex items-center hover:scale-105 transition-transform"
          >
            <motion.img 
              src="/logo.png"  
              alt="StockTrack Logo" 
              className="h-8 mr-2"
              onError={(e) => { e.target.style.display = 'none'; }}
              whileHover={{ rotate: 5 }} 
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100">
            
            </span>
          </Link>

          {/* Navbar Links */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center text-white hover:text-blue-200 transition group"
            >
              <Home className="mr-2 group-hover:scale-110 transition-transform" size={20} />
              <span className="font-medium">Home</span>
            </Link>
            <Link 
              to="/stocks/" 
              className="flex items-center text-white hover:text-blue-200 transition group"
            >
              <LineChart className="mr-2 group-hover:scale-110 transition-transform" size={20} />
              <span className="font-medium"></span>
            </Link>
          </div>
        </div>

        {/* Trending Sectors Section */}
        <div className="flex items-center justify-center space-x-4 mt-3 overflow-x-auto py-2 scrollbar-hide">
          {sectors.map((sector) => (
            <motion.div 
              key={sector.name}
              whileHover={{ scale: 1.05 }}
              className="flex items-center bg-[#1a1c4d] px-3 py-1.5 rounded-lg shadow-md border border-opacity-20 border-white"
            >
              {getTrendIcon(sector.status)}
              <span className="font-medium mr-2 text-white">{sector.name}</span>
              <span className={`${getSectorClass(sector.status)} font-semibold`}>
                {sector.change > 0 ? `+${sector.change}%` : `${sector.change}%`}
              </span>
            </motion.div>
          ))}
        </div>
        
      </div>
    </motion.nav>
  );
};

export default Navbar;