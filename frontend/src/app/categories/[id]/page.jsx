"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Spinner from "@/components/Loader/spinner/spinner";
import Link from "next/link";


export default function CategoryProductsPage() {
   const { id } = useParams();
   const [products, setProducts] = useState([]);
   const [category, setCategory] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchCategoryProducts = async () => {
         try {
            const [catRes, prodRes] = await Promise.all([
               fetch(`/api/category/${id}`),
               fetch(`/api/product?categoryId=${id}`),
            ]);

            const categoryData = await catRes.json();
            const productData = await prodRes.json();

            setCategory(categoryData);
            setProducts(productData);
         } catch (err) {
            console.error("Error fetching category products:", err);
         } finally {
            setLoading(false);
         }
      };

      if (id) fetchCategoryProducts();
   }, [id]);

   if (loading) return <Spinner />;

   return (
      <div className="max-w-6xl mx-auto p-6">
         {category && (
            <div className="flex items-center gap-4 mb-6">
               <img
                  src={category.image}
                  alt={category.name}
                  className="w-20 h-20 rounded-xl object-cover"
               />
               <div className="flex flex-row items-end gap-2">
                  <h1 className="text-3xl">Category:</h1>{" "}<p className="font-bold text-2xl">{category.name}</p>
               </div>
            </div>
         )}

         {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {products.map((p) => (
                  <div
                     key={p._id}
                     className="border rounded-xl p-4 hover:shadow-lg transition"
                  >
                     <img
                        src={p.images?.[0] || "/file.svg"}
                        alt={p.name}
                        className="w-full h-40 object-cover rounded-md mb-3"
                     />
                     <div className="flex flex-row justify-between items-center">
                        <h2 className="text-lg font-semibold">{p.name}</h2>
                        <p className="font-semibold">{p.quantity} Kg</p>
                     </div>
                     <p className="text-gray-500 text-sm line-clamp-2">{p.description}</p>
                     <div className="mt-3 flex justify-between items-center">
                        <p className="font-bold text-green-600">₹{p.pricePerKg}/Kg</p>
                        <Link
                           href={`/dashboard/buyer/product/${p._id}`}
                           className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                           View
                        </Link>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <p className="text-center text-gray-500">No products found in this category.</p>
         )}
      </div>
   );
}
