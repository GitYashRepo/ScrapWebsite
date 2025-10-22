"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Spinner from "@/components/Loader/spinner/spinner";

export default function EditProductPage() {
   const { id } = useParams();
   const { data: session, status } = useSession();
   const router = useRouter();

   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);

   // 🔹 Fetch product by ID
   useEffect(() => {
      if (!id) return;
      const fetchProduct = async () => {
         try {
            const res = await fetch(`/api/product/${id}`);
            const data = await res.json();
            if (res.ok) setProduct(data);
            else toast.error(data.error || "Failed to fetch product");
         } catch (err) {
            toast.error("Error fetching product");
         } finally {
            setLoading(false);
         }
      };
      fetchProduct();
   }, [id]);

   // 🔹 Handle update
   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!product) return;
      setSaving(true);

      try {
         const res = await fetch(`/api/product/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               name: product.name,
               description: product.description,
               pricePerKg: product.pricePerKg,
               quantity: product.quantity,
               status: product.status,
            }),
         });

         const data = await res.json();

         if (res.ok) {
            toast.success("✅ Product updated successfully");
            router.push("/dashboard/seller");
         } else {
            toast.error(data.error || "Failed to update product");
         }
      } catch (err) {
         toast.error("Error updating product");
      } finally {
         setSaving(false);
      }
   };

   if (loading) return <Spinner />;

   if (!product)
      return (
         <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <h2 className="text-2xl font-semibold">Product not found</h2>
         </div>
      );

   return (
      <div className="max-w-3xl min-h-[80vh] mx-auto p-6">
         <h1 className="text-3xl font-bold mb-6 text-center">Edit Product</h1>

         <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6"
         >
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

            <div>
               <label className="block text-sm font-medium text-gray-500">
                  Description
               </label>
               <textarea
                  value={product.description}
                  onChange={(e) =>
                     setProduct({ ...product, description: e.target.value })
                  }
                  className="w-full mt-1 border rounded p-2"
                  rows={4}
                  required
               />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-500">
                     Price per Kg
                  </label>
                  <input
                     type="number"
                     value={product.pricePerKg}
                     onChange={(e) =>
                        setProduct({ ...product, pricePerKg: e.target.value })
                     }
                     className="w-full mt-1 border rounded p-2"
                     required
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-500">
                     Quantity
                  </label>
                  <input
                     type="number"
                     value={product.quantity}
                     onChange={(e) =>
                        setProduct({ ...product, quantity: e.target.value })
                     }
                     className="w-full mt-1 border rounded p-2"
                     required
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-500">
                  Status
               </label>
               <select
                  value={product.status}
                  onChange={(e) =>
                     setProduct({ ...product, status: e.target.value })
                  }
                  className="w-full mt-1 border rounded p-2"
               >
                  <option value="available">Available</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
               </select>
            </div>

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
