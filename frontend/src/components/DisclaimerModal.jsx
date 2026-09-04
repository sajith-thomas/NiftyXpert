import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DisclaimerModal = ({ isOpen, onClose }) => {
  const [accepted, setAccepted] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Check session storage on component mount
  useEffect(() => {
    const disclaimerShown = sessionStorage.getItem('disclaimerShown');
    if (!disclaimerShown && isOpen) {
      setShowSessionModal(true);
      sessionStorage.setItem('disclaimerShown', 'true');
    }
  }, [isOpen]);

  const handleAccept = () => {
    if (accepted) {
      onClose();
      setShowSessionModal(false);
    }
  };

  // Only show modal if it's open AND it's a new session
  const shouldShowModal = isOpen && showSessionModal;

  return (
    <AnimatePresence>
      {shouldShowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-red-600">Disclaimer</h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                The information provided on this platform is for educational and 
                informational purposes only. It should not be considered as financial 
                or investment advice.
              </p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Investments are subject to market risks</li>
                <li>Past performance does not guarantee future results</li>
                <li>Always conduct your own research before investing</li>
                <li>Consult with a qualified financial advisor</li>
              </ul>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="accept-disclaimer" 
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <label 
                  htmlFor="accept-disclaimer" 
                  className="text-gray-900 dark:text-gray-200"
                >
                  I understand and accept the risks
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={() => {
                  onClose();
                  setShowSessionModal(false);
                }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAccept}
                disabled={!accepted}
                className={`px-4 py-2 rounded-lg ${
                  accepted 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                }`}
              >
                Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;