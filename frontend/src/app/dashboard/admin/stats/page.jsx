"use client";
import { useEffect, useState } from "react";
import UserStatsChart from "../UserStatsChart";
import SubscriptionStatsChart from "../SubscriptionStatsChart";
import Spinner from "@/components/Loader/spinner/spinner";

const SubscriptionPage = () => {
   const [stats, setStats] = useState(null);
   const [subs, setSubs] = useState([]);

   useEffect(() => {
      fetch("/api/admin/stats")
         .then(res => res.json())
         .then(setStats);

      fetch("/api/admin/subscriptions")
         .then(res => res.json())
         .then(data => setSubs(data));
   }, []);

   if (!stats) {
      return (
         <div className="fllex items-center justify-center">
            <Spinner />
         </div>
      )
   }

   return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* <UserStatsChart sellers={stats.dailySellers} buyers={stats.dailyBuyers} /> */}
         <SubscriptionStatsChart dailySubs={subs.dailySubs} monthRevenue={subs.monthRevenue} />
      </div>
   );
};

export default SubscriptionPage;
