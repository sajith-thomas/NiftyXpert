import React from "react";
import Plot from "react-plotly.js";

const StockHeatmap = ({ data }) => {
  return (
    <Plot
      data={[
        {
          z: data,
          type: "heatmap",
          colorscale: "Viridis",
        },
      ]}
      layout={{ title: "Stock Market Heatmap", width: 600, height: 400 }}
    />
  );
};

export default StockHeatmap;
