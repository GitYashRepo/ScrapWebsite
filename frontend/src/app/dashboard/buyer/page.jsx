"use client";

import { useEffect, useState } from "react";

const BuyerDashboard = () => {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");

   // Fetch all available products for buyer
   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const res = await fetch("/api/product");
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
         } catch (error) {
            console.error(error);
         }
      };
      fetchProducts();
   }, []);

   // Handle Buy or Pitch button click
   const handleAction = async (productId, actionType) => {
      setLoading(true);
      setMessage("");

      try {
         // Example: call API to create a purchase or pitch
         const res = await fetch(`/api/${actionType}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.error || "Action failed");

         setMessage(`✅ Successfully ${actionType === "buy" ? "purchased" : "pitched"} product!`);
      } catch (error) {
         console.error(error);
         setMessage(`❌ ${error.message}`);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="p-6">
         <h1 className="text-2xl font-bold mb-4">All Products</h1>

         {message && (
            <div className="mb-4 text-center text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded-lg">
               {message}
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
               <div
                  key={product._id}
                  className="border rounded-xl shadow-sm p-4 hover:shadow-md transition"
               >
                  {product.images?.length > 0 && (
                     <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                     />
                  )}

                  <h2 className="font-semibold text-lg">{product.name}</h2>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <p className="text-green-700 font-bold mt-2">₹{product.pricePerKg}/kg</p>

                  <p className="text-xs text-gray-500 mt-1">
                     Category: {product.category?.name || "Uncategorized"}
                  </p>
                  <p className="text-xs text-gray-500">
                     Seller: {product.seller?.storeName || product.seller?.name || "Unknown"}
                  </p>

                  <div className="flex gap-2 mt-4">
                     <button
                        onClick={() => handleAction(product._id, "buy")}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                     >
                        {loading ? "Processing..." : "Buy"}
                     </button>

                     <button
                        onClick={() => handleAction(product._id, "pitch")}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                     >
                        {loading ? "Processing..." : "Pitch"}
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default BuyerDashboard;
