"use client";

import SkeletonCard from "@/components/Loader/skeletoncard/skeleton";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ShopPage = () => {
   const { id } = useParams();
   const router = useRouter();
   const { data: session } = useSession();

   const buyerId = session?.user?.id;
   const userRole = session?.user?.role?.toLowerCase();

   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");
   const [buying, setBuying] = useState(false);
   const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

   // ✅ Fetch all available products (for buyers and sellers)
   useEffect(() => {
      const fetchProducts = async () => {
         try {
            setLoading(true);
            const res = await fetch("/api/product", {
               method: "GET",
               credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
         } catch (error) {
            console.error(error);
         } finally {
            setLoading(false);
         }
      };
      fetchProducts();
   }, []);

   // ✅ Check Buyer Subscription (only for buyers)
   useEffect(() => {
      const checkSubscription = async () => {
         if (userRole !== "buyer" || !buyerId) return;
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
   }, [buyerId, userRole]);

   // 🧩 Handle Buy Now → open chat session (buyers only)
   const handleBuyNow = async (productId) => {
      if (userRole !== "buyer") {
         toast.error("Only buyers can buy products.");
         return;
      }
      if (!hasActiveSubscription) {
         toast.error("Please subscribe to contact sellers.");
         router.push("/dashboard/buyer/subscription");
         return;
      }
      setBuying(true);
      const chatUrl = `/dashboard/buyer/chat/${productId}`;
      router.push(chatUrl);
   };

   return (
      <div className="p-6 min-h-[80vh]">
         <h1 className="text-2xl font-bold mb-4">All Products</h1>

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

                     <div className="flex flex-row justify-between items-center">
                        <h2 className="font-semibold text-lg">{product.name}</h2>
                        <p className="font-semibold">{product.quantity} Kg</p>
                     </div>

                     <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                     </p>

                     <p className="text-green-700 font-bold mt-2">
                        Price: ₹{product.pricePerKg}/kg
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

                     {/* ✅ Conditional Buttons / Message */}
                     <div className="mt-4">
                        {userRole === "buyer" ? (
                           <div className="flex gap-2">
                              <button
                                 onClick={() => handleBuyNow(product._id)}
                                 disabled={buying || loading}
                                 className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                              >
                                 {buying ? "Opening Chat..." : "Buy"}
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
                           <p className="text-sm text-red-600 font-medium text-center border-t pt-3">
                              Sellers are not allowed to buy products, SignUp as Buyer to Purchase Products.
                           </p>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default ShopPage;
