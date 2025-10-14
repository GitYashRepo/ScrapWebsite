"use client";

import { useEffect, useState } from "react";

const AuctionProductsPage = () => {
   const [auctions, setAuctions] = useState([]);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");

   useEffect(() => {
      const fetchAuctions = async () => {
         try {
            const res = await fetch("/api/product/auctions", {
               method: "GET",
               credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch auction products");
            const data = await res.json();
            setAuctions(data);
         } catch (error) {
            console.error(error);
         }
      };
      fetchAuctions();
   }, []);

   const handleAction = async (productId, actionType) => {
      setLoading(true);
      setMessage("");

      try {
         // Example: call /api/pitch to place a bid
         const res = await fetch(`/api/${actionType}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.error || "Action failed");

         setMessage(`✅ Successfully ${actionType === "pitch" ? "pitched" : "processed"} product!`);
      } catch (error) {
         console.error(error);
         setMessage(`❌ ${error.message}`);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="p-6">
         <h1 className="text-2xl font-bold mb-4">Active Auctions</h1>

         {message && (
            <div className="mb-4 text-center text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded-lg">
               {message}
            </div>
         )}

         {auctions.length === 0 ? (
            <p className="text-gray-600">Loading.......</p>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {auctions.map((product) => (
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
                     <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                     </p>
                     <p className="text-green-700 font-bold mt-2">
                        Starting Price: ₹{product.pricePerKg}/kg
                     </p>

                     <p className="text-xs text-gray-500 mt-1">
                        Category: {product.category?.name || "Uncategorized"}
                     </p>
                     <p className="text-xs text-gray-500">
                        Seller: {product.seller?.storeName || product.seller?.name || "Unknown"}
                     </p>

                     <p className="text-xs text-gray-500 mt-2">
                        🕒 Auction Period:{" "}
                        {new Date(product.auctionStart).toLocaleDateString()} →{" "}
                        {new Date(product.auctionEnd).toLocaleDateString()}
                     </p>

                     <div className="flex gap-2 mt-4">
                        <button
                           onClick={() => handleAction(product._id, "pitch")}
                           disabled={loading}
                           className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                        >
                           {loading ? "Processing..." : "Pitch"}
                        </button>

                        <button
                           onClick={() =>
                              (window.location.href = `/dashboard/buyer/product/${product._id}`)
                           }
                           className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                           View Details
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default AuctionProductsPage;
