"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SkeletonCard from "@/components/Loader/skeletoncard/skeleton";
import Link from "next/link";
import { toast } from "sonner"


export default function SellerDashboard() {
   const { data: session } = useSession();
   const [products, setProducts] = useState([]);
   const [auctionProducts, setAuctionProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const router = useRouter();


   useEffect(() => {
      async function setupPush() {
         if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

         const reg = await navigator.serviceWorker.register("/sw.js");
         const permission = await Notification.requestPermission();
         if (permission !== "granted") return;

         const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY; // Add in .env.local
         const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
         });

         await fetch("/api/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               sellerId: session?.user?.id,
               subscription,
            }),
         });
      }

      if (session?.user?.id) setupPush();
   }, [session]);

   function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i)
         outputArray[i] = rawData.charCodeAt(i);
      return outputArray;
   }


   const fetchProducts = async () => {
      try {
         setLoading(true);
         const res = await fetch("/api/product");
         const data = await res.json();

         if (res.ok) {
            // Separate auction and normal products
            const normal = data.filter((p) => !p.isAuction);
            const auctions = data.filter((p) => p.isAuction);
            setProducts(normal);
            setAuctionProducts(auctions);
         }
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchProducts();
   }, []);

   // 🔹 Subscription checker
   const checkSubscription = async () => {
      if (!session?.user?.id) {
         toast.info("Please log in first.");
         return false;
      }

      const res = await fetch("/api/subscription/check", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            userId: session.user.id,
            userType: "Seller",
         }),
         cache: "no-store",
      });

      const data = await res.json();
      return data.active;
   };

   const handleRestrictedAction = async (path) => {
      const isActive = await checkSubscription();

      if (isActive) {
         router.push(path);
      } else {
         if (
            confirm(
               "You need an active subscription to access this feature. Purchase a plan now?"
            )
         ) {
            router.push("/dashboard/seller/subscription");
         }
      }
   };


   const handleDelete = async (id) => {
      if (!confirm("Are you sure you want to delete this product?")) return;

      const res = await fetch(`/api/product/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
   };

   return (
      <div className="p-6 min-h-[80vh] space-y-10">
         {/* Header */}
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Products</h1>
            <div className="flex flex-row gap-4">
               <button
                  onClick={() => handleRestrictedAction("/dashboard/seller/addproduct")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
               >
                  + Add Product
               </button>

               <button
                  onClick={() => handleRestrictedAction("/dashboard/seller/addauctionproduct")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg"
               >
                  + Add Auction Product
               </button>

               <button
                  onClick={() => handleRestrictedAction("/dashboard/seller/chat")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
               >
                  💬 Chats
               </button>
               <Link
                  href={"/dashboard/seller/subscription"}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
               >
                  Active Subscription
               </Link>
            </div>
         </div>

         {loading ? (
            // 🔹 Show skeletons while loading
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-[5vw]">
               {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
               ))}
            </div>
         ) : (
            <>
               {/* Normal Products Section */}
               <section>
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                     🛒 Normal Products
                  </h2>

                  {products.length === 0 ? (
                     <p className="text-gray-600">No normal products listed yet.</p>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {products.map((p) => (
                           <div key={p._id} className="border rounded-lg p-4 shadow">
                              <img
                                 src={p.images?.[0] || "/placeholder.jpg"}
                                 alt={p.name}
                                 className="w-full h-48 object-cover rounded"
                              />
                              <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
                              <p className="text-gray-600 text-sm">{p.category?.name}</p>
                              <p className="text-gray-900 font-bold mt-1">
                                 ₹{p.pricePerKg}/kg
                              </p>
                              {/* 🔹 Availability Dropdown */}
                              <div className="mt-3">
                                 <label className="text-sm text-gray-500 mr-2">Status:</label>
                                 <select
                                    value={p.status}
                                    onChange={async (e) => {
                                       const newStatus = e.target.value;
                                       try {
                                          const res = await fetch(`/api/product/${p._id}`, {
                                             method: "PATCH",
                                             headers: { "Content-Type": "application/json" },
                                             body: JSON.stringify({ status: newStatus }),
                                          });
                                          const data = await res.json();
                                          if (res.ok) {
                                             toast.success(`✅ Product marked as "${newStatus}"`);
                                             // Update locally to avoid refetch
                                             setProducts((prev) =>
                                                prev.map((prod) =>
                                                   prod._id === p._id ? { ...prod, status: newStatus } : prod
                                                )
                                             );
                                             setAuctionProducts((prev) =>
                                                prev.map((prod) =>
                                                   prod._id === p._id ? { ...prod, status: newStatus } : prod
                                                )
                                             );
                                          } else {
                                             toast.error(data.error || "Failed to update status");
                                          }
                                       } catch (err) {
                                          toast.error("Error updating status");
                                       }
                                    }}
                                    className={`border rounded px-2 py-1 mt-1 ${p.status === "available"
                                       ? "bg-green-100 text-green-700"
                                       : p.status === "out-of-stock"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                       }`}
                                 >
                                    <option value="available">Available</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                    <option value="discontinued">Discontinued</option>
                                 </select>
                              </div>
                              <div className="flex flex-row gap-2">
                                 <button
                                    onClick={() => handleDelete(p._id)}
                                    className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
                                 >
                                    Delete
                                 </button>
                                 <button
                                    onClick={() => router.push(`/dashboard/seller/editproduct/${p._id}`)}
                                    className="mt-3 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                 >
                                    ✏️ Edit
                                 </button>
                              </div>

                           </div>
                        ))}
                     </div>
                  )}
               </section>

               {/* Auction Products Section */}
               <section>
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                     🕒 Auction Products
                  </h2>

                  {auctionProducts.length === 0 ? (
                     <p className="text-gray-600">
                        No auction products added yet.
                     </p>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {auctionProducts.map((p) => (
                           <div
                              key={p._id}
                              className="border rounded-lg p-4 shadow bg-purple-50"
                           >
                              <img
                                 src={p.images?.[0] || "/placeholder.jpg"}
                                 alt={p.name}
                                 className="w-full h-48 object-cover rounded"
                              />
                              <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
                              <p className="text-gray-600 text-sm">{p.category?.name}</p>
                              <p className="text-gray-900 font-bold mt-1">
                                 ₹{p.pricePerKg}/kg
                              </p>

                              {/* 🔹 Availability Dropdown */}
                              <div className="mt-3">
                                 <label className="text-sm text-gray-500 mr-2">Status:</label>
                                 <select
                                    value={p.status}
                                    onChange={async (e) => {
                                       const newStatus = e.target.value;
                                       try {
                                          const res = await fetch(`/api/auctionproduct/${p._id}`, {
                                             method: "PATCH",
                                             headers: { "Content-Type": "application/json" },
                                             body: JSON.stringify({ status: newStatus }),
                                          });
                                          const data = await res.json();
                                          if (res.ok) {
                                             toast.success(`✅ Auction product marked as "${newStatus}"`);
                                             setAuctionProducts((prev) =>
                                                prev.map((prod) =>
                                                   prod._id === p._id ? { ...prod, status: newStatus } : prod
                                                )
                                             );
                                          } else {
                                             toast.error(data.error || "Failed to update status");
                                          }
                                       } catch (err) {
                                          toast.error("Error updating auction product status");
                                       }
                                    }}
                                    className={`border rounded px-2 py-1 mt-1 ${p.status === "available"
                                       ? "bg-green-100 text-green-700"
                                       : p.status === "out-of-stock"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                       }`}
                                 >
                                    <option value="available">Available</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                    <option value="discontinued">Discontinued</option>
                                 </select>
                              </div>


                              {/* Auction Info */}
                              <p className="text-sm text-gray-700 mt-2">
                                 ⏰ Ends on:{" "}
                                 <span className="font-semibold text-purple-700">
                                    {new Date(p.auctionEnd).toLocaleString()}
                                 </span>
                              </p>
                              <div className="flex flex-row gap-2">
                                 <button
                                    onClick={() => handleDelete(p._id)}
                                    className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
                                 >
                                    Delete
                                 </button>
                                 <button
                                    onClick={() => router.push(`/dashboard/seller/editauctionproduct/${p._id}`)}
                                    className="mt-3 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                 >
                                    ✏️ Edit
                                 </button>
                                 <button
                                    onClick={() => router.push(`/dashboard/seller/auction-bids/${p._id}`)}
                                    className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                 >
                                    👁️ View Bids
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </section>
            </>
         )}
      </div>
   );
}
