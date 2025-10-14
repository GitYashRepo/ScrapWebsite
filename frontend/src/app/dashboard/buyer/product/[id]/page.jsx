"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const ProductDetails = () => {
   const { id } = useParams();
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      const fetchProduct = async () => {
         try {
            const res = await fetch(`/api/product/${id}`);
            if (!res.ok) throw new Error("Failed to fetch product details");
            const data = await res.json();
            setProduct(data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };
      if (id) fetchProduct();
   }, [id]);

   if (loading)
      return <div className="p-6 text-center text-gray-500">Loading product...</div>;
   if (error)
      return <div className="p-6 text-center text-red-600">{error}</div>;
   if (!product)
      return <div className="p-6 text-center text-gray-600">Product not found.</div>;

   return (
      <div className="p-8 max-w-6xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* 🖼️ Left Side - Product Image */}
            <div className="flex flex-col items-center">
               {product.images?.length > 0 ? (
                  <img
                     src={product.images[0]}
                     alt={product.name}
                     className="w-full h-80 object-cover rounded-2xl shadow-md"
                  />
               ) : (
                  <div className="w-full h-80 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                     No image available
                  </div>
               )}

               {/* Optional: small image preview thumbnails */}
               {product.images?.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto">
                     {product.images.map((img, index) => (
                        <img
                           key={index}
                           src={img}
                           alt={`Image ${index + 1}`}
                           className="w-20 h-20 object-cover rounded-xl border hover:scale-105 transition-transform"
                        />
                     ))}
                  </div>
               )}
            </div>

            {/* 📄 Right Side - Product Details */}
            <div>
               <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
               <p className="text-gray-700 mb-4 leading-relaxed">{product.description}</p>

               <div className="space-y-3 mb-6">
                  <p className="text-2xl font-semibold text-green-700">
                     ₹{product.pricePerKg.toLocaleString()}/kg
                  </p>
                  <p className="text-gray-700">Quantity: <span className="font-medium">{product.quantity} kg</span></p>
                  <p className="text-gray-700">
                     Category: <span className="font-medium">{product.category?.name || "Uncategorized"}</span>
                  </p>
                  <p className="text-gray-700 capitalize">
                     Status:{" "}
                     <span
                        className={`font-semibold ${product.status === "available"
                              ? "text-green-600"
                              : product.status === "out-of-stock"
                                 ? "text-red-600"
                                 : "text-gray-500"
                           }`}
                     >
                        {product.status}
                     </span>
                  </p>

                  {/* Auction Info */}
                  {product.isAuction && (
                     <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
                        <p className="font-semibold text-yellow-700 mb-1">🕒 Auction Mode</p>
                        <p className="text-sm text-gray-600">
                           Start: {new Date(product.auctionStart).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                           End: {new Date(product.auctionEnd).toLocaleString()}
                        </p>
                        <p className="text-sm mt-2">
                           Highest Bid:{" "}
                           <span className="font-semibold text-green-700">
                              ₹{product.highestBid?.amount || 0}
                           </span>
                        </p>
                     </div>
                  )}
               </div>

               {/* 🧑‍🌾 Seller Info */}
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-2">Seller Details</h2>
                  <p><span className="font-medium">Store:</span> {product.seller?.storeName}</p>
                  <p><span className="font-medium">Owner:</span> {product.seller?.ownerName}</p>
                  <p><span className="font-medium">Email:</span> {product.seller?.email}</p>
                  <p><span className="font-medium">Phone:</span> {product.seller?.phone}</p>
                  <p>
                     <span className="font-medium">Address:</span>{" "}
                     {product.seller?.address}, {product.seller?.city},{" "}
                     {product.seller?.state} - {product.seller?.pinCode}
                  </p>
               </div>

               {/* Buttons */}
               <div className="flex gap-3">
                  <button
                     onClick={() => alert("Buying feature coming soon!")}
                     className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                  >
                     Buy Now
                  </button>

                  {product.isAuction && (
                     <button
                        onClick={() => alert("Pitch feature coming soon!")}
                        className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600"
                     >
                        Pitch Bid
                     </button>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ProductDetails;
