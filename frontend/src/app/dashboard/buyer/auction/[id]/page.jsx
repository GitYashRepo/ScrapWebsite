"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function ProductPitchPage() {
   const { id } = useParams();
   const { data: session } = useSession();

   const userRole = session?.user?.role?.toLowerCase();
   const buyerId = session?.user?.id;

   const [product, setProduct] = useState(null);
   const [bids, setBids] = useState([]);
   const [loading, setLoading] = useState(true);
   const [loadingBids, setLoadingBids] = useState(false);
   const [bidAmount, setBidAmount] = useState("");
   const [userBid, setUserBid] = useState(null);

   // Fetch product and bids
   useEffect(() => {
      if (!id || !session) return;

      const fetchData = async () => {
         try {
            const [productRes, bidsRes] = await Promise.all([
               fetch(`/api/product/${id}`),
               fetch(`/api/bid?productId=${id}`),
            ]);

            const productData = await productRes.json();
            const bidsData = await bidsRes.json();

            setProduct(productData);
            setBids(Array.isArray(bidsData) ? bidsData : []);

            // Find if current buyer has already placed a bid
            const existingBid = bidsData.find(
               (bid) => bid.buyer?._id === session.user.id
            );
            setUserBid(existingBid || null);
         } catch (error) {
            console.error("Error loading auction details:", error);
            toast.error("Failed to load auction details");
            setBids([]);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [id, session]);

   // Auto-refresh only the bids every 5 seconds
   useEffect(() => {
      if (!id) return;

      const interval = setInterval(async () => {
         try {
            const bidsRes = await fetch(`/api/bid?productId=${id}`);
            const bidsData = await bidsRes.json();

            // Only update if data structure is valid
            if (Array.isArray(bidsData)) {
               setBids(bidsData);
            }
         } catch (error) {
            console.error("Error refreshing bids:", error);
         }
      }, 5000); // refresh every 5 seconds

      return () => clearInterval(interval);
   }, [id]);


   // Place a bid
   const handlePlaceBid = async () => {
      if (userRole !== "buyer") {
         toast.error("Only buyers can place bids!");
         return;
      }

      if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= 0) {
         toast.error("Please enter a valid bid amount!");
         return;
      }

      const bidValue = Number(bidAmount);

      // --- Time validation ---
      const now = new Date();
      const startTime = new Date(product.auctionStart);
      const endTime = new Date(product.auctionEnd);

      if (now < startTime) {
         toast.error("Bidding has not started yet!");
         return;
      }

      if (now > endTime) {
         toast.error("The auction has ended. You can no longer place bids!");
         return;
      }

      // Determine highest bid so far
      const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : 0;
      const startingPrice = product.pricePerKg;

      // --- Validation rules ---
      if (bids.length === 0) {
         // First bid case
         if (bidValue < startingPrice) {
            toast.error(`Starting bid must be at least ₹${startingPrice}`);
            return;
         }
      } else {
         // Subsequent bids must be higher than current highest
         if (bidValue <= highestBid) {
            toast.error(`Your bid must be higher than the current highest bid (₹${highestBid})`);
            return;
         }
      }

      try {
         const res = await fetch("/api/bid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id, amount: Number(bidAmount) }),
         });

         const data = await res.json();

         if (!res.ok) throw new Error(data.error || "Failed to place bid");

         toast.success("Bid placed successfully!");
         setBidAmount("");

         // Update local state
         setUserBid({
            amount: Number(bidAmount),
            buyer: { _id: buyerId, name: session.user.name },
         });

         // Refresh bid list
         setLoadingBids(true);
         const bidsRes = await fetch(`/api/bid?productId=${id}`);
         const bidsData = await bidsRes.json();
         setBids(Array.isArray(bidsData) ? bidsData : []);
      } catch (error) {
         toast.error(error.message);
      } finally {
         setLoadingBids(false);
      }
   };

   if (loading) {
      return (
         <div className="max-w-6xl min-h-[80vh] mx-auto p-6">
            <p className="p-6 text-center text-gray-500">Loading auction...</p>
         </div>
      )
   }

   if (!product) {
      return (
         <div className="max-w-6xl min-h-[80vh] mx-auto p-6">
            <p className="p-6 text-center text-gray-500">Product not found.</p>
         </div >
      )
   }

   return (
      <div className="max-w-6xl min-h-[80vh] mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Left: Product Image + Bids */}
         <div>
            <img
               src={product.images?.[0] || "/file.svg"}
               alt={product.name}
               className="w-full h-80 object-cover rounded-xl mb-4"
            />

            {/* Bids Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
               <h2 className="text-lg font-semibold mb-2">Bids on this Product <span>Highest Bid Shown on Top !</span></h2>

               {loadingBids ? (
                  <p className="text-sm text-gray-500">Refreshing bids...</p>
               ) : bids.length === 0 ? (
                  <p className="text-sm text-gray-500">No bids yet.</p>
               ) : (
                  <ul className="space-y-2">
                     {bids
                        .sort((a, b) => b.amount - a.amount) // Sort descending
                        .map((bid, index) => {
                           let bgColor = "bg-white"; // default
                           let textColor = "text-green-700"; // default
                           let crown = "";

                           if (index === 0) {
                              bgColor = "bg-yellow-100";
                              textColor = "text-yellow-800";
                              crown = "👑 "; // crown for top bid
                           } else if (index === 1) {
                              bgColor = "bg-blue-100";
                              textColor = "text-blue-800";
                           } else if (index === 2) {
                              bgColor = "bg-purple-100";
                              textColor = "text-purple-800";
                           }

                           return (
                              <li
                                 key={bid._id}
                                 className={`flex justify-between items-center ${bgColor} p-2 rounded-md shadow-sm`}
                              >
                                 <span className="font-medium">
                                    {crown}
                                    {bid.buyer?.buyerCode || "Anonymous"}
                                 </span>
                                 <span className={`font-bold ${textColor}`}>
                                    ₹{bid.amount}
                                 </span>
                              </li>
                           );
                        })}
                  </ul>
               )}
            </div>
         </div>

         {/* Right: Product Info + Bid Form */}
         <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-2">
               {product.category?.name || "Uncategorized"}
            </p>
            <p className="text-gray-700 mb-4">{product.description}</p>

            <p className="text-green-700 font-semibold">
               Starting Price: ₹{product.pricePerKg}/kg
            </p>

            <p className="text-xs text-gray-500 mt-2">
               🕒 Auction Period:{" "}
               {new Date(product.auctionStart).toLocaleDateString()} →{" "}
               {new Date(product.auctionEnd).toLocaleDateString()}
            </p>

            {/* Bid Section */}
            {userRole === "buyer" ? (

               <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">
                     Enter your Bid Amount (₹)
                  </label>
                  <input
                     type="number"
                     value={bidAmount}
                     onChange={(e) => setBidAmount(e.target.value)}
                     className="w-full border rounded-lg p-2 mb-3"
                     placeholder="Enter your bid amount"
                  />
                  {/* --- Determine auction status --- */}
                  {(() => {
                     const now = new Date();
                     const startTime = new Date(product.auctionStart);
                     const endTime = new Date(product.auctionEnd);

                     if (now < startTime) {
                        return (
                           <p className="text-sm text-blue-600 mb-3">
                              🕒 Auction hasn’t started yet. Starts on{" "}
                              {startTime.toLocaleString()}.
                           </p>
                        );
                     }

                     if (now > endTime) {
                        return (
                           <p className="text-sm text-red-600 mb-3">
                              ❌ Auction has ended. No more bids allowed.
                           </p>
                        );
                     }

                     return (
                        <p className="text-sm text-green-700 mb-3">
                           ✅ Auction is live! Place your bid below.
                        </p>
                     );
                  })()}

                  <button
                     onClick={handlePlaceBid}
                     disabled={
                        new Date() < new Date(product.auctionStart) ||
                        new Date() > new Date(product.auctionEnd)
                     }
                     className={`py-2 px-4 rounded-lg w-full text-white ${new Date() < new Date(product.auctionStart) || new Date() > new Date(product.auctionEnd)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                  >
                     Place Bid
                  </button>
               </div>
            ) : (
               <p className="text-sm text-red-600 mt-6">
                  Only buyers are allowed to bid on auctions.
               </p>
            )}
         </div>
      </div>
   );
}
