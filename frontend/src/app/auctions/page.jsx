"use client";

import SkeletonCard from "@/components/Loader/skeletoncard/skeleton";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner"

const AuctionProductsPage = () => {
   const { id } = useParams();
   const router = useRouter();
   const { data: session } = useSession();
   const buyerId = session?.user?.id;
   const [auctions, setAuctions] = useState([]);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");
   const [buying, setBuying] = useState(false);

   const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

   useEffect(() => {
      const fetchAuctions = async () => {
         try {
            setLoading(true);
            const res = await fetch("/api/product/auctions", {
               method: "GET",
               credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch auction products");
            const data = await res.json();
            setAuctions(data);
         } catch (error) {
            console.error(error);
         } finally {
            setLoading(false);
         }
      };
      fetchAuctions();
   }, []);

   // ✅ Check Buyer Subscription
   useEffect(() => {
      const checkSubscription = async () => {
         if (!buyerId) return;
         try {
            const res = await fetch("/api/subscription/check", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ userId: buyerId, userType: "Buyer" }),
            });
            const data = await res.json();
            setHasActiveSubscription(data.active);
         } catch (error) {
            console.error("Subscription check failed:", error);
         }
      };
      checkSubscription();
   }, [buyerId]);

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

   // 🧩 Handle Buy Now Click —> open chat session
   const handlePitching = async (productId) => {
      if (!buyerId) {
         toast.error("You must be signed in as a buyer to start a chat.");
         return;
      }
      if (!hasActiveSubscription) {
         toast.error("Please subscribe to view seller details and contact the seller.");
         router.push("/dashboard/buyer/subscription");
         return;
      }
      setBuying(true);
      const chatUrl = `/dashboard/buyer/chat/${productId}`;
      router.push(chatUrl);
   };

   return (
      <div className="p-6">
         <h1 className="text-2xl font-bold mb-4">Active Auctions</h1>

         {message && (
            <div className="mb-4 text-center text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded-lg">
               {message}
            </div>
         )}

         {loading ? (
            // 🔹 Show skeletons while loading
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-[5vw]">
               {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
               ))}
            </div>
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

                     <div className="flex flex-row justify-between items-center">
                        <h2 className="font-semibold text-lg">{product.name}</h2>
                        <p className="font-semibold">{product.quantity} Kg</p>
                     </div>
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
