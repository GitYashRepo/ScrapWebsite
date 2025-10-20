"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { toast } from "sonner"


export default function SellerSubscriptionPage() {
   const { data: session } = useSession();
   const [loading, setLoading] = useState(false);
   const [activeSub, setActiveSub] = useState(null);
   const [checking, setChecking] = useState(true);
   const [sellerInfo, setSellerInfo] = useState(null);


   const plans = [
      { id: "seller_monthly", label: "1 Month", price: 2500 },
      { id: "seller_quarterly", label: "3 Months", price: 5000 },
      { id: "seller_halfyear", label: "6 Months", price: 10000 },
      { id: "seller_yearly", label: "1 Year", price: 15000 },
   ];

   // ✅ Fetch seller details
   useEffect(() => {
      if (!session?.user?.id) return;

      const fetchSellerInfo = async () => {
         try {
            const res = await fetch(`/api/seller/${session.user.id}`);
            if (!res.ok) throw new Error("Failed to fetch seller details");
            const data = await res.json();
            setSellerInfo(data);
         } catch (err) {
            console.error("Error fetching seller info:", err);
         }
      };

      fetchSellerInfo();
   }, [session]);


   useEffect(() => {
      if (!session?.user?.id) return;

      const checkSubscription = async () => {
         try {
            const res = await fetch("/api/subscription/check", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  userId: session.user.id,
                  userType: "Seller",
               }),
            });
            const data = await res.json();
            if (data.active) setActiveSub(data.subscription);
         } catch (err) {
            console.error("Error checking subscription:", err);
         } finally {
            setChecking(false);
         }
      };

      checkSubscription();
   }, [session]);

   const handleSubscribe = async (planId) => {
      if (!session?.user?.id) {
         toast.info("Please log in first.");
         return;
      }

      setLoading(true);

      try {
         // 1️⃣ Create order from backend
         const res = await fetch("/api/subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               userId: session.user.id,
               userType: "Seller",
               planName: planId,
            }),
         });

         const data = await res.json();
         if (!res.ok) {
            if (data.active && data.subscription) {
               setActiveSub(data.subscription);
            }
            toast.error(data.error || "Subscription failed.");
            return;
         }

         // 2️⃣ Initialize Razorpay checkout
         const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "KabaadiMandi Seller Subscription",
            description: `Subscription Plan - ${planId}`,
            order_id: data.order.id,
            handler: async (response) => {
               // 3️⃣ Verify payment on backend
               const verifyRes = await fetch("/api/subscription/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
               });

               const verifyData = await verifyRes.json();
               if (verifyRes.ok) {
                  toast.success("✅ Subscription Activated Successfully!");
                  // 🔄 Refresh NextAuth session
                  await signIn(undefined, { redirect: false });
                  window.location.href = "/dashboard/seller";
               } else {
                  toast.error("❌ Payment Verification Failed!");
                  console.error(verifyData);
               }
            },
            prefill: {
               name: session.user.name,
               email: session.user.email,
            },
            theme: { color: "#2563EB" },
         };

         const rzp = new window.Razorpay(options);
         rzp.open();
      } catch (error) {
         console.error(error);
         toast.error("Something went wrong. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   if (checking) return <div className="p-10 text-center text-gray-600">Checking subscription...</div>;

   if (activeSub) {
      return (
         <div className="flex flex-col p-10 items-center">
            {/* ✅ Seller Info Section */}
            {sellerInfo && (
               <div className="mb-8 border border-gray-300 rounded-2xl shadow-lg p-6 bg-white max-w-md mx-auto text-left">
                  <h2 className="text-2xl font-bold mb-3 text-blue-700">Seller Details</h2>
                  <p><strong>Store Name:</strong> {sellerInfo.storeName}</p>
                  <p><strong>Owner Name:</strong> {sellerInfo.ownerName}</p>
                  <p><strong>Email:</strong> {sellerInfo.email}</p>
                  <p><strong>Phone:</strong> {sellerInfo.phone}</p>
                  <p><strong>Address:</strong> {sellerInfo.address}, {sellerInfo.city}, {sellerInfo.state} - {sellerInfo.pinCode}</p>
               </div>
            )}
            {/* ✅ Active Subscription */}
            <div className="border border-gray-300 rounded-2xl shadow-lg p-6 bg-white max-w-md mx-auto">
               <h1 className="text-3xl font-bold mb-6 text-blue-700">
                  Your Active Subscription
               </h1>
               <p className="text-lg font-semibold">
                  Plan: {activeSub.planName.replace("seller_", "").toUpperCase()}
               </p>
               <p>
                  Status:{" "}
                  <span className="text-green-600 font-bold">
                     {activeSub.status}
                  </span>
               </p>
               <p>Start: {new Date(activeSub.startDate).toLocaleDateString()}</p>
               <p>End: {new Date(activeSub.endDate).toLocaleDateString()}</p>
               <p className="mt-4 text-gray-500 text-sm">
                  You can renew after this subscription ends.
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="p-10">
         <Script src="https://checkout.razorpay.com/v1/checkout.js" />
         <h1 className="text-3xl font-bold mb-6 text-center">
            Choose Your Seller Subscription Plan
         </h1>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {plans.map((plan) => (
               <div
                  key={plan.id}
                  className="border border-gray-300 rounded-2xl shadow-lg p-6 flex flex-col items-center bg-white hover:shadow-2xl transition-all"
               >
                  <h2 className="text-2xl font-semibold mb-2 text-blue-700">
                     {plan.label}
                  </h2>
                  <p className="text-gray-600 mb-4 text-center">
                     Access to all seller features for {plan.label.toLowerCase()}.
                  </p>
                  <p className="text-3xl font-bold mb-4">₹{plan.price}</p>
                  <button
                     onClick={() => handleSubscribe(plan.id)}
                     disabled={loading}
                     className={`${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        } text-white px-6 py-2 rounded-lg mt-auto`}
                  >
                     {loading ? "Processing..." : "Subscribe"}
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
}
