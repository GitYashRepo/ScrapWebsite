"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Loader/spinner/spinner";
import { AlertCircle, CheckCircle, CreditCard, Store, User } from "lucide-react";

export default function SellerDashboardPage() {
   const { data: session, status } = useSession();
   const [seller, setSeller] = useState(null);
   const [subscription, setSubscription] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         if (status !== "authenticated") {
            setLoading(false);
            return;
         }

         try {
            // 🔹 Fetch seller details
            const res = await fetch(`/api/seller/${session.user.id}`);
            const data = await res.json();
            setSeller(data);

            // 🔹 Fetch subscription info
            const subRes = await fetch(`/api/subscription/check`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  userId: data?._id,
                  userType: "Seller",
               }),
            });

            const subData = await subRes.json();
            if (subRes.ok && subData.active) {
               setSubscription(subData.subscription);
            }
         } catch (err) {
            console.error("Error fetching seller dashboard data:", err);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [status, session]);

   if (loading) return <Spinner />;

   if (!seller)
      return (
         <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <h2 className="text-2xl font-semibold">No Seller Details Found</h2>
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
                     Seller Dashboard
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                     Overview of your business and subscription details
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
               {/* Seller Info */}
               <section>
                  <div className="flex items-center gap-2 mb-6">
                     <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Store size={20} />
                     </div>
                     <h2 className="text-lg font-semibold text-gray-800">
                        Seller Information
                     </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                     <InfoItem label="Company Name" value={seller.storeName} />
                     <InfoItem label="Owner Name" value={seller.ownerName} />
                     <InfoItem label="Seller Code" value={seller.sellerCode} />
                     <InfoItem label="Email" value={seller.email} />
                     <InfoItem label="Phone" value={seller.phone} />
                     <InfoItem label="Address" value={seller.address} />
                     <InfoItem label="City" value={seller.city} />
                     <InfoItem label="State" value={seller.state} />
                     <InfoItem label="Pincode" value={seller.pinCode} />
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
                              .replace("seller_", "")
                              .replace("_", " ")}
                        />
                        <InfoItem
                           label="Amount Paid"
                           value={`₹${subscription.amount?.toLocaleString()}`}
                        />
                        <InfoItem
                           label="Payment ID"
                           value={subscription.paymentId || "—"}
                        />
                        <InfoItem
                           label="Coupon Used"
                           value={subscription.couponCode || "—"}
                        />
                        <InfoItem
                           label="Start Date"
                           value={
                              subscription.startDate
                                 ? new Date(subscription.startDate).toLocaleDateString()
                                 : "—"
                           }
                        />
                        <InfoItem
                           label="End Date"
                           value={
                              subscription.endDate
                                 ? new Date(subscription.endDate).toLocaleDateString()
                                 : "—"
                           }
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

// 🧩 Reusable Info Item
function InfoItem({ label, value }) {
   return (
      <div>
         <p className="text-gray-500 text-xs mb-1">{label}</p>
         <p className="text-gray-900 font-medium break-words">{value || "—"}</p>
      </div>
   );
}
