import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TrendingSectors = () => {
  const sectors = [
    { name: 'IT', stocks: ['TCS', 'INFY'], change: 1.59, status: 'up' },
    { name: 'Banking', stocks: ['HDFC', 'ICICI'], change: 0.01, status: 'neutral' },
    { name: 'Pharma', stocks: ['SUN', 'CIPLA'], change: -1.18, status: 'down' }
  ];

  const getSectorIcon = (status) => {
    const colors = {
      up: 'text-green-400',
      down: 'text-red-400',
      neutral: 'text-gray-400'
    };

    const icons = {
      up: TrendingUp,
      down: TrendingDown,
      neutral: () => <div className="w-4 h-1 bg-gray-500 rounded"></div>
    };

    const Icon = icons[status];
    return <Icon className={`mr-1 ${colors[status]}`} size={18} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center space-x-6 overflow-x-auto text-sm text-white"
    >
      {sectors.map((sector) => (
        <div 
          key={sector.name}
          className="flex items-center bg-[#1a1c4d] px-3 py-1 rounded-lg shadow-md"
        >
          <span className="font-medium mr-2">{sector.name}</span>
          {getSectorIcon(sector.status)}
          <span>{sector.change}%</span>
        </div>
      ))}
    </motion.div>
  );
};

export default TrendingSectors;
