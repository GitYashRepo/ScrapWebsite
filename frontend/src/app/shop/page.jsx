import SkeletonCard from "@/components/Loader/skeletoncard/skeleton";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
   Select,
   SelectTrigger,
   SelectValue,
   SelectContent,
   SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
   Tooltip,
   TooltipTrigger,
   TooltipContent,
   TooltipProvider,
} from "@/components/ui/tooltip";


// ✅ SEO metadata for the Shop Page
export const metadata = {
   title: "Shop Scrap Online | Buy Metal, Plastic, and E-Waste | Kabaad Mandi",
   description:
      "Explore and buy verified scrap materials online at Kabaad Mandi. Browse categories like metal, plastic, e-waste, and more — transparent pricing and trusted sellers across India.",
   keywords: [
      "Kabaad Mandi",
      "scrap marketplace",
      "buy scrap online",
      "sell scrap online",
      "metal scrap",
      "plastic scrap",
      "e-waste recycling",
      "scrap dealers India",
      "industrial waste",
      "scrap price per kg",
   ],
   openGraph: {
      title: "Shop Scrap Online | Buy Verified Scrap Materials | Kabaad Mandi",
      description:
         "Discover a wide range of scrap materials from verified sellers at Kabaad Mandi — India's trusted online scrap marketplace.",
      url: "https://www.kabaadmandi.com/shop",
      siteName: "Kabaad Mandi",
      images: [
         {
            url: "https://www.kabaadmandi.com/og-shop.jpg", // replace if you have a shop banner
            width: 1200,
            height: 630,
            alt: "Kabaad Mandi Shop Page - Scrap Marketplace",
         },
      ],
      locale: "en_IN",
      type: "website",
   },
   alternates: {
      canonical: "https://www.kabaadmandi.com/shop",
   },
};


const ShopPage = () => {
   const { id } = useParams();
   const router = useRouter();
   const { data: session } = useSession();

   const buyerId = session?.user?.id;
   const userRole = session?.user?.role?.toLowerCase();

   const [products, setProducts] = useState([]);
   const [filteredProducts, setFilteredProducts] = useState([]);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");
   const [buyingProductId, setBuyingProductId] = useState(null);
   const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

   const [currentPage, setCurrentPage] = useState(1);
   const productsPerPage = 16;

   // 🔹 Filter states
   const [priceRange, setPriceRange] = useState([0, 5000]); // min, max
   const [category, setCategory] = useState("");
   const [quantity, setQuantity] = useState("");
   const [seller, setSeller] = useState("");

   // Fetch products
   useEffect(() => {
      const fetchProducts = async () => {
         try {
            setLoading(true);
            const res = await fetch("/api/product", { method: "GET", credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
            setFilteredProducts(data);
         } catch (error) {
            console.error(error);
            setMessage("⚠️ Please check your internet connection and reload the website.");
         } finally {
            setLoading(false);
         }
      };
      fetchProducts();
   }, []);

   // Buyer subscription check
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
      router.push(`/dashboard/buyer/chat/${productId}`);
   };

   // ✅ Filter logic
   useEffect(() => {
      let filtered = [...products];

      filtered = filtered.filter(
         (p) => p.pricePerKg >= priceRange[0] && p.pricePerKg <= priceRange[1]
      );

      // ✅ Filter by category (ignore "all")
      if (category && category !== "all") {
         filtered = filtered.filter((p) => {
            const catName =
               typeof p.category === "string" ? p.category : p.category?.name;
            return catName?.toLowerCase() === category.toLowerCase();
         });
      }


      if (quantity)
         filtered = filtered.filter((p) => p.quantity >= Number(quantity));

      if (seller)
         filtered = filtered.filter(
            (p) =>
               p.seller?.storeName?.toLowerCase().includes(seller.toLowerCase()) ||
               p.seller?.name?.toLowerCase().includes(seller.toLowerCase())
         );

      setFilteredProducts(filtered);
   }, [priceRange, category, quantity, seller, products]);

   // Pagination logic
   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
   const startIndex = (currentPage - 1) * productsPerPage;
   const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

   const handlePageChange = (page) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   // Unique category list
   const categoryOptions = [
      ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
   ];

   // Determine max price dynamically for slider
   const maxProductPrice = Math.max(...products.map((p) => p.pricePerKg || 0), 5000);

   return (
      <div className="p-6 min-h-[80vh]">
         <h1 className="text-2xl font-bold mb-4">All Products</h1>

         {message && (
            <div className="mb-4 text-center text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded-lg">
               {message}
            </div>
         )}

         {/* 🔹 FILTERS SECTION */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
            {/* Price Range */}
            <TooltipProvider>
               <div className="px-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 pb-2">
                     Seller / Company
                  </label>
                  <div className="relative flex flex-col gap-2">
                     <Slider
                        value={priceRange}
                        min={0}
                        max={maxProductPrice}
                        step={10}
                        onValueChange={(value) => setPriceRange(value)}
                        className="w-full"
                        renderThumb={(props, index) => (
                           <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                 <div {...props} />
                              </TooltipTrigger>
                              <TooltipContent>
                                 ₹{priceRange[index]}
                              </TooltipContent>
                           </Tooltip>
                        )}
                     />

                     <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                     </div>
                  </div>
               </div>
            </TooltipProvider>


            {/* Category */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
               <Select value={category} onValueChange={(val) => setCategory(val)}>
                  <SelectTrigger className="w-full">
                     <SelectValue placeholder="All" />
                  </SelectTrigger>

                  {/* Make the dropdown content scrollable after ~3-4 items */}
                  <SelectContent>
                     <div className="max-h-36 overflow-y-auto">
                        {/* optionally keep an "All" disabled item or selectable */}
                        <SelectItem value="all">All</SelectItem>

                        {categoryOptions.map((cat, i) => (
                           <SelectItem key={i} value={cat}>
                              {cat}
                           </SelectItem>
                        ))}
                     </div>
                  </SelectContent>
               </Select>
            </div>

            {/* Quantity */}
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

            {/* Seller */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seller / Company
               </label>
               <input
                  type="text"
                  placeholder="Search by seller name"
                  className="border rounded-md p-2 w-full"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
               />
            </div>
         </div>

         {/* Products Section */}
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-[5vw]">
               {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
               ))}
            </div>
         ) : currentProducts.length === 0 ? (
            <div className="flex justify-center items-center min-h-[40vh]">
               <p className="text-gray-600 text-center bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg">
                  ⚠️ No products match your filters. Please adjust your selections.
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

                        <div className="flex flex-row justify-start items-start gap-10">
                           <div className="w-[80%]">
                              <h2 className="font-semibold text-lg">{product.name}</h2>
                           </div>
                           <div className="w-[20%]">
                              <p className="font-semibold">{product.quantity} Kg</p>
                           </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                        <p className="text-green-700 font-bold mt-2">
                           Price: ₹{product.pricePerKg}/kg
                        </p>

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
                                 Sellers are not allowed to buy products. Sign up as a Buyer to purchase.
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
