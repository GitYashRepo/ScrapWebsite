"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { toast } from "sonner"
import { upload } from "@vercel/blob/client";


export default function AddAuctionProduct() {
   const router = useRouter();
   const [categories, setCategories] = useState([]);
   const [form, setForm] = useState({
      name: "",
      description: "",
      pricePerKg: "",
      quantity: "",
      category: "",
      images: [""],
      isAuction: true,
      auctionStart: "",
      auctionEnd: "",
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

      // Validate auction dates
      const startDate = new Date(form.auctionStart);
      const endDate = new Date(form.auctionEnd);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
         toast.info("Please provide valid auction start and end dates");
         setLoading(false);
         return;
      }

      if (endDate <= startDate) {
         toast.info("Auction end date must be after start date");
         setLoading(false);
         return;
      }


      const productData = {
         name: form.name,
         description: form.description,
         pricePerKg: Number(form.pricePerKg),
         quantity: Number(form.quantity),
         category: form.category,
         images: form.images,
         isAuction: form.isAuction,
         auctionStart: startDate.toISOString(),
         auctionEnd: endDate.toISOString(),
      };

      const res = await fetch("/api/product", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(productData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
         toast.success("Auction product created successfully!");
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

         const formData = new FormData();
         formData.append('file', file);

         const res = await fetch('/api/blob-upload', {
            method: 'POST',
            body: formData,
         });

         const data = await res.json();

         if (!res.ok) throw new Error(data.error || 'Upload failed');

         toast.success('Image uploaded successfully!');
         setForm({ ...form, images: [data.url] });
      } catch (err) {
         console.error("Upload failed:", err);
         toast.error("Image upload failed!");
      } finally {
         setUploading(false);
      }
   };

   return (
      <div className="max-w-lg min-h-[80vh] mx-auto p-6">
         <h1 className="text-2xl font-bold mb-4">Add Product for Auction</h1>
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
               <label className="block mb-1 font-semibold">Starting Price (per kg)</label>
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


            {/* Auction Start */}
            <div>
               <label className="block mb-1 font-semibold">Auction Start Date & Time</label>
               <input
                  type="date"
                  className="border w-full px-3 py-2 rounded"
                  value={form.auctionStart}
                  onChange={(e) => setForm({ ...form, auctionStart: e.target.value })}
                  required
               />
            </div>

            {/* Auction End */}
            <div>
               <label className="block mb-1 font-semibold">Auction End Date & Time</label>
               <input
                  type="date"
                  className="border w-full px-3 py-2 rounded"
                  value={form.auctionEnd}
                  onChange={(e) => setForm({ ...form, auctionEnd: e.target.value })}
                  required
               />
            </div>

            <div>
               <label className="block mb-1 font-semibold">Quantity (kg)</label>
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
                  onChange={handleImageUpload}
               />
               {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
               {/* {form.images[0] && (
                  <img
                     src={form.images[0]}
                     alt="Preview"
                     className="mt-3 w-32 h-32 object-cover rounded border"
                  />
               )} */}
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-green-600 text-white py-2 rounded"
            >
               {loading ? "Creating..." : "Create Auction Product"}
            </button>
         </form>
      </div>
   );
}
