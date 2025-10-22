"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Loader/spinner/spinner";

export default function BuyerDashboardPage() {
   const { data: session, status } = useSession();
   const [buyer, setBuyer] = useState(null);
   const [subscription, setSubscription] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         if (status !== "authenticated") {
            setLoading(false);
            return;
         }

         try {
            // 🔹 Fetch buyer details
            const res = await fetch(`/api/buyer/${session.user.email}`);
            const data = await res.json();
            setBuyer(data);

            // 🔹 Fetch active subscription
            const subRes = await fetch(`/api/subscription/check`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  userId: data?._id,
                  userType: "Buyer",
               }),
            });

            const subData = await subRes.json();
            if (subRes.ok && subData.active) {
               setSubscription(subData.subscription);
            }
         } catch (err) {
            console.error("Error fetching data:", err);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [status, session]);

   if (loading) return <Spinner />;

   if (!buyer)
      return (
         <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <h2 className="text-2xl font-semibold">No Buyer Details Found</h2>
            <p className="text-gray-500 mt-2">
               Please log in to view your dashboard.
            </p>
         </div>
      );

   return (
      <div className="max-w-3xl mx-auto p-6">
         <h1 className="text-3xl font-bold mb-6 text-center">Buyer Dashboard</h1>

         {/* 🔹 Buyer Details */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 mb-8">
            <h2 className="text-xl font-semibold mb-2">Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p className="text-lg font-semibold">{buyer.name}</p>
               </div>
               <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="text-lg font-semibold">{buyer.email}</p>
               </div>
               <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="text-lg font-semibold">{buyer.phone}</p>
               </div>
               <div>
                  <p className="text-gray-500 text-sm">City</p>
                  <p className="text-lg font-semibold">{buyer.city}</p>
               </div>
               <div className="sm:col-span-2">
                  <p className="text-gray-500 text-sm">Address</p>
                  <p className="text-lg font-semibold">{buyer.address}</p>
               </div>
               <div>
                  <p className="text-gray-500 text-sm">Pincode</p>
                  <p className="text-lg font-semibold">{buyer.pinCode}</p>
               </div>
            </div>
         </div>

         {/* 🔹 Subscription Details */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Active Subscription</h2>

            {subscription ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <p className="text-gray-500 text-sm">Plan Name</p>
                     <p className="text-lg font-semibold capitalize">
                        {subscription.planName.replace("buyer_", "").replace("_", " ")}
                     </p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-sm">Amount</p>
                     <p className="text-lg font-semibold">
                        ₹{subscription.amount}
                     </p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-sm">Start Date</p>
                     <p className="text-lg font-semibold">
                        {new Date(subscription.startDate).toLocaleDateString()}
                     </p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-sm">End Date</p>
                     <p className="text-lg font-semibold">
                        {new Date(subscription.endDate).toLocaleDateString()}
                     </p>
                  </div>
                  <div>
                     <p className="text-gray-500 text-sm">Status</p>
                     <p
                        className={`text-lg font-semibold ${subscription.status === "active"
                           ? "text-green-600"
                           : "text-red-600"
                           }`}
                     >
                        {subscription.status}
                     </p>
                  </div>
               </div>
            ) : (
               <p className="text-gray-500 text-center">
                  No active subscription found.
               </p>
            )}
         </div>
      </div>
   );
}
