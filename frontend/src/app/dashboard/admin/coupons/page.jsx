"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminCouponsPage() {
   const [coupons, setCoupons] = useState([]);
   const [loading, setLoading] = useState(false);
   const [form, setForm] = useState({
      code: "",
      type: "seller_discount",
      discountPercentage: "",
   });

   // ✅ Fetch all coupons
   const fetchCoupons = async () => {
      try {
         const res = await fetch("/api/admin/coupons");
         const data = await res.json();
         if (!res.ok) throw new Error(data.error || "Failed to fetch coupons");
         setCoupons(data.coupons || []);
      } catch (error) {
         console.error(error);
         toast.error("Failed to load coupons");
      }
   };

   useEffect(() => {
      fetchCoupons();
   }, []);

   // ✅ Create new coupon
   const handleCreate = async () => {
      if (!form.code.trim()) {
         toast.error("Please enter a coupon code");
         return;
      }

      if (form.type === "seller_discount" && !form.discountPercentage) {
         toast.error("Please enter discount percentage");
         return;
      }

      setLoading(true);
      try {
         const res = await fetch("/api/admin/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
         });

         const data = await res.json();

         if (!res.ok) {
            toast.error(data.error || "Failed to create coupon");
            return;
         }

         toast.success("✅ Coupon created successfully!");
         setForm({
            code: "",
            type: "seller_discount",
            discountPercentage: "",
         });
         fetchCoupons();
      } catch (error) {
         console.error(error);
         toast.error("Something went wrong");
      } finally {
         setLoading(false);
      }
   };

   // ✅ Delete coupon
   const handleDelete = async (id) => {
      if (!confirm("Are you sure you want to delete this coupon?")) return;
      try {
         const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
         const data = await res.json();

         if (!res.ok) {
            toast.error(data.error || "Failed to delete coupon");
            return;
         }

         toast.success("🗑 Coupon deleted successfully");
         fetchCoupons();
      } catch (error) {
         console.error(error);
         toast.error("Delete failed");
      }
   };

   return (
      <div className="p-10">
         <h1 className="text-3xl font-bold mb-6 text-blue-700">🎟 Manage Coupons</h1>

         {/* 🧾 Coupon Creation Form */}
         <div className="border border-gray-300 rounded-2xl p-6 bg-white shadow-lg max-w-md mb-10">
            <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>

            <input
               type="text"
               placeholder="Coupon Code (e.g. SELLER30 / FREE3MONTHS)"
               value={form.code}
               onChange={(e) => setForm({ ...form, code: e.target.value })}
               className="w-full border rounded-lg px-4 py-2 mb-3"
            />

            <select
               value={form.type}
               onChange={(e) => setForm({ ...form, type: e.target.value })}
               className="w-full border rounded-lg px-4 py-2 mb-3"
            >
               <option value="seller_discount">Seller Discount (%)</option>
               <option value="seller_free_3months">
                  Seller Free 3-Month Subscription
               </option>
            </select>

            {/* Show discount field only if type = seller_discount */}
            {form.type === "seller_discount" && (
               <input
                  type="number"
                  placeholder="Discount Percentage"
                  value={form.discountPercentage}
                  onChange={(e) =>
                     setForm({ ...form, discountPercentage: e.target.value })
                  }
                  className="w-full border rounded-lg px-4 py-2 mb-3"
               />
            )}

            <button
               onClick={handleCreate}
               disabled={loading}
               className={`w-full ${
                  loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
               } text-white py-2 rounded-lg transition`}
            >
               {loading ? "Creating..." : "Create Coupon"}
            </button>
         </div>

         {/* 🧾 Coupons Table */}
         <h2 className="text-2xl font-bold mb-3">Active Coupons</h2>
         <div className="overflow-x-auto border border-gray-300 rounded-2xl bg-white shadow-lg">
            <table className="w-full border-collapse">
               <thead className="bg-blue-100">
                  <tr>
                     <th className="px-4 py-2 border">Code</th>
                     <th className="px-4 py-2 border">Type</th>
                     <th className="px-4 py-2 border">Discount %</th>
                     <th className="px-4 py-2 border">Details</th>
                     <th className="px-4 py-2 border">Action</th>
                  </tr>
               </thead>
               <tbody>
                  {coupons.length === 0 ? (
                     <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">
                           No coupons found
                        </td>
                     </tr>
                  ) : (
                     coupons.map((c) => (
                        <tr key={c._id} className="text-center hover:bg-gray-50">
                           <td className="border px-4 py-2 font-semibold">{c.code}</td>
                           <td className="border px-4 py-2 capitalize">
                              {c.type === "seller_free_3months"
                                 ? "🎁 Free 3-Month Plan"
                                 : "💸 Discount Coupon"}
                           </td>
                           <td className="border px-4 py-2">
                              {c.type === "seller_discount"
                                 ? `${c.discountPercentage}%`
                                 : "—"}
                           </td>
                           <td className="border px-4 py-2 text-gray-600">
                              {c.type === "seller_free_3months"
                                 ? "Gives seller 3 months of free access (₹0)"
                                 : "Applies percentage discount at checkout"}
                           </td>
                           <td className="border px-4 py-2">
                              <button
                                 onClick={() => handleDelete(c._id)}
                                 className="text-red-600 hover:underline"
                              >
                                 Delete
                              </button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
}
