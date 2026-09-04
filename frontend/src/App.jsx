import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import MarqueeTicker from "./components/MarqueeTicker";
import DisclaimerModal from "./components/DisclaimerModal";
import StockPredictionContent from "./components/StockPredictionContent";
import Chatbot from "./components/Chatbot";
import "./styles/index.css";

function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowDisclaimer(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const toggleChatbot = () => {
    setChatbotOpen(!chatbotOpen);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          onLogin={handleLogin} 
          onLogout={handleLogout}
          toggleChatbot={toggleChatbot}
        />
        <MarqueeTicker />

        <AnimatePresence>
          {showDisclaimer && (
            <DisclaimerModal 
              isOpen={showDisclaimer} 
              onClose={() => setShowDisclaimer(false)} 
            />
          )}
        </AnimatePresence>

        <main className="flex-grow">
          <div className="container mx-auto p-4">
            <StockPredictionContent />
          </div>
        </main>

        {/* Chatbot Implementation */}
        <div className="fixed bottom-6 right-6 z-50">
          {chatbotOpen ? (
            <div className="w-80 bg-gray-800 text-white rounded-lg shadow-xl overflow-hidden">
              <div className="p-3 bg-blue-600 flex justify-between items-center">
                <h3 className="font-bold">Stock Market Assistant</h3>
                <button 
                  onClick={toggleChatbot}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <Chatbot />
            </div>
          ) : (
            <button
              onClick={toggleChatbot}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg text-white transition-colors"
              aria-label="Open chatbot"
            >
              💬
            </button>
          )}
        </div>

        <footer className="bg-gradient-to-r from-navy-900 to-indigo-900 py-4 text-center text-gray-300">
          <p>© {new Date().getFullYear()} NiftyXpert</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;