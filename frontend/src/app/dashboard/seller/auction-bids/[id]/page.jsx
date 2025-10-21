"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function ViewAuctionBidsPage() {
   const { id } = useParams(); // productId
   const { data: session } = useSession();
   const router = useRouter();

   const [bids, setBids] = useState([]);
   const [loading, setLoading] = useState(true);
   const [productName, setProductName] = useState("");

   useEffect(() => {
      const fetchBids = async () => {
         try {
            setLoading(true);

            const res = await fetch(`/api/bid?productId=${id}`);
            const data = await res.json();

            if (!res.ok) {
               toast.error(data.error || "Failed to load bids");
               return;
            }

            setBids(data);

            // Fetch product name (optional, for header)
            const productRes = await fetch(`/api/product/${id}`);
            if (productRes.ok) {
               const product = await productRes.json();
               setProductName(product.name);
            }
         } catch (err) {
            console.error("Error fetching bids:", err);
            toast.error("Failed to fetch bids");
         } finally {
            setLoading(false);
         }
      };

      if (id) fetchBids();
   }, [id]);

   return (
      <div className="p-6 min-h-[80vh]">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
               🧾 Bids for: {productName || "Auction Product"}
            </h1>
            <div className="mt-6 text-center">
               <p className="text-4xl font-semibold text-gray-700">
                  💰 Highest Bid: ₹
                  {Math.max(...bids.map((b) => b.amount)).toLocaleString()}
               </p>
            </div>
            <button
               onClick={() => router.back()}
               className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
               ← Back
            </button>
         </div>

         {loading ? (
            <p className="text-gray-600 text-center mt-10">Loading bids...</p>
         ) : bids.length === 0 ? (
            <p className="text-gray-600 text-center mt-10">
               No bids placed yet for this product.
            </p>
         ) : (
            <div className="overflow-x-auto">
               <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow">
                  <thead className="bg-gray-100">
                     <tr>
                        <th className="text-left px-4 py-2 border-b">#</th>
                        <th className="text-left px-4 py-2 border-b">Buyer Name</th>
                        <th className="text-left px-4 py-2 border-b">Email</th>
                        <th className="text-left px-4 py-2 border-b">Phone</th>
                        <th className="text-left px-4 py-2 border-b">Address</th>
                        <th className="text-left px-4 py-2 border-b">City</th>
                        <th className="text-left px-4 py-2 border-b">Pincode</th>
                        <th className="text-left px-4 py-2 border-b">Bid Amount (₹)</th>
                        <th className="text-left px-4 py-2 border-b">Placed On</th>
                     </tr>
                  </thead>
                  <tbody>
                     {bids.map((bid, index) => (
                        <tr key={bid._id} className="hover:bg-gray-50">
                           <td className="px-4 py-2 border-b">{index + 1}</td>
                           <td className="px-4 py-2 border-b">{bid.buyer?.name}</td>
                           <td className="px-4 py-2 border-b">{bid.buyer?.email}</td>
                           <td className="px-4 py-2 border-b">{bid.buyer?.phone}</td>
                           <td className="px-4 py-2 border-b">{bid.buyer?.address}</td>
                           <td className="px-4 py-2 border-b">{bid.buyer?.city}</td>
                           <td className="px-4 py-2 border-b">{bid.buyer?.pinCode}</td>
                           <td className="px-4 py-2 border-b font-semibold text-green-700">
                              ₹{bid.amount}
                           </td>
                           <td className="px-4 py-2 border-b text-sm text-gray-500">
                              {new Date(bid.createdAt).toLocaleString()}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
}
