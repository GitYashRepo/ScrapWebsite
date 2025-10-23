"use client";
import { useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d"];

const UserStatsChart = ({ sellers = [], buyers = [] }) => {
   const [chartType, setChartType] = useState("line");

   const chartData = useMemo(() => {
      if (!sellers.length && !buyers.length) return [];

      const datesSet = new Set([
         ...sellers.map(d => `${d._id.year}-${d._id.month}-${d._id.day}`),
         ...buyers.map(d => `${d._id.year}-${d._id.month}-${d._id.day}`),
      ]);

      const sortedDates = Array.from(datesSet).sort(); // safer lexicographic sort

      return sortedDates.map(dateStr => {
         const [year, month, day] = dateStr.split("-").map(Number);

         const seller = sellers.find(d => d._id.year === year && d._id.month === month && d._id.day === day);
         const buyer = buyers.find(d => d._id.year === year && d._id.month === month && d._id.day === day);

         const formattedDay = String(day).padStart(2, "0");
         const formattedMonth = String(month).padStart(2, "0");

         return {
            date: `${formattedDay}-${formattedMonth}`,
            Sellers: seller?.count || 0,
            Buyers: buyer?.count || 0,
         };
      });
   }, [sellers, buyers]);

   return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">👥 User Signups</h2>
            <select value={chartType} onChange={e => setChartType(e.target.value)} className="border rounded-lg p-2 text-sm">
               <option value="line">Line Chart</option>
               <option value="bar">Bar Chart</option>
            </select>
         </div>
         <ResponsiveContainer width="100%" height={350}>
            {chartType === "line" ? (
               <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Sellers" stroke={COLORS[0]} />
                  <Line type="monotone" dataKey="Buyers" stroke={COLORS[1]} />
               </LineChart>
            ) : (
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Sellers" fill={COLORS[0]} />
                  <Bar dataKey="Buyers" fill={COLORS[1]} />
               </BarChart>
            )}
         </ResponsiveContainer>
      </div>
   );
};

export default UserStatsChart;
