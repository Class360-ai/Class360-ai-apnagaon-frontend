import React from "react";
import TrendChart from "./TrendChart";

const OrdersChart = ({ data = [] }) => (
  <TrendChart
    title="Orders over time"
    subtitle="Daily order volume"
    data={data}
    valueKey="orders"
    formatValue={(value) => `${value}`}
    accentClass="bg-emerald-500"
    emptyLabel="No order activity yet. Orders will appear here once customers start checking out."
  />
);

export default OrdersChart;
