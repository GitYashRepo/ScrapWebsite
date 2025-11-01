"use client";
import { useEffect, useState } from "react";
import ChatsTable from "./ChatsTable";
import Spinner from "@/components/Loader/spinner/spinner";

const AdminDashboard = () => {
   const [stats, setStats] = useState(null);
   const [chats, setChats] = useState([]);

   useEffect(() => {
      fetch("/api/admin/stats")
         .then((res) => res.json())
         .then(setStats);
      fetch("/api/admin/chats")
         .then((res) => res.json())
         .then(setChats);
   }, []);

   if (!stats) {
      return (
         <div className="fllex items-center justify-center">
            <Spinner />
         </div>
      )
   }

   return (
      <div className="p-6 max-w-7xl mx-auto space-y-10">
         <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>

         {/* ====== OVERVIEW STATS ====== */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard title="🧑‍💼 Sellers" value={stats.sellerCount} />
            <StatCard title="🛍️ Buyers" value={stats.buyerCount} />
            <StatCard title="📦 Active Subscriptions" value={stats.totalSubscriptions} />
            <StatCard title="💰 Total Revenue (₹)" value={stats.totalRevenue.toLocaleString()} />
         </div>

         {/* ====== SEPARATE REVENUE CARDS ====== */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard
               title="🧑‍💼 Total Seller Subscriptions Value"
               value={`₹${stats.sellerRevenue.toLocaleString()}`}
               subtitle={`Number of Subscriptions: ${stats.sellerSubs}`}
            />
            <StatCard
               title="🛍️ Total Buyer Subscriptions Value"
               value={`₹${stats.buyerRevenue.toLocaleString()}`}
               subtitle={`Number of Subscriptions: ${stats.buyerSubs}`}
            />
         </div>

         {/* ====== CHAT TABLE ====== */}
         <div>
            <h2 className="text-2xl font-semibold mt-8 mb-4">💬 Ongoing Conversations</h2>
            <ChatsTable data={chats} />
         </div>
      </div>
   );
};

// ====== REUSABLE CARD COMPONENT ======
const StatCard = ({ title, value, subtitle }) => (
   <div className="bg-white p-6 rounded-2xl shadow text-center hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
   </div>
);

export default AdminDashboard;
