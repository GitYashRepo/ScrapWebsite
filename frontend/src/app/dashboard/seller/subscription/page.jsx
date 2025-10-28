"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function SellerSubscriptionPage() {
   const { data: session } = useSession();
   const [loading, setLoading] = useState(false);
   const [activeSub, setActiveSub] = useState(null);
   const [checking, setChecking] = useState(true);
   const [sellerInfo, setSellerInfo] = useState(null);

   // ✅ Coupon logic
   const [couponInput, setCouponInput] = useState("");
   const [appliedCoupon, setAppliedCoupon] = useState(null);
   const [discountedPlans, setDiscountedPlans] = useState([]);


   const basePlans = [
      { id: "seller_monthly", label: "1 Month", price: 2000 },
      { id: "seller_quarterly", label: "3 Months", price: 5000 },
      { id: "seller_halfyear", label: "6 Months", price: 7500 },
      { id: "seller_yearly", label: "1 Year", price: 10000 },
   ];


   // Keep original plan list updated (discount applied or not)
   useEffect(() => {
      setDiscountedPlans(basePlans);
   }, []);


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

   // ✅ Check active subscription
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

   // ✅ Apply Coupon Code
   const handleApplyCoupon = async () => {
      if (!couponInput.trim()) {
         toast.error("Please enter a coupon code!");
         return;
      }

      setLoading(true);
      try {
         const res = await fetch(`/api/admin/coupons/validate?code=${couponInput.trim()}`);
         const data = await res.json();

         if (!res.ok) throw new Error(data.error || "Invalid coupon code");

         if (data.coupon.type === "seller_free_3months") {
            setAppliedCoupon(data.coupon);
            toast.success("🎁 Free 3-Month Coupon Applied! Click Activate button below.");
         } else if (data.coupon.type === "seller_discount") {
            setAppliedCoupon(data.coupon);

            const newPlans = basePlans.map((p) => ({
               ...p,
               price: Math.round(p.price * (1 - data.coupon.discountPercentage / 100)),
            }));

            setDiscountedPlans(newPlans);
            toast.success(`💸 ${data.coupon.discountPercentage}% discount applied!`);
         }
      } catch (err) {
         toast.error(err.message);
      } finally {
         setLoading(false);
      }
   };

   // ✅ Subscription logic
   const handleSubscribe = async (planId) => {
      if (!session?.user?.id) {
         toast.info("Please log in first.");
         return;
      }

      // 3-Month Free Coupon → Skip Razorpay
      if (appliedCoupon?.type === "seller_free_3months") {
         setLoading(true);
         try {
            const res = await fetch("/api/subscription/free", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  userId: session.user.id,
                  userType: "Seller",
                  planName: "seller_quarterly",
                  couponCode: appliedCoupon.code,
               }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to activate free subscription");

            toast.success("🎉 Free 3-Month Subscription Activated!");
            await signIn(undefined, { redirect: false });
            window.location.href = "/dashboard/seller";
         } catch (error) {
            toast.error(error.message);
         } finally {
            setLoading(false);
         }
         return;
      }

      // Normal / Discounted payment flow
      setLoading(true);
      try {
         const res = await fetch("/api/subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               userId: session.user.id,
               userType: "Seller",
               planName: planId,
               couponCode: appliedCoupon?.code || null,
            }),
         });

         const data = await res.json();

         if (!res.ok) {
            toast.error(data.error || "Subscription failed.");
            return;
         }

         if (!data.order && data.subscription?.status === "active") {
            toast.success("🎉 Free Subscription Activated via Coupon!");
            await signIn(undefined, { redirect: false });
            window.location.href = "/dashboard/seller";
            return;
         }

         // ✅ Paid Subscription via Razorpay
         const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "KabaadiMandi Seller Subscription",
            description: `Subscription Plan - ${planId}`,
            order_id: data.order.id,
            handler: async (response) => {
               const verifyRes = await fetch("/api/subscription/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                     ...response,
                     couponCode: appliedCoupon?.code || null, // ✅ include this
                  }),
               });
               const verifyData = await verifyRes.json();
               if (verifyRes.ok) {
                  toast.success("✅ Subscription Activated Successfully!");
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


   if (checking) {
      return <div className="p-10 text-center text-gray-600">Checking subscription...</div>;
   }

   // ✅ Active Subscription UI
   if (activeSub) {
      return (
         <div className="flex flex-col p-10 items-center">

            {sellerInfo && (
               <div className="mb-8 border border-gray-300 rounded-2xl shadow-lg p-6 bg-white max-w-md mx-auto text-left">
                  <h2 className="text-2xl font-bold mb-3 text-blue-700">Seller Details</h2>
                  <p><strong>Store Name:</strong> {sellerInfo.storeName}</p>
                  <p><strong>Owner Name:</strong> {sellerInfo.ownerName}</p>
                  <p><strong>Seller Code:</strong> {sellerInfo.sellerCode}</p>
                  <p><strong>Email:</strong> {sellerInfo.email}</p>
                  <p><strong>Phone:</strong> {sellerInfo.phone}</p>
                  <p><strong>Address:</strong> {sellerInfo.address}, {sellerInfo.city}, {sellerInfo.state} - {sellerInfo.pinCode}</p>
               </div>
            )}

            <div className="border border-gray-300 rounded-2xl shadow-lg p-6 bg-white max-w-md mx-auto">
               <h1 className="text-3xl font-bold mb-6 text-blue-700">Your Active Subscription</h1>
               <p className="text-lg font-semibold">
                  Plan: {activeSub.planName.replace("seller_", "").toUpperCase()}
               </p>
               <p>Status: <span className="text-green-600 font-bold">{activeSub.status}</span></p>
               <p>Start: {new Date(activeSub.startDate).toLocaleDateString()}</p>
               <p>End: {new Date(activeSub.endDate).toLocaleDateString()}</p>
               <p className="mt-4 text-gray-500 text-sm">You can renew after this subscription ends.</p>

               {/* 🔹 Download Invoice Button */}
               {activeSub && (
                  <div className="mt-4">
                     <a
                        href={`/api/invoice/${activeSub._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                     >
                        Download Invoice (PDF)
                     </a>
                  </div>
               )}
            </div>
         </div>
      );
   }

   // ✅ Subscription Plans UI
   return (
      <div className="p-10 max-w-[90vw] min-h-[80vh] mx-auto">
         <Script src="https://checkout.razorpay.com/v1/checkout.js" />
         <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Seller Subscription Plan</h1>

         {/* Subscription Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {discountedPlans.map((plan) => (
               <div
                  key={plan.id}
                  className="border border-gray-300 rounded-2xl shadow-lg p-6 flex flex-col items-center bg-white hover:shadow-2xl transition-all"
               >
                  <h2 className="text-2xl font-semibold mb-2 text-blue-700">{plan.label}</h2>
                  <p className="text-gray-600 mb-4 text-center">
                     Access to all seller features for {plan.label.toLowerCase()}.
                  </p>
                  <p className="text-3xl font-bold mb-4">
                     ₹{plan.price.toLocaleString()}
                     {appliedCoupon?.type === "seller_discount" && (
                        <span className="text-sm text-green-600 block">Discount Applied</span>
                     )}
                  </p>
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

         {/* OR APPLY COUPON CODE */}
         <div className="max-w-md mx-auto mt-10 text-center">
            <h2 className="text-xl font-bold mb-3 text-gray-800">OR APPLY COUPON CODE</h2>
            <div className="flex gap-2">
               <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
               />
               <button
                  onClick={handleApplyCoupon}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                     }`}
               >
                  Apply
               </button>
            </div>

            {appliedCoupon?.type === "seller_free_3months" && (
               <button
                  onClick={() => handleSubscribe("seller_quarterly")}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
               >
                  🎉 Activate Free 3-Month Subscription
               </button>
            )}
         </div>
      </div>
   );
}
