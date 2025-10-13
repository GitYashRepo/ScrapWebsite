"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SellerDashboard() {
   const { data: session } = useSession();
   const [products, setProducts] = useState([]);
   const [auctionProducts, setAuctionProducts] = useState([]);
   const [loading, setLoading] = useState(true);

   const fetchProducts = async () => {
      try {
         const res = await fetch("/api/product");
         const data = await res.json();

         if (res.ok) {
            // Separate auction and normal products
            const normal = data.filter((p) => !p.isAuction);
            const auctions = data.filter((p) => p.isAuction);
            setProducts(normal);
            setAuctionProducts(auctions);
         }
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchProducts();
   }, []);

   const handleDelete = async (id) => {
      if (!confirm("Are you sure you want to delete this product?")) return;

      const res = await fetch(`/api/product/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
   };

   return (
      <div className="p-6 space-y-10">
         {/* Header */}
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Products</h1>
            <div className="flex flex-row gap-4">
               <Link
                  href="/dashboard/seller/addproduct"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
               >
                  + Add Product
               </Link>
               <Link
                  href="/dashboard/seller/addauctionproduct"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg"
               >
                  + Add Auction Product
               </Link>
            </div>
         </div>

         {loading ? (
            <p>Loading...</p>
         ) : (
            <>
               {/* Normal Products Section */}
               <section>
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                     🛒 Normal Products
                  </h2>

                  {products.length === 0 ? (
                     <p className="text-gray-600">No normal products listed yet.</p>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {products.map((p) => (
                           <div key={p._id} className="border rounded-lg p-4 shadow">
                              <img
                                 src={p.images?.[0] || "/placeholder.jpg"}
                                 alt={p.name}
                                 className="w-full h-48 object-cover rounded"
                              />
                              <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
                              <p className="text-gray-600 text-sm">{p.category?.name}</p>
                              <p className="text-gray-900 font-bold mt-1">
                                 ₹{p.pricePerKg}/kg
                              </p>
                              <button
                                 onClick={() => handleDelete(p._id)}
                                 className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
                              >
                                 Delete
                              </button>
                           </div>
                        ))}
                     </div>
                  )}
               </section>

               {/* Auction Products Section */}
               <section>
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                     🕒 Auction Products
                  </h2>

                  {auctionProducts.length === 0 ? (
                     <p className="text-gray-600">
                        No auction products added yet.
                     </p>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {auctionProducts.map((p) => (
                           <div
                              key={p._id}
                              className="border rounded-lg p-4 shadow bg-purple-50"
                           >
                              <img
                                 src={p.images?.[0] || "/placeholder.jpg"}
                                 alt={p.name}
                                 className="w-full h-48 object-cover rounded"
                              />
                              <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
                              <p className="text-gray-600 text-sm">{p.category?.name}</p>
                              <p className="text-gray-900 font-bold mt-1">
                                 ₹{p.pricePerKg}/kg
                              </p>

                              {/* Auction Info */}
                              <p className="text-sm text-gray-700 mt-2">
                                 ⏰ Ends on:{" "}
                                 <span className="font-semibold text-purple-700">
                                    {new Date(p.auctionEnd).toLocaleString()}
                                 </span>
                              </p>

                              <button
                                 onClick={() => handleDelete(p._id)}
                                 className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
                              >
                                 Delete
                              </button>
                           </div>
                        ))}
                     </div>
                  )}
               </section>
            </>
         )}
      </div>
   );
}
