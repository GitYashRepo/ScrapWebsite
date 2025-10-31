"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UserSearchPage() {
   const [code, setCode] = useState("");
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState(null);
   const [users, setUsers] = useState({ buyers: [], sellers: [] });
   const [fetchingUsers, setFetchingUsers] = useState(true);
   const [showUnsubscribedFirst, setShowUnsubscribedFirst] = useState(false);
   const [filterText, setFilterText] = useState(""); // 🔍 filter input text

   // 🧩 Fetch all buyers & sellers on load
   useEffect(() => {
      const fetchUsers = async () => {
         setFetchingUsers(true);
         try {
            const res = await fetch("/api/admin/all-users");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to fetch users");
            setUsers(json);
         } catch (err) {
            toast.error(err.message);
         } finally {
            setFetchingUsers(false);
         }
      };
      fetchUsers();
   }, []);

   // 🔍 Search user by Code
   const handleSearch = async () => {
      if (!code.trim()) return toast("Enter a valid code!");
      setLoading(true);
      setData(null);
      try {
         const res = await fetch("/api/admin/user-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
         });
         const json = await res.json();
         if (!res.ok) throw new Error(json.error || "Search failed");
         setData(json);
      } catch (err) {
         toast.error(err.message);
      } finally {
         setLoading(false);
      }
   };

   // 🚫 Suspend / Unsuspend
   const toggleSuspend = async () => {
      if (!data) return;
      const action = data.user.isSuspended ? "unsuspend" : "suspend";
      try {
         const res = await fetch("/api/admin/user-search", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, action }),
         });
         const json = await res.json();
         if (!res.ok) throw new Error(json.error || "Failed to update");
         toast.success(json.message);
         setData((prev) => ({ ...prev, user: json.user }));
      } catch (err) {
         toast.error(err.message);
      }
   };

   // 🧮 Sort unsubscribed to top
   const sortUsers = (list) => {
      if (!showUnsubscribedFirst) return list;
      return [...list].sort((a, b) => {
         const aActive = a.subscription?.status === "active";
         const bActive = b.subscription?.status === "active";
         return aActive === bActive ? 0 : aActive ? 1 : -1;
      });
   };

   // 🧩 Filter logic (case-insensitive)
   const filterList = (list) => {
      if (!filterText.trim()) return list;
      const text = filterText.toLowerCase();
      return list.filter(
         (item) =>
            item.name?.toLowerCase().includes(text) ||
            item.ownerName?.toLowerCase().includes(text) ||
            item.email?.toLowerCase().includes(text) ||
            item.phone?.toString().includes(text)
      );
   };

   // 🧠 Derived lists (sorted + filtered)
   const buyersToShow = useMemo(
      () => filterList(sortUsers(users.buyers)),
      [users, showUnsubscribedFirst, filterText]
   );

   const sellersToShow = useMemo(
      () => filterList(sortUsers(users.sellers)),
      [users, showUnsubscribedFirst, filterText]
   );

   return (
      <div className="p-6 space-y-8">
         <h2 className="text-2xl font-semibold">🔍 Search User by Code</h2>

         {/* Search Section */}
         <div className="flex gap-3">
            <Input
               placeholder="Enter Buyer or Seller Code (e.g., 2025-B-50001)"
               value={code}
               onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={loading}>
               {loading ? "Searching..." : "Search"}
            </Button>
         </div>

         {/* Individual User Details */}
         {data && (
            <div className="mt-6 border rounded-xl p-4 shadow-sm space-y-3">
               <h3 className="text-xl font-semibold text-gray-800">
                  {data.userType} Details
               </h3>

               <div className="grid grid-cols-2 gap-4">
                  {Object.entries(data.user).map(([key, value]) =>
                     key !== "password" ? (
                        <div key={key}>
                           <span className="font-medium">{key}: </span>
                           <span>{String(value)}</span>
                        </div>
                     ) : null
                  )}
               </div>

               {data.subscription ? (
                  <div className="mt-4 p-3 border rounded-md bg-gray-50">
                     <h4 className="font-semibold">Subscription Details</h4>
                     <p>Plan: {data.subscription.planName}</p>
                     <p>Amount: ₹{data.subscription.amount}</p>
                     <p>Status: {data.subscription.status}</p>
                     <p>
                        Valid till:{" "}
                        {new Date(data.subscription.endDate).toLocaleDateString()}
                     </p>
                  </div>
               ) : (
                  <p className="text-gray-500">No active subscription found</p>
               )}

               <div className="mt-4">
                  <Button
                     variant={data.user.isSuspended ? "secondary" : "destructive"}
                     onClick={toggleSuspend}
                  >
                     {data.user.isSuspended ? "Unsuspend Account" : "Suspend Account"}
                  </Button>
               </div>
            </div>
         )}

         {/* 🧾 Buyer & Seller Lists */}
         <div className="mt-10 space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
               <h2 className="text-2xl font-semibold">👥 All Users Overview</h2>

               <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                     <input
                        type="checkbox"
                        checked={showUnsubscribedFirst}
                        onChange={(e) => setShowUnsubscribedFirst(e.target.checked)}
                     />
                     Show unsubscribed users on top
                  </label>

                  <Input
                     placeholder="Filter by name, email, or phone..."
                     value={filterText}
                     onChange={(e) => setFilterText(e.target.value)}
                     className="w-64"
                  />
               </div>
            </div>

            {fetchingUsers ? (
               <p>Loading users...</p>
            ) : (
               <>
                  {/* Buyers */}
                  <section>
                     <h3 className="text-xl font-semibold mb-2">🛒 Buyers</h3>
                     <table className="w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-100">
                           <tr>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">Email</th>
                              <th className="p-2 text-left">Phone</th>
                              <th className="p-2 text-left">Code</th>
                              <th className="p-2 text-left">Subscription</th>
                           </tr>
                        </thead>
                        <tbody>
                           {buyersToShow.length > 0 ? (
                              buyersToShow.map((buyer) => (
                                 <tr
                                    key={buyer._id}
                                    className={`border-t ${!buyer.subscription ? "bg-red-50" : ""
                                       }`}
                                 >
                                    <td className="p-2">{buyer.name}</td>
                                    <td className="p-2">{buyer.email}</td>
                                    <td className="p-2">{buyer.phone}</td>
                                    <td className="p-2">{buyer.buyerCode}</td>
                                    <td className="p-2">
                                       {buyer.subscription?.status === "active"
                                          ? "✅ Active"
                                          : "❌ None"}
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td colSpan="5" className="text-center p-3 text-gray-500">
                                    No buyers found
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </section>

                  {/* Sellers */}
                  <section>
                     <h3 className="text-xl font-semibold mb-2">🏬 Sellers</h3>
                     <table className="w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-100">
                           <tr>
                              <th className="p-2 text-left">Store</th>
                              <th className="p-2 text-left">Owner</th>
                              <th className="p-2 text-left">Email</th>
                              <th className="p-2 text-left">Phone</th>
                              <th className="p-2 text-left">Code</th>
                              <th className="p-2 text-left">Subscription</th>
                           </tr>
                        </thead>
                        <tbody>
                           {sellersToShow.length > 0 ? (
                              sellersToShow.map((seller) => (
                                 <tr
                                    key={seller._id}
                                    className={`border-t ${!seller.subscription ? "bg-red-50" : ""
                                       }`}
                                 >
                                    <td className="p-2">{seller.storeName}</td>
                                    <td className="p-2">{seller.ownerName}</td>
                                    <td className="p-2">{seller.email}</td>
                                    <td className="p-2">{seller.phone}</td>
                                    <td className="p-2">{seller.sellerCode}</td>
                                    <td className="p-2">
                                       {seller.subscription?.status === "active"
                                          ? "✅ Active"
                                          : "❌ None"}
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td colSpan="6" className="text-center p-3 text-gray-500">
                                    No sellers found
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </section>
               </>
            )}
         </div>
      </div>
   );
}
