"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UserSearchPage() {
   const [code, setCode] = useState("");
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState(null);

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

   return (
      <div className="p-6 space-y-6">
         <h2 className="text-2xl font-semibold">🔍 Search User by Code</h2>

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
      </div>
   );
}
