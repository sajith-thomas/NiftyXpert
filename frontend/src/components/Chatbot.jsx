import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Custom SVG Icons
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M22 2L11 13" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M8 3H5C4.44772 3 4 3.44772 4 4V7" strokeWidth="2" />
    <path d="M21 8V5C21 4.44772 20.5523 4 20 4H17" strokeWidth="2" />
    <path d="M3 16V19C3 19.5523 3.44772 20 4 20H7" strokeWidth="2" />
    <path d="M16 21H19C19.5523 21 20 20.5523 20 20V17" strokeWidth="2" />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M8 3V7" strokeWidth="2" />
    <path d="M21 8H17" strokeWidth="2" />
    <path d="M3 16H7" strokeWidth="2" />
    <path d="M16 21V17" strokeWidth="2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 6L18 18" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 19V5" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 12L12 5L19 12" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Chatbot = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const messagesEndRef = useRef(null);

  const welcomeMessages = [
    "Ask me about any stock - TCS, Reliance, Infosys etc.",
    "Try: 'What is the current price of TCS?'",
    "Try: 'Should I invest in Reliance?'",
    "Try: 'Show me technical analysis of Infosys'"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    if (conversation.length === 0) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [conversation]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { sender: "user", text: message };
    setConversation(prev => [...prev, userMessage]);
    setMessage("");

    try {
      setIsTyping(true);
      const res = await axios.post("http://localhost:5000/chatbot", { message });
      const botMessage = { 
        sender: "bot", 
        text: res.data.reply || "Sorry, I didn't understand that. Could you rephrase?" 
      };
      setConversation(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { 
        sender: "bot", 
        text: "⚠️ Connection issue. Please try again in a moment." 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Match this with animation duration
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessage(e);
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((paragraph, i) => (
      <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
    ));
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      className={`fixed bottom-4 right-4 flex flex-col bg-gray-800 rounded-lg shadow-xl overflow-hidden z-50
        ${isExpanded ? "w-96 h-[600px]" : "w-80 h-[400px]"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h3 className="font-semibold">Stock Market Assistant</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
            aria-label={isExpanded ? "Minimize chat" : "Maximize chat"}
          >
            {isExpanded ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {conversation.length === 0 ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center text-gray-400 mt-8">
                <div className="text-lg font-medium mb-2">Welcome!</div>
                <div className="space-y-2 text-sm">
                  {welcomeMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="p-2 bg-gray-700 rounded-lg"
                    >
                      {msg}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence>
            {conversation.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-700 text-white rounded-bl-none"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  {formatMessage(msg.text)}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="px-4 py-2 bg-gray-700 text-white rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.form 
        onSubmit={sendMessage}
        className="p-3 border-t border-gray-700 bg-gray-900"
        layout
      >
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              id="message-input"
              className="w-full p-3 pr-10 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about any stock..."
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('message-input');
                textarea.style.height = 'auto';
                textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
              }}
              className="absolute right-2 bottom-2 text-gray-400 hover:text-white"
              aria-label="Resize input"
            >
              <ArrowUpIcon />
            </button>
          </div>
          <motion.button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            disabled={!message.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendIcon />
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default Chatbot;