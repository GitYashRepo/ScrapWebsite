"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Script from "next/script";
import { toast } from "sonner";

export default function AdUploadPage() {
   const { data: session } = useSession();
   const [loading, setLoading] = useState(false);
   const [uploading, setUploading] = useState(false);

   const [form, setForm] = useState({
      companyName: "",
      companyEmail: "",
      companyWebsite: "",
      contactNumber: "",
      title: "",
      description: "",
      price: "",
      discountPrice: "",
      offerDetails: "",
      productImages: [""],
      durationHours: 1,
   });

   const COST_PER_HOUR = 50; // ₹50 per hour

   // Handle image upload
   const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const MAX_SIZE_MB = 2;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
         toast.error(`File too large (max ${MAX_SIZE_MB} MB)`);
         return;
      }

      const formData = new FormData();
      formData.append("file", file);

      setUploading(true);
      const res = await fetch("/api/upload", {
         method: "POST",
         body: formData,
      });

      const data = await res.json();
      setUploading(false);

      if (res.ok) {
         toast.success("Image uploaded successfully!");
         setForm({ ...form, productImages: [data.url] });
      } else {
         toast.error(data.error || "Image upload failed!");
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!session?.user) {
         toast.info("Please log in first.");
         return;
      }

      setLoading(true);
      try {
         const res = await fetch("/api/ads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
         });

         const data = await res.json();
         if (!res.ok || !data.order) {
            throw new Error(data.error || "Failed to create ad order");
         }

         // Razorpay Checkout
         const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "KabaadiMandi Ad Campaign",
            description: `Ad for ${form.title}`,
            order_id: data.order.id,
            handler: async (response) => {
               const verifyRes = await fetch("/api/ads/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
               });

               const verifyData = await verifyRes.json();
               if (verifyRes.ok) {
                  toast.success("✅ Ad payment successful! Your ad is now running.");
                  setForm({
                     companyName: "",
                     companyEmail: "",
                     companyWebsite: "",
                     contactNumber: "",
                     title: "",
                     description: "",
                     price: "",
                     discountPrice: "",
                     offerDetails: "",
                     productImages: [""],
                     durationHours: 1,
                  });
               } else {
                  toast.error("❌ Payment verification failed!");
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
      } catch (err) {
         console.error(err);
         toast.error("Something went wrong while processing payment.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="max-w-2xl mx-auto p-6 min-h-[90vh]">
         <Script src="https://checkout.razorpay.com/v1/checkout.js" />
         <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
            Upload Advertisement
         </h1>

         <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Info */}
            <div>
               <label className="block mb-1 font-semibold">Company Name</label>
               <input
                  type="text"
                  className="border w-full px-3 py-2 rounded"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  required
               />
            </div>

            <div>
               <label className="block mb-1 font-semibold">Company Email</label>
               <input
                  type="email"
                  className="border w-full px-3 py-2 rounded"
                  value={form.companyEmail}
                  onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                  required
               />
            </div>

            <div className="flex gap-4">
               <div className="flex-1">
                  <label className="block mb-1 font-semibold">Company Website</label>
                  <input
                     type="text"
                     className="border w-full px-3 py-2 rounded"
                     value={form.companyWebsite}
                     onChange={(e) =>
                        setForm({ ...form, companyWebsite: e.target.value })
                     }
                  />
               </div>
               <div className="flex-1">
                  <label className="block mb-1 font-semibold">Contact Number</label>
                  <input
                     type="text"
                     className="border w-full px-3 py-2 rounded"
                     value={form.contactNumber}
                     onChange={(e) =>
                        setForm({ ...form, contactNumber: e.target.value })
                     }
                  />
               </div>
            </div>

            {/* Ad Info */}
            <div>
               <label className="block mb-1 font-semibold">Ad Title</label>
               <input
                  type="text"
                  className="border w-full px-3 py-2 rounded"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
               />
            </div>

            <div>
               <label className="block mb-1 font-semibold">Description</label>
               <textarea
                  className="border w-full px-3 py-2 rounded"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                     setForm({ ...form, description: e.target.value })
                  }
                  required
               />
            </div>

            <div className="flex gap-4">
               <div className="flex-1">
                  <label className="block mb-1 font-semibold">Price</label>
                  <input
                     type="number"
                     className="border w-full px-3 py-2 rounded"
                     value={form.price}
                     onChange={(e) => setForm({ ...form, price: e.target.value })}
                     required
                  />
               </div>

               <div className="flex-1">
                  <label className="block mb-1 font-semibold">Discounted Price</label>
                  <input
                     type="number"
                     className="border w-full px-3 py-2 rounded"
                     value={form.discountPrice}
                     onChange={(e) =>
                        setForm({ ...form, discountPrice: e.target.value })
                     }
                  />
               </div>
            </div>

            <div>
               <label className="block mb-1 font-semibold">Offer Details</label>
               <input
                  type="text"
                  className="border w-full px-3 py-2 rounded"
                  value={form.offerDetails}
                  onChange={(e) =>
                     setForm({ ...form, offerDetails: e.target.value })
                  }
               />
            </div>

            {/* Image Upload */}
            <div>
               <label className="block mb-1 font-semibold">Upload Ad Image</label>
               <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border w-full px-3 py-2 rounded"
                  required
               />
               {uploading && (
                  <p className="text-sm text-gray-500 mt-1">Uploading...</p>
               )}
               {form.productImages[0] && (
                  <img
                     src={form.productImages[0]}
                     alt="Preview"
                     className="mt-3 w-32 h-32 object-cover rounded border"
                  />
               )}
            </div>

            {/* Duration */}
            <div>
               <label className="block mb-1 font-semibold">Ad Duration (hours)</label>
               <input
                  type="number"
                  min="1"
                  className="border w-full px-3 py-2 rounded"
                  value={form.durationHours}
                  onChange={(e) =>
                     setForm({ ...form, durationHours: e.target.value })
                  }
                  required
               />
            </div>

            <div className="p-3 bg-blue-50 border rounded text-blue-800 font-semibold">
               Total Cost: ₹{form.durationHours * COST_PER_HOUR}
            </div>

            <button
               type="submit"
               disabled={loading}
               className={`w-full py-3 rounded-lg text-white font-semibold ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
            >
               {loading ? "Processing..." : "Create Ad & Pay"}
            </button>
         </form>
      </div>
   );
}
