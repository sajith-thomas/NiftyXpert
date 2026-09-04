import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const LiveStockPrice = () => {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    socket.on("stock_update", (data) => {
      setPrice(data.price);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold">Live Stock Price</h2>
      <p className="text-2xl">₹{price.toFixed(2)}</p>
    </div>
  );
};

export default LiveStockPrice;
