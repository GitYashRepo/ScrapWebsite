"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BuyerEnquiriesPage() {
   const { data: session, status } = useSession();
   const [buyers, setBuyers] = useState([]);
   const router = useRouter();

   useEffect(() => {
      if (!session?.user?.id) return;

      const fetchChats = async () => {
         try {
            // Fetch chat sessions where buyer is the current user
            const res = await fetch(`/api/chat/buyer-sessions?buyerId=${session.user.id}`);
            const data = await res.json();
            setBuyers(data);
         } catch (error) {
            console.error("Failed to fetch chat sessions:", error);
         }
      };

      fetchChats();
   }, [status, session?.user?.id]);

   if (status === "loading") {
      return <div className="p-6 text-gray-500">Loading your enquiries...</div>;
   }

   if (!session) {
      return (
         <div className="p-6 text-red-500">
            You must be logged in as a buyer to view enquiries.
         </div>
      );
   }

   return (
      <div className="p-6 max-w-5xl mx-auto">
         <h1 className="text-2xl font-bold mb-6">📩 Your Enquiries</h1>

         {buyers.length === 0 ? (
            <p className="text-gray-600">You haven’t contacted any sellers yet.</p>
         ) : (
            buyers.map((buyer) => (
               <div
                  key={buyer._id}
                  className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50 shadow-sm"
               >
                  <div className="flex justify-between items-center mb-3">
                     <div>
                        <h2 className="text-lg font-semibold">{buyer.name}</h2>
                        <p className="text-sm text-gray-600">{buyer.email}</p>
                     </div>
                     <p className="text-xs text-gray-500">
                        {buyer.products.length} product
                        {buyer.products.length > 1 ? "s" : ""}
                     </p>
                  </div>

                  <div className="space-y-2">
                     {buyer.products.map((product) => (
                        <button
                           key={product.sessionId}
                           onClick={() =>
                              router.push(`/dashboard/buyer/chat/${product.sessionId}`)
                           }
                           className="w-full text-left border bg-white hover:bg-blue-50 p-3 rounded-lg transition"
                        >
                           <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">
                                 {product.name}
                              </span>
                              <span className="text-sm text-blue-700 font-semibold">
                                 ₹{product.pricePerKg}/kg
                              </span>
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            ))
         )}
      </div>
   );
}
