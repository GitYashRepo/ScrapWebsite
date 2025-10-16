"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/components/Loader/spinner/spinner";

const ProductDetails = () => {
   const { id } = useParams();
   const router = useRouter();
   const [product, setProduct] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [buying, setBuying] = useState(false); // 👈 track Buy Now loading

   // 👇 Replace with your actual logged-in buyer ID from session if using next-auth
   const [buyerId, setBuyerId] = useState(null);

   // Fetch buyer ID (if using next-auth)
   useEffect(() => {
      const fetchSession = async () => {
         try {
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            setBuyerId(data?.user?.id);
         } catch (err) {
            console.error("Failed to fetch session:", err);
         }
      };
      fetchSession();
   }, []);

   useEffect(() => {
      const fetchProduct = async () => {
         try {
            setLoading(true);
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

   // 🧩 Handle Buy Now Click —> open chat session
   const handleBuyNow = async () => {
      if (!buyerId) {
         alert("You must be signed in as a buyer to start a chat.");
         return;
      }

      setBuying(true);
      try {
         const res = await fetch("/api/chat/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product._id, buyerId }),
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.error || "Failed to start chat session");

         // ✅ Redirect buyer to chat page
         router.push(
            `/dashboard/buyer/chat?sessionId=${data.sessionId}&productId=${product._id}`
         );
      } catch (err) {
         console.error(err);
         alert(err.message);
      } finally {
         setBuying(false);
      }
   };


   return (
      <div className="p-8 max-w-6xl mx-auto">
         {loading ? (
            <div className="fllex items-center justify-center">
               <Spinner />
            </div>
         ) : error ? (
            <p className="text-red-600 text-center">{error}</p>
         ) : product ? (
            <>
               <h1 className="text-2xl font-bold mb-4">Product: {product.name}</h1>
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
            </>
         ) : (
            <p className="text-gray-500 text-center">No product found.</p>
         )}
      </div>
   );
};

export default ProductDetails;
