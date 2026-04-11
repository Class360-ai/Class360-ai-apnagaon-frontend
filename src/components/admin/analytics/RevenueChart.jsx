import React from "react";
import TrendChart from "./TrendChart";
import { formatPrice } from "../../../utils/helpers";

const RevenueChart = ({ data = [] }) => (
  <TrendChart
    title="Revenue over time"
    subtitle="Daily revenue trend"
    data={data}
    valueKey="value"
    formatValue={(value) => formatPrice(value)}
    accentClass="bg-orange-500"
    emptyLabel="No revenue data yet. Revenue will appear here after orders are placed."
  />
);

export default RevenueChart;
