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
   const [buyingProductId, setBuyingProductId] = useState(null);
   const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

   const [currentPage, setCurrentPage] = useState(1);
   const productsPerPage = 16;

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            setLoading(true);
            const res = await fetch("/api/product", { method: "GET", credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
         } catch (error) {
            console.error(error);
            setMessage("⚠️ Please check your internet connection and reload the website.");
         } finally {
            setLoading(false);
         }
      };
      fetchProducts();
   }, []);

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
      setBuyingProductId(productId);
      const chatUrl = `/dashboard/buyer/chat/${productId}`;
      router.push(chatUrl);
   };

   // Pagination logic
   const totalPages = Math.ceil(products.length / productsPerPage);
   const startIndex = (currentPage - 1) * productsPerPage;
   const currentProducts = products.slice(startIndex, startIndex + productsPerPage);

   const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-[5vw]">
               {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
               ))}
            </div>
         ) : currentProducts.length === 0 ? (
            <div className="flex justify-center items-center min-h-[40vh]">
               <p className="text-gray-600 text-center bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg">
                  ⚠️ No products available. Please check your internet connection and reload the website.
               </p>
            </div>
         ) : (
            <>
               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {currentProducts.map((product, i) => (
                     <div
                        key={product._id || i}
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

                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                        <p className="text-green-700 font-bold mt-2">Price: ₹{product.pricePerKg}/kg</p>

                        <p className="text-xs text-gray-500 mt-1">
                           Category: {product.category?.name || "Uncategorized"}
                        </p>
                        <p className="text-xs text-gray-500">
                           Seller: {product.seller?.storeName || product.seller?.name || "Unknown"}
                        </p>

                        <div className="mt-4">
                           {userRole === "buyer" ? (
                              <div className="flex gap-2">
                                 <button
                                    onClick={() => handleBuyNow(product._id)}
                                    disabled={buyingProductId === product._id || loading}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                 >
                                    {buyingProductId === product._id ? "Opening Chat..." : "Buy"}
                                 </button>

                                 <button
                                    onClick={() => router.push(`/dashboard/buyer/product/${product._id}`)}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                 >
                                    View Details
                                 </button>
                              </div>
                           ) : (
                              <p className="text-sm text-red-600 font-medium text-center border-t pt-3">
                                 Sellers are not allowed to buy products. Sign up as a Buyer to purchase products.
                              </p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>

               {/* Pagination Controls */}
               {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                     <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-md border bg-white hover:bg-gray-100 disabled:opacity-50"
                     >
                        Previous
                     </button>

                     {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                           key={index}
                           onClick={() => handlePageChange(index + 1)}
                           className={`px-3 py-2 rounded-md border ${currentPage === index + 1
                                 ? "bg-green-600 text-white border-green-600"
                                 : "bg-white hover:bg-gray-100"
                              }`}
                        >
                           {index + 1}
                        </button>
                     ))}

                     <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-md border bg-white hover:bg-gray-100 disabled:opacity-50"
                     >
                        Next
                     </button>
                  </div>
               )}
            </>
         )}
      </div>
   );
};

export default ShopPage;
