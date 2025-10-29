"use client";

import SkeletonCard from "@/components/Loader/skeletoncard/skeleton";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AuctionProductsPage = () => {
   const { id } = useParams();
   const router = useRouter();
   const { data: session } = useSession();

   const userId = session?.user?.id;
   const userRole = session?.user?.role?.toLowerCase();

   const [auctions, setAuctions] = useState([]);
   const [filteredAuctions, setFilteredAuctions] = useState([]);
   const [loading, setLoading] = useState(false);
   const [buying, setBuying] = useState(false);
   const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

   // 🔹 Filter states
   const [priceRange, setPriceRange] = useState({ min: "", max: "" });
   const [category, setCategory] = useState("");
   const [quantity, setQuantity] = useState("");
   const [startDate, setStartDate] = useState("");

   // ✅ Fetch auctions
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
            setFilteredAuctions(data);
         } catch (error) {
            console.error(error);
         } finally {
            setLoading(false);
         }
      };
      fetchAuctions();
   }, []);

   // ✅ Check buyer subscription
   useEffect(() => {
      const checkSubscription = async () => {
         if (userRole !== "buyer" || !userId) return;
         try {
            const res = await fetch("/api/subscription/check", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ userId, userType: "Buyer" }),
            });
            const data = await res.json();
            setHasActiveSubscription(data.active);
         } catch (error) {
            console.error("Subscription check failed:", error);
         }
      };
      checkSubscription();
   }, [userId, userRole]);

   // ✅ Handle pitching
   const handlePitching = async (productId) => {
      if (userRole !== "buyer") {
         toast.error("Only buyers can pitch or start a chat.");
         return;
      }
      if (!hasActiveSubscription) {
         toast.error("Please subscribe to participate in auctions.");
         router.push("/dashboard/buyer/subscription");
         return;
      }

      setBuying(true);
      router.push(`/dashboard/buyer/auction/${productId}`);
   };

   // ✅ Filter logic
   useEffect(() => {
      let filtered = [...auctions];

      if (priceRange.min)
         filtered = filtered.filter(
            (a) => a.pricePerKg >= Number(priceRange.min)
         );
      if (priceRange.max)
         filtered = filtered.filter(
            (a) => a.pricePerKg <= Number(priceRange.max)
         );

      if (category)
         filtered = filtered.filter(
            (a) => a.category?.name?.toLowerCase() === category.toLowerCase()
         );

      if (quantity)
         filtered = filtered.filter(
            (a) => a.quantity >= Number(quantity)
         );

      if (startDate)
         filtered = filtered.filter(
            (a) =>
               new Date(a.auctionStart).toISOString().split("T")[0] === startDate
         );

      setFilteredAuctions(filtered);
   }, [priceRange, category, quantity, startDate, auctions]);

   // ✅ Get distinct categories for dropdown
   const categoryOptions = [
      ...new Set(auctions.map((a) => a.category?.name).filter(Boolean)),
   ];

   if (auctions.length === 0 && !loading) {
      return (
         <div className="min-h-[80vh] flex flex-col justify-center items-center p-6">
            <h2 className="text-xl font-semibold mb-4">No Active Auctions Available</h2>
            <p className="text-gray-600">
               Please check your internet connection or check back later.
            </p>
         </div>
      );
   }

   return (
      <div className="min-h-[80vh] p-6">
         <h1 className="text-2xl font-bold mb-4">Active Auctions</h1>

         {/* 🔹 FILTER SECTION */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min / Max Price (₹/kg)
               </label>
               <div className="flex gap-2">
                  <input
                     type="number"
                     placeholder="Min"
                     className="border rounded-md p-2 w-full"
                     value={priceRange.min}
                     onChange={(e) =>
                        setPriceRange((p) => ({ ...p, min: e.target.value }))
                     }
                  />
                  <input
                     type="number"
                     placeholder="Max"
                     className="border rounded-md p-2 w-full"
                     value={priceRange.max}
                     onChange={(e) =>
                        setPriceRange((p) => ({ ...p, max: e.target.value }))
                     }
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
               </label>
               <select
                  className="border rounded-md p-2 w-full"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
               >
                  <option value="">All</option>
                  {categoryOptions.map((cat, i) => (
                     <option key={i} value={cat}>
                        {cat}
                     </option>
                  ))}
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Quantity (kg)
               </label>
               <input
                  type="number"
                  placeholder="e.g. 100"
                  className="border rounded-md p-2 w-full"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auction Start Date
               </label>
               <input
                  type="date"
                  className="border rounded-md p-2 w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
               />
            </div>
         </div>

         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-[5vw]">
               {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
               ))}
            </div>
         ) : filteredAuctions.length === 0 ? (
            <div className="text-center text-gray-600 mt-10">
               No auctions match your filters.
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {filteredAuctions.map((product) => (
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

                     <div className="flex flex-row justify-start items-start gap-10">
                        <div className="w-[80%]">
                           <h2 className="font-semibold text-lg">{product.name}</h2>
                        </div>
                        <div className="w-[20%]">
                           <p className="font-semibold">{product.quantity} Kg</p>
                        </div>
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
                        Seller:{" "}
                        {product.seller?.storeName ||
                           product.seller?.name ||
                           "Unknown"}
                     </p>

                     <p className="text-xs text-gray-500 mt-2">
                        🕒 Auction Period:{" "}
                        {new Date(product.auctionStart).toLocaleDateString()} →{" "}
                        {new Date(product.auctionEnd).toLocaleDateString()}
                     </p>

                     <div className="flex gap-2 mt-4">
                        {userRole === "buyer" ? (
                           <div className="w-full flex gap-2">
                              <button
                                 onClick={() => handlePitching(product._id)}
                                 disabled={buying || loading}
                                 className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                              >
                                 {buying ? "Processing..." : "Pitch"}
                              </button>

                              <button
                                 onClick={() =>
                                    router.push(
                                       `/dashboard/buyer/product/${product._id}`
                                    )
                                 }
                                 className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                              >
                                 View Details
                              </button>
                           </div>
                        ) : (
                           <div className="w-full border-t pt-3">
                              <p className="text-sm text-red-600 font-medium text-center">
                                 Sellers are not allowed to bid in auctions. Sign up as a buyer to bid.
                              </p>
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default AuctionProductsPage;
