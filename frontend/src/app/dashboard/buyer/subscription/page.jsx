"use client";

import { useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { toast } from "sonner"


export default function BuyerSubscriptionPage() {
   const { data: session } = useSession();
   // const [loading, setLoading] = useState(false);
   const [loadingPlanId, setLoadingPlanId] = useState(null);

   const plans = [
      { id: "buyer_monthly", label: "1 Month", price: 200 },
      { id: "buyer_quarterly", label: "3 Months", price: 500 },
      { id: "buyer_halfyear", label: "6 Months", price: 750 },
      { id: "buyer_yearly", label: "1 Year", price: 1000 },
   ];

   const handleSubscribe = async (planId) => {
      if (!session?.user?.id) {
         toast.info("Please log in first.");
         return;
      }

      setLoadingPlanId(planId);

      try {
         // 1️⃣ Create order from backend
         const res = await fetch("/api/subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               userId: session.user.id,
               userType: "Buyer",
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
            name: "KabaadMandi Buyer Subscription",
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
                  window.location.href = "/dashboard/buyer";
               } else {
                  toast.warning("❌ Payment Verification Failed!");
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
         setLoadingPlanId(null);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-6">
         <Script src="https://checkout.razorpay.com/v1/checkout.js" />
         <div className="text-center mb-14">
            <h1 className="text-4xl font-extrabold text-blue-700 mb-3">
               Choose Your Buyer Subscription Plan
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
               Unlock full buyer benefits like premium access, faster responses, and verified seller connections.
            </p>
         </div>

         {/* Plans */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
               <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all border ${index === 3 ? "border-blue-600" : "border-gray-200"
                     }`}
               >
                  {index === 3 && (
                     <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs py-1 text-center font-medium rounded-t-2xl">
                        ⭐ Most Popular
                     </div>
                  )}
                  <div className="p-8 flex flex-col h-full items-center text-center">
                     <h2 className="text-2xl font-bold text-blue-700 mb-2">{plan.label}</h2>
                     <p className="text-gray-600 text-sm mb-6">{plan.desc}</p>
                     <p className="text-4xl font-extrabold text-gray-800 mb-4">
                        ₹{plan.price}
                     </p>

                     <ul className="text-sm text-gray-600 mb-6 space-y-1 text-left">
                        <li>✔️ Access to all buyer listings</li>
                        <li>✔️ View verified sellers</li>
                        <li>✔️ Priority support</li>
                     </ul>

                     <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loadingPlanId === plan.id}
                        className={`mt-auto py-2.5 w-full rounded-xl font-semibold text-white transition-all ${loadingPlanId === plan.id
                           ? "bg-gray-400 cursor-not-allowed"
                           : "bg-blue-600 hover:bg-blue-700"
                           }`}
                     >
                        {loadingPlanId === plan.id ? "Processing..." : "Subscribe Now"}
                     </button>
                  </div>
               </div>
            ))}
         </div>

         {/* Trust Section */}
         <div className="max-w-3xl mx-auto text-center mt-16 border-t border-gray-200 pt-8">
            <p className="text-gray-600 font-medium mb-4">Trusted by 5,000+ Buyers</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
               <div className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">🔒</span> Secure Payment
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-lg">✅</span> Verified by Razorpay
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">⭐</span> Trusted Platform
               </div>
            </div>
         </div>
      </div>
   );
}
