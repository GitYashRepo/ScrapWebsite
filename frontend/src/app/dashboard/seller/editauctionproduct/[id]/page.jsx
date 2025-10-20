"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Spinner from "@/components/Loader/spinner/spinner";

export default function EditAuctionProductPage() {
   const { id } = useParams();
   const router = useRouter();
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      if (!id) return;
      const fetchProduct = async () => {
         try {
            const res = await fetch(`/api/auctionproduct/${id}`);
            const data = await res.json();
            if (res.ok) setProduct(data);
            else toast.error(data.error || "Failed to fetch auction product");
         } catch (err) {
            toast.error("Error fetching product");
         } finally {
            setLoading(false);
         }
      };
      fetchProduct();
   }, [id]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);

      try {
         const res = await fetch(`/api/auctionproduct/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
         });

         const data = await res.json();

         if (res.ok) {
            toast.success("✅ Auction product updated successfully!");
            router.push("/dashboard/seller");
         } else {
            toast.error(data.error || "Failed to update product");
         }
      } catch (err) {
         toast.error("Error updating auction product");
      } finally {
         setSaving(false);
      }
   };

   if (loading) return <Spinner />;

   if (!product)
      return (
         <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <h2 className="text-2xl font-semibold">Auction Product not found</h2>
         </div>
      );

   return (
      <div className="max-w-3xl mx-auto p-6">
         <h1 className="text-3xl font-bold mb-6 text-center">Edit Auction Product</h1>

         <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6"
         >
            {/* Name */}
            <div>
               <label className="block text-sm font-medium text-gray-500">Name</label>
               <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full mt-1 border rounded p-2"
                  required
               />
            </div>

            {/* Description */}
            <div>
               <label className="block text-sm font-medium text-gray-500">Description</label>
               <textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  className="w-full mt-1 border rounded p-2"
                  rows={4}
                  required
               />
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-500">Price per Kg</label>
                  <input
                     type="number"
                     value={product.pricePerKg}
                     onChange={(e) =>
                        setProduct({ ...product, pricePerKg: Number(e.target.value) })
                     }
                     className="w-full mt-1 border rounded p-2"
                     required
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-500">Quantity</label>
                  <input
                     type="number"
                     value={product.quantity}
                     onChange={(e) =>
                        setProduct({ ...product, quantity: Number(e.target.value) })
                     }
                     className="w-full mt-1 border rounded p-2"
                     required
                  />
               </div>
            </div>

            {/* Auction Start & End */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-500">Auction Start</label>
                  <input
                     type="datetime-local"
                     value={
                        product.auctionStart
                           ? new Date(product.auctionStart).toISOString().slice(0, 16)
                           : ""
                     }
                     onChange={(e) =>
                        setProduct({ ...product, auctionStart: new Date(e.target.value) })
                     }
                     className="w-full mt-1 border rounded p-2"
                     required
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-500">Auction End</label>
                  <input
                     type="datetime-local"
                     value={
                        product.auctionEnd
                           ? new Date(product.auctionEnd).toISOString().slice(0, 16)
                           : ""
                     }
                     onChange={(e) =>
                        setProduct({ ...product, auctionEnd: new Date(e.target.value) })
                     }
                     className="w-full mt-1 border rounded p-2"
                     required
                  />
               </div>
            </div>

            {/* Status */}
            <div>
               <label className="block text-sm font-medium text-gray-500">Status</label>
               <select
                  value={product.status}
                  onChange={(e) => setProduct({ ...product, status: e.target.value })}
                  className="w-full mt-1 border rounded p-2"
               >
                  <option value="available">Available</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
               </select>
            </div>

            {/* Submit */}
            <button
               type="submit"
               disabled={saving}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
               {saving ? "Saving..." : "Save Changes"}
            </button>
         </form>
      </div>
   );
}
