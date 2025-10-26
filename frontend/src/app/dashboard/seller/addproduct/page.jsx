"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { toast } from "sonner"
import { upload } from "@vercel/blob/client";


export default function AddProduct() {
   const router = useRouter();
   const [categories, setCategories] = useState([]);
   const [form, setForm] = useState({
      name: "",
      description: "",
      pricePerKg: "",
      quantity: "",
      category: "",
      images: [""],
   });
   const [loading, setLoading] = useState(false);
   const [uploading, setUploading] = useState(false);

   useEffect(() => {
      fetch("/api/category")
         .then((res) => res.json())
         .then(setCategories)
         .catch(console.error);
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const session = await getSession();
      if (!session || session.user.role !== "seller") {
         toast.info("You must be logged in as seller");
         setLoading(false);
         return;
      }

      const productData = { ...form, seller: session.user.id };

      const res = await fetch("/api/product", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(productData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
         toast.success("Product added successfully!");
         router.push("/dashboard/seller");
      } else {
         toast.error(data.error || "Something went wrong!");
      }
   };

   const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const MAX_SIZE_MB = 2;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
         toast.error(`File too large (max ${MAX_SIZE_MB} MB)`);
         return;
      }

      try {
         setUploading(true);

         // 1️⃣ Get one-time handle URL from server
         const res = await fetch("/api/blob-upload");
         const { url: handleUploadUrl } = await res.json();

         // 2️⃣ Upload directly
         const blob = await upload(file, { handleUploadUrl });

         toast.success("Image uploaded successfully!");
         setForm({ ...form, images: [blob.url] });
      } catch (err) {
         console.error(err);
         toast.error("Image upload failed!");
      } finally {
         setUploading(false);
      }
   };

   return (
      <div className="max-w-lg min-h-[80vh] mx-auto p-6">
         <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block mb-1 font-semibold">Product Name</label>
               <input
                  type="text"
                  className="border w-full px-3 py-2 rounded"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
               />
            </div>

            <div>
               <label className="block mb-1 font-semibold">Detailed Description <span className="text-red-500">( to Justify your Product Price )</span></label>
               <textarea
                  className="border w-full px-3 py-2 rounded"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
               />
            </div>

            <div>
               <label className="block mb-1 font-semibold">Price (per kg)</label>
               <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="border w-full px-3 py-2 rounded"
                  value={form.pricePerKg}
                  onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                  required
               />
            </div>

            <div>
               <label className="block mb-1 font-semibold">Available Quantity (kg)</label>
               <input
                  type="number"
                  min="1"
                  className="border w-full px-3 py-2 rounded"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
               />
            </div>

            <div>
               <label className="block mb-1 font-semibold">Category</label>
               <select
                  className="border w-full px-3 py-2 rounded"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
               >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                     <option key={cat._id} value={cat._id}>
                        {cat.name}
                     </option>
                  ))}
               </select>
            </div>

            {/* <div>
               <label className="block mb-1 font-semibold">Image URL</label>
               <input
                  type="text"
                  className="border w-full px-3 py-2 rounded"
                  value={form.images[0]}
                  onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                  required
               />
            </div> */}

            <div>
               <label className="block mb-1 font-semibold">Upload Product Image</label>
               <input
                  type="file"
                  accept="image/*"
                  className="border w-full px-3 py-2 rounded"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
               />
               {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
               {form.images[0] && (
                  <img
                     src={form.images[0]}
                     alt="Preview"
                     className="mt-3 w-32 h-32 object-cover rounded border"
                  />
               )}
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-blue-600 text-white py-2 rounded"
            >
               {loading ? "Saving..." : "Add Product"}
            </button>
         </form>
      </div>
   );
}
