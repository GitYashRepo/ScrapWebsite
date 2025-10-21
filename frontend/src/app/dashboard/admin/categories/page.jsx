"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner"


export default function AdminCategoriesPage() {
   const [categories, setCategories] = useState([]);
   const [form, setForm] = useState({ name: "", description: "", image: "" });
   const [loading, setLoading] = useState(false);
   const [refresh, setRefresh] = useState(false);

   // ✅ Fetch categories
   useEffect(() => {
      const fetchCategories = async () => {
         try {
            const res = await fetch("/api/category");
            const data = await res.json();
            setCategories(data);
         } catch (err) {
            console.error("Error fetching categories:", err);
         }
      };
      fetchCategories();
   }, [refresh]);

   // ✅ Handle category creation
   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const res = await fetch("/api/category", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
         });

         const data = await res.json();
         if (res.ok) {
            toast.success("✅ Category created successfully!");
            setForm({ name: "", description: "", image: "" });
            setRefresh(!refresh);
         } else {
            toast.error(`❌ ${data.error}`);
         }
      } catch (err) {
         console.error("Error:", err);
      } finally {
         setLoading(false);
      }
   };

   // ✅ Handle delete
   const handleDelete = async (id) => {
      if (!confirm("Are you sure you want to delete this category?")) return;
      try {
         const res = await fetch(`/api/category/${id}`, { method: "DELETE" });
         const data = await res.json();
         if (res.ok) {
            toast.success("🗑️ Category deleted");
            setRefresh(!refresh);
         } else {
            toast.error(`❌ ${data.error}`);
         }
      } catch (err) {
         console.error("Delete error:", err);
      }
   };

   return (
      <div className="p-6 max-w-[90vw] min-h-[80vh] mx-auto">
         <h1 className="text-2xl font-semibold mb-6">🛍️ Manage Categories</h1>

         {/* ✅ Add Category Form */}
         <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-5 mb-8 w-full max-w-md"
         >
            <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
            <div className="space-y-3">
               <div>
                  <label className="block font-medium mb-1">Name</label>
                  <input
                     type="text"
                     value={form.name}
                     onChange={(e) => setForm({ ...form, name: e.target.value })}
                     required
                     className="border rounded px-3 py-2 w-full"
                  />
               </div>

               <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                     value={form.description}
                     onChange={(e) => setForm({ ...form, description: e.target.value })}
                     rows={3}
                     className="border rounded px-3 py-2 w-full"
                  />
               </div>

               <div>
                  <label className="block font-medium mb-1">Image URL</label>
                  <input
                     type="url"
                     value={form.image}
                     onChange={(e) => setForm({ ...form, image: e.target.value })}
                     required
                     placeholder="https://example.com/image.jpg"
                     className="border rounded px-3 py-2 w-full"
                  />
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
               >
                  {loading ? "Creating..." : "Create Category"}
               </button>
            </div>
         </form>

         {/* ✅ Category List */}
         <div>
            <h2 className="text-lg font-semibold mb-3">Existing Categories</h2>
            {categories.length === 0 ? (
               <p className="text-gray-600">No categories found.</p>
            ) : (
               <div className="grid md:grid-cols-3 gap-5">
                  {categories.map((cat) => (
                     <div
                        key={cat._id}
                        className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
                     >
                        <img
                           src={cat.image}
                           alt={cat.name}
                           className="w-full h-40 object-cover rounded-md mb-3"
                        />
                        <h3 className="font-bold text-lg">{cat.name}</h3>
                        <p className="text-gray-600 text-sm text-center mb-3">
                           {cat.description || "No description"}
                        </p>
                        <button
                           onClick={() => handleDelete(cat._id)}
                           className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                        >
                           Delete
                        </button>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
