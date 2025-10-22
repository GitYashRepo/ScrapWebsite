"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SellerChatDashboard() {
   const { data: session, status } = useSession();
   const [buyers, setBuyers] = useState([]);
   const router = useRouter();

   useEffect(() => {
      if (!session?.user?.id) return;

      const fetchChats = async () => {
         try {
            const res = await fetch(`/api/chat/seller-sessions?sellerId=${session.user.id}`);
            const data = await res.json();
            setBuyers(data);
         } catch (error) {
            console.error("Failed to fetch chat sessions:", error);
         }
      };
      fetchChats();
   }, [status, session?.user?.id]);

   if (status === "loading") {
      return <div className="p-6 text-gray-500">Loading chat sessions...</div>;
   }

   if (!session) {
      return (
         <div className="p-6 text-red-500">
            You must be logged in as a seller to view chats.
         </div>
      );
   }

   return (
      <div className="p-6 max-w-5xl min-h-[80vh] mx-auto">
         <h1 className="text-2xl font-bold mb-6">🧑‍💼 Buyer Enquiries</h1>

         {buyers.length === 0 ? (
            <p className="text-gray-600">No buyer enquiries yet.</p>
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
                        {buyer.products.length} product{buyer.products.length > 1 ? "s" : ""}
                     </p>
                  </div>

                  <div className="space-y-2">
                     {buyer.products.map((product) => (
                        <button
                           key={product.sessionId}
                           onClick={() =>
                              router.push(`/dashboard/seller/chat/${product.sessionId}`)
                           }
                           className="w-full text-left border bg-white hover:bg-green-50 p-3 rounded-lg transition"
                        >
                           <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">
                                 {product.name}
                              </span>
                              <span className="text-sm text-green-700 font-semibold">
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
