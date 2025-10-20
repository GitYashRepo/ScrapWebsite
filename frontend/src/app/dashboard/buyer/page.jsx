"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Loader/spinner/spinner";

export default function BuyerDashboardPage() {
   const { data: session, status } = useSession();
   const [buyer, setBuyer] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (status === "authenticated") {
         const fetchBuyer = async () => {
            try {
               const res = await fetch(`/api/buyer/${session.user.email}`);
               const data = await res.json();
               setBuyer(data);
            } catch (err) {
               console.error("Error fetching buyer:", err);
            } finally {
               setLoading(false);
            }
         };
         fetchBuyer();
      } else if (status === "unauthenticated") {
         setLoading(false);
      }
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

         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
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
      </div>
   );
}
