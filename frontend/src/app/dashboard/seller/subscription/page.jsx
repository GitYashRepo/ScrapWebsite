"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function SellerSubscriptionPage() {
   const { data: session } = useSession();
   const [loading, setLoading] = useState(false);
   const [loadingPlanId, setLoadingPlanId] = useState(null);
   const [activeSub, setActiveSub] = useState(null);
   const [checking, setChecking] = useState(true);
   const [sellerInfo, setSellerInfo] = useState(null);

   const [couponInput, setCouponInput] = useState("");
   const [appliedCoupon, setAppliedCoupon] = useState(null);
   const [discountedPlans, setDiscountedPlans] = useState([]);

   const basePlans = [
      { id: "seller_monthly", label: "1 Month", price: 2000 },
      { id: "seller_quarterly", label: "3 Months", price: 5000 },
      { id: "seller_halfyear", label: "6 Months", price: 7500 },
      { id: "seller_yearly", label: "1 Year", price: 10000 },
   ];

   useEffect(() => {
      setDiscountedPlans(basePlans);
   }, []);

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
            toast.success("🎁 Free 3-Month Coupon Applied!");
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

   const handleSubscribe = async (planId) => {
      if (!session?.user?.id) {
         toast.info("Please log in first.");
         return;
      }

      setLoadingPlanId(planId);
      // 3-Month Free Coupon flow
      if (appliedCoupon?.type === "seller_free_3months") {
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
            if (!res.ok) throw new Error(data.error || "Failed to activate subscription");
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

      // Normal payment flow
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
                     couponCode: appliedCoupon?.code || null,
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

   // ✅ Redesigned Active Subscription Layout
   if (activeSub) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-100 p-6">
            <div className="relative w-full max-w-4xl bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
                  <div>
                     <h1 className="text-2xl font-bold tracking-wide">Seller Subscription Details</h1>
                     <p className="text-blue-100 text-sm mt-1">Account Overview & Payment Summary</p>
                  </div>
                  <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">
                     {activeSub.status.toUpperCase()}
                  </div>
               </div>

               <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Seller Info */}
                  <div className="space-y-3">
                     <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-blue-600">🧾</span> Seller Information
                     </h2>
                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-gray-700 text-sm">
                        <p><span className="font-semibold">Store Name:</span> {sellerInfo?.storeName}</p>
                        <p><span className="font-semibold">Owner:</span> {sellerInfo?.ownerName}</p>
                        <p><span className="font-semibold">Seller Code:</span> {sellerInfo?.sellerCode}</p>
                        <p><span className="font-semibold">Email:</span> {sellerInfo?.email}</p>
                        <p><span className="font-semibold">Phone:</span> {sellerInfo?.phone}</p>
                        <p>
                           <span className="font-semibold">Address:</span>{" "}
                           {sellerInfo?.address}, {sellerInfo?.city}, {sellerInfo?.state} - {sellerInfo?.pinCode}
                        </p>
                     </div>
                  </div>

                  {/* Subscription Info */}
                  <div className="space-y-3">
                     <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-green-600">💳</span> Subscription & Payment
                     </h2>
                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-gray-700 text-sm">
                        <p><span className="font-semibold">Plan:</span> {activeSub.planName.replace("seller_", "").toUpperCase()}</p>
                        <p><span className="font-semibold">Status:</span> <span className="text-green-500">"{activeSub.status}"</span></p>
                        <p><span className="font-semibold">Start Date:</span> {new Date(activeSub.startDate).toLocaleDateString()}</p>
                        <p><span className="font-semibold">End Date:</span> {new Date(activeSub.endDate).toLocaleDateString()}</p>
                        {activeSub.amountPaid && (
                           <p><span className="font-semibold">Amount Paid:</span> ₹{activeSub.amountPaid.toLocaleString()}</p>
                        )}
                        {activeSub.paymentId && (
                           <p><span className="font-semibold">Payment ID:</span> {activeSub.paymentId}</p>
                        )}
                        {activeSub.couponCode && (
                           <p><span className="font-semibold">Coupon Used:</span> {activeSub.couponCode}</p>
                        )}
                     </div>

                     <a
                        href={`/api/invoice/${activeSub._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-full shadow-md text-sm font-medium transition-all"
                     >
                        🧾 Download Invoice (PDF)
                     </a>
                  </div>
               </div>

               <div className="bg-gray-100 border-t px-6 py-3 text-sm text-gray-500 text-center">
                  You can renew or upgrade your plan after this subscription ends.
               </div>
            </div>
         </div>
      );
   }

   // Plans UI (unchanged)
   return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-10">
         <Script src="https://checkout.razorpay.com/v1/checkout.js" />
         <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-blue-700 mb-3">Choose Your Seller Subscription Plan</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
               Select a plan that suits your business needs. Each plan gives you full access to our seller tools and dedicated support.
            </p>
         </div>

         {/* Plan Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {discountedPlans.map((plan, index) => (
               <div
                  key={plan.id}
                  className={`relative group rounded-2xl border shadow-md hover:shadow-xl transition-all bg-white overflow-hidden ${index === 3 ? "border-blue-600" : "border-gray-200"
                     }`}
               >
                  {index === 3 && (
                     <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs py-1 text-center font-medium">
                        ⭐ Most Popular
                     </div>
                  )}
                  <div className="p-6 flex flex-col h-full">
                     <h2 className="text-2xl font-semibold text-blue-700 mb-2">{plan.label}</h2>
                     <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>
                     <p className="text-4xl font-bold text-gray-800 mb-4">
                        ₹{plan.price.toLocaleString()}
                        {appliedCoupon?.type === "seller_discount" && (
                           <span className="block text-sm text-green-600 mt-1">Discount Applied</span>
                        )}
                     </p>
                     <ul className="text-sm text-gray-600 mb-6 space-y-1">
                        <li>✔️ Access to all premium seller tools</li>
                        <li>✔️ Priority customer support</li>
                        <li>✔️ Secure payment processing</li>
                     </ul>
                     <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loadingPlanId === plan.id}
                        className={`mt-auto py-2.5 rounded-xl font-semibold text-white transition-all ${loadingPlanId === plan.id
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

         {/* Coupon Section */}
         <div className="max-w-lg mx-auto mt-16 text-center">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8">
               <h2 className="text-2xl font-semibold mb-4 text-gray-800">Have a Coupon Code?</h2>
               <p className="text-gray-500 mb-6 text-sm">
                  Enter your coupon below to get discounts or special offers.
               </p>
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
                     className={`px-5 py-2 rounded-lg text-white text-sm font-medium ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                  >
                     Apply
                  </button>
               </div>

               {appliedCoupon && (
                  <div className="mt-4 p-3 border border-green-300 bg-green-50 text-green-700 rounded-lg text-sm">
                     🎉 Coupon <strong>{appliedCoupon.code}</strong> applied successfully!
                  </div>
               )}

               {appliedCoupon?.type === "seller_free_3months" && (
                  <button
                     onClick={() => handleSubscribe("seller_quarterly")}
                     className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium"
                  >
                     🎁 Activate Free 3-Month Subscription
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}
