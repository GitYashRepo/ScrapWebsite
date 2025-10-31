"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Loader/spinner/spinner";
import { AlertCircle, CheckCircle, CreditCard, User } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 px-6 py-12 flex justify-center">
         <div className="w-full max-w-5xl space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                     Buyer Dashboard
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                     Overview of your personal and subscription details
                  </p>
               </div>
               {subscription && (
                  <div
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${subscription.status === "active"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                  >
                     {subscription.status === "active" ? (
                        <CheckCircle size={16} />
                     ) : (
                        <AlertCircle size={16} />
                     )}
                     {subscription.status.charAt(0).toUpperCase() +
                        subscription.status.slice(1)}{" "}
                     Subscription
                  </div>
               )}
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-10">
               {/* Buyer Info */}
               <section>
                  <div className="flex items-center gap-2 mb-6">
                     <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <User size={20} />
                     </div>
                     <h2 className="text-lg font-semibold text-gray-800">
                        Personal Information
                     </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                     <InfoItem label="Name" value={buyer.name} />
                     <InfoItem label="Buyer Code" value={buyer.buyerCode} />
                     <InfoItem label="Email" value={buyer.email} />
                     <InfoItem label="Phone" value={buyer.phone} />
                     <InfoItem label="City" value={buyer.city} />
                     <InfoItem label="Pincode" value={buyer.pinCode} />
                     <div className="sm:col-span-2 lg:col-span-3">
                        <InfoItem label="Address" value={buyer.address} />
                     </div>
                  </div>
               </section>

               <div className="border-t border-gray-100" />

               {/* Subscription Info */}
               <section>
                  <div className="flex items-center gap-2 mb-6">
                     <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <CreditCard size={20} />
                     </div>
                     <h2 className="text-lg font-semibold text-gray-800">
                        Subscription & Payment Details
                     </h2>
                  </div>

                  {subscription ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        <InfoItem
                           label="Plan Name"
                           value={subscription.planName
                              .replace("buyer_", "")
                              .replace("_", " ")}
                        />
                        <InfoItem label="Amount Paid" value={`₹${subscription.amount}`} />
                        <InfoItem label="Payment ID" value={subscription.paymentId || "—"} />
                        <InfoItem
                           label="Start Date"
                           value={new Date(subscription.startDate).toLocaleDateString()}
                        />
                        <InfoItem
                           label="End Date"
                           value={new Date(subscription.endDate).toLocaleDateString()}
                        />
                     </div>
                  ) : (
                     <p className="text-gray-500 text-sm">
                        No active subscription found.
                     </p>
                  )}

                  {subscription && (
                     <div className="mt-8">
                        <a
                           href={`/api/invoice/${subscription._id}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm"
                        >
                           🧾 Download Invoice (PDF)
                        </a>
                     </div>
                  )}
               </section>
            </div>
         </div>
      </div>
   );
}


function InfoItem({ label, value }) {
   return (
      <div>
         <p className="text-gray-500 text-xs mb-1">{label}</p>
         <p className="text-gray-900 font-medium break-words">{value || "—"}</p>
      </div>
   );
}
