"use client";
import { useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d"];

const SubscriptionStatsChart = ({ dailySubs = [], monthRevenue = [] }) => {
   const [chartType, setChartType] = useState("bar");

   const chartData = useMemo(() => {
      const datesSet = new Set(dailySubs.map(d => `${d._id.year}-${d._id.month}-${d._id.day}`));
      const sortedDates = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));

      return sortedDates.map(date => {
         const [year, month, day] = date.split("-").map(Number);
         const seller = dailySubs.find(d => d._id.year === year && d._id.month === month && d._id.day === day && d._id.userType === "Seller");
         const buyer = dailySubs.find(d => d._id.year === year && d._id.month === month && d._id.day === day && d._id.userType === "Buyer");
         return {
            date: `${day}-${month}`,
            SellerRevenue: seller?.totalAmount || 0,
            BuyerRevenue: buyer?.totalAmount || 0,
         };
      });
   }, [dailySubs]);

   return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">💰 Subscription Revenue (This Month: ₹{monthRevenue})</h2>
            <select value={chartType} onChange={e => setChartType(e.target.value)} className="border rounded-lg p-2 text-sm">
               <option value="bar">Bar Chart</option>
               <option value="line">Line Chart</option>
            </select>
         </div>
         <ResponsiveContainer width="100%" height={350}>
            {chartType === "bar" ? (
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="SellerRevenue" fill={COLORS[0]} />
                  <Bar dataKey="BuyerRevenue" fill={COLORS[1]} />
               </BarChart>
            ) : (
               <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="SellerRevenue" stroke={COLORS[0]} />
                  <Line type="monotone" dataKey="BuyerRevenue" stroke={COLORS[1]} />
               </LineChart>
            )}
         </ResponsiveContainer>
      </div>
   );
};

export default SubscriptionStatsChart;
