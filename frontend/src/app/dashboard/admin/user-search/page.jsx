"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Spinner from "@/components/Loader/spinner/spinner";

export default function UserSearchPage() {
   const [code, setCode] = useState("");
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState(null);
   const [users, setUsers] = useState({ buyers: [], sellers: [] });
   const [fetchingUsers, setFetchingUsers] = useState(true);
   const [showUnsubscribedFirst, setShowUnsubscribedFirst] = useState(false);
   const [filterText, setFilterText] = useState("");
   const [selectedMonth, setSelectedMonth] = useState("");
   const [selectedYear, setSelectedYear] = useState("");

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

   // 🔍 Filter by text
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

   // 🗓️ Filter users by selected month & year for both subscribed & unsubscribed users
   const filterByMonthYear = (list) => {
      if (!selectedMonth && !selectedYear) return list;

      const filtered = list.filter((user) => {
         // Subscription date (if subscribed)
         const subDateStr = user.subscription?.startDate;
         // Signup date (fallback for unsubscribed users)
         const signupDateStr = user.createdAt || user.signupDate;

         const dateStr = subDateStr || signupDateStr;
         if (!dateStr) return false;

         const date = new Date(dateStr);
         const matchesMonth = selectedMonth
            ? date.getMonth() + 1 === Number(selectedMonth)
            : true;
         const matchesYear = selectedYear
            ? date.getFullYear() === Number(selectedYear)
            : true;

         return matchesMonth && matchesYear;
      });

      // Sort: subscribed users first, unsubscribed last
      return filtered.sort((a, b) => {
         const aSub = !!a.subscription;
         const bSub = !!b.subscription;
         return aSub === bSub ? 0 : aSub ? -1 : 1;
      });
   };

   // 🧩 Compute expiring soon users (within 10 days)
   const expiringSoonUsers = useMemo(() => {
      const now = new Date();
      const tenDaysLater = new Date();
      tenDaysLater.setDate(now.getDate() + 10);

      const isExpiringSoon = (user) => {
         const endDate = user.subscription?.endDate
            ? new Date(user.subscription.endDate)
            : null;
         return (
            endDate &&
            endDate >= now &&
            endDate <= tenDaysLater &&
            user.subscription?.status === "active"
         );
      };

      const buyersExpiring = users.buyers.filter(isExpiringSoon);
      const sellersExpiring = users.sellers.filter(isExpiringSoon);

      return { buyersExpiring, sellersExpiring };
   }, [users]);

   // 🧠 Derived lists (sorted + filtered + month/year)
   const buyersToShow = useMemo(() => {
      let result = sortUsers(users.buyers);
      result = filterList(result);
      result = filterByMonthYear(result);
      return result;
   }, [users, showUnsubscribedFirst, filterText, selectedMonth, selectedYear]);

   const sellersToShow = useMemo(() => {
      let result = sortUsers(users.sellers);
      result = filterList(result);
      result = filterByMonthYear(result);
      return result;
   }, [users, showUnsubscribedFirst, filterText, selectedMonth, selectedYear]);


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
                        {new Date(
                           data.subscription.endDate
                        ).toLocaleDateString()}
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
                     {data.user.isSuspended
                        ? "Unsuspend Account"
                        : "Suspend Account"}
                  </Button>
               </div>
            </div>
         )}

         {/* ⚠️ Expiring Soon Section */}
         {(expiringSoonUsers.buyersExpiring.length > 0 ||
            expiringSoonUsers.sellersExpiring.length > 0) && (
               <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold text-yellow-700 mb-3">
                     ⚠️ Subscriptions Expiring Within 10 Days
                  </h3>

                  {/* Buyers Expiring */}
                  {expiringSoonUsers.buyersExpiring.length > 0 && (
                     <div className="mb-4">
                        <h4 className="font-medium text-yellow-800 mb-2">🛒 Buyers</h4>
                        <table className="w-full border border-gray-200 text-sm">
                           <thead className="bg-yellow-100">
                              <tr>
                                 <th className="p-2 text-left">Name</th>
                                 <th className="p-2 text-left">Email</th>
                                 <th className="p-2 text-left">Phone</th>
                                 <th className="p-2 text-left">Buyer Code</th>
                                 <th className="p-2 text-left">Plan</th>
                                 <th className="p-2 text-left">End Date</th>
                              </tr>
                           </thead>
                           <tbody>
                              {expiringSoonUsers.buyersExpiring.map((b) => (
                                 <tr key={b._id} className="border-t">
                                    <td className="p-2">{b.name}</td>
                                    <td className="p-2">{b.email}</td>
                                    <td className="p-2">{b.phone}</td>
                                    <td className="p-2">{b.buyerCode}</td>
                                    <td className="p-2">
                                       {b.subscription?.planName || "—"}
                                    </td>
                                    <td className="p-2 text-red-600 font-semibold">
                                       {new Date(
                                          b.subscription.endDate
                                       ).toLocaleDateString()}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}

                  {/* Sellers Expiring */}
                  {expiringSoonUsers.sellersExpiring.length > 0 && (
                     <div>
                        <h4 className="font-medium text-yellow-800 mb-2">🏬 Sellers</h4>
                        <table className="w-full border border-gray-200 text-sm">
                           <thead className="bg-yellow-100">
                              <tr>
                                 <th className="p-2 text-left">Name</th>
                                 <th className="p-2 text-left">Email</th>
                                 <th className="p-2 text-left">Phone</th>
                                 <th className="p-2 text-left">Seller Code</th>
                                 <th className="p-2 text-left">Plan</th>
                                 <th className="p-2 text-left">End Date</th>
                              </tr>
                           </thead>
                           <tbody>
                              {expiringSoonUsers.sellersExpiring.map((s) => (
                                 <tr key={s._id} className="border-t">
                                    <td className="p-2">{s.ownerName}</td>
                                    <td className="p-2">{s.email}</td>
                                    <td className="p-2">{s.phone}</td>
                                    <td className="p-2">{s.sellerCode}</td>
                                    <td className="p-2">
                                       {s.subscription?.planName || "—"}
                                    </td>
                                    <td className="p-2 text-red-600 font-semibold">
                                       {new Date(
                                          s.subscription.endDate
                                       ).toLocaleDateString()}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            )}

         {/* 🧾 Buyer & Seller Lists */}
         <div className="mt-10 space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
               <h2 className="text-2xl font-semibold">👥 All Users Overview</h2>

               <div className="flex items-center flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                     <input
                        type="checkbox"
                        checked={showUnsubscribedFirst}
                        onChange={(e) => setShowUnsubscribedFirst(e.target.checked)}
                     />
                     Show unsubscribed users on top
                  </label>

                  {/* 📅 Month Selector */}
                  <select
                     value={selectedMonth}
                     onChange={(e) => setSelectedMonth(e.target.value)}
                     className="border rounded-md p-2 text-sm"
                  >
                     <option value="">All Months</option>
                     {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                           {new Date(0, i).toLocaleString("default", {
                              month: "long",
                           })}
                        </option>
                     ))}
                  </select>

                  {/* 📆 Year Selector */}
                  <select
                     value={selectedYear}
                     onChange={(e) => setSelectedYear(e.target.value)}
                     className="border rounded-md p-2 text-sm"
                  >
                     <option value="">All Years</option>
                     {Array.from({ length: 6 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                           <option key={year} value={year}>
                              {year}
                           </option>
                        );
                     })}
                  </select>

                  <Input
                     placeholder="Filter by name, email, or phone..."
                     value={filterText}
                     onChange={(e) => setFilterText(e.target.value)}
                     className="w-64"
                  />

                  {/* 🧹 Clear Filters Button */}
                  <Button
                     variant="outline"
                     onClick={() => {
                        setSelectedMonth("");
                        setSelectedYear("");
                        setFilterText("");
                        setShowUnsubscribedFirst(false);
                     }}
                     className="text-sm"
                  >
                     Clear Filters
                  </Button>
               </div>
            </div>

            {fetchingUsers ? (
               <div className="flex items-center justify-center">
                  <Spinner />
               </div>
            ) : (
               <>
                  {/* Buyers */}
                  <section>
                     <h3 className="text-xl font-semibold mb-2">🛒 Buyers</h3>
                     <table className="w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-100">
                           <tr>
                              <th className="p-2 text-left">Buyer Name</th>
                              <th className="p-2 text-left">Email</th>
                              <th className="p-2 text-left">Phone</th>
                              <th className="p-2 text-left">Buyer Code</th>
                              <th className="p-2 text-left">Price</th>
                              <th className="p-2 text-left">Subscription</th>
                              <th className="p-2 text-left">Start Date</th>
                              <th className="p-2 text-left">End Date</th>
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
                                       {buyer.subscription
                                          ? `₹${buyer.subscription.amount || 0}`
                                          : "—"}
                                    </td>
                                    <td className="p-2">
                                       {buyer.subscription?.status === "active"
                                          ? "✅ Active"
                                          : "❌ None"}
                                    </td>
                                    <td className="p-2">
                                       {buyer.subscription?.startDate
                                          ? new Date(
                                             buyer.subscription.startDate
                                          ).toLocaleDateString()
                                          : "—"}
                                    </td>
                                    <td className="p-2">
                                       {buyer.subscription?.endDate
                                          ? new Date(
                                             buyer.subscription.endDate
                                          ).toLocaleDateString()
                                          : "—"}
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td
                                    colSpan="8"
                                    className="text-center p-3 text-gray-500"
                                 >
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
                              <th className="p-2 text-left">Seller Name</th>
                              <th className="p-2 text-left">Email</th>
                              <th className="p-2 text-left">Phone</th>
                              <th className="p-2 text-left">Seller Code</th>
                              <th className="p-2 text-left">Price</th>
                              <th className="p-2 text-left">Subscription</th>
                              <th className="p-2 text-left">Start Date</th>
                              <th className="p-2 text-left">End Date</th>
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
                                    <td className="p-2">{seller.ownerName}</td>
                                    <td className="p-2">{seller.email}</td>
                                    <td className="p-2">{seller.phone}</td>
                                    <td className="p-2">{seller.sellerCode}</td>
                                    <td className="p-2">
                                       {seller.subscription
                                          ? `₹${seller.subscription.amount || 0}`
                                          : "—"}
                                    </td>
                                    <td className="p-2">
                                       {seller.subscription?.status === "active"
                                          ? "✅ Active"
                                          : "❌ None"}
                                    </td>
                                    <td className="p-2">
                                       {seller.subscription?.startDate
                                          ? new Date(
                                             seller.subscription.startDate
                                          ).toLocaleDateString()
                                          : "—"}
                                    </td>
                                    <td className="p-2">
                                       {seller.subscription?.endDate
                                          ? new Date(
                                             seller.subscription.endDate
                                          ).toLocaleDateString()
                                          : "—"}
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td
                                    colSpan="8"
                                    className="text-center p-3 text-gray-500"
                                 >
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
