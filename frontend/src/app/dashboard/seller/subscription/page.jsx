"use client";

import { useState } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function SellerSubscriptionPage() {
   const { data: session } = useSession();
   const [loading, setLoading] = useState(false);

   const plans = [
      { id: "seller_monthly", label: "1 Month", price: 2500 },
      { id: "seller_quarterly", label: "3 Months", price: 7000 },
      { id: "seller_halfyear", label: "6 Months", price: 13500 },
      { id: "seller_yearly", label: "1 Year", price: 25000 },
   ];

   const handleSubscribe = async (planId) => {
      if (!session?.user?.id) {
         alert("Please log in first.");
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
         if (!res.ok || !data.order) throw new Error("Failed to create order");

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
                  alert("✅ Subscription Activated Successfully!");
                  // 🔄 Refresh NextAuth session
                  await signIn(undefined, { redirect: false });
                  window.location.href = "/dashboard/seller";
               } else {
                  alert("❌ Payment Verification Failed!");
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
         alert("Something went wrong. Please try again.");
      } finally {
         setLoading(false);
      }
   };

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
