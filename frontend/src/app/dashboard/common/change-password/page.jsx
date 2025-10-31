"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
   const [currentPassword, setCurrentPassword] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [message, setMessage] = useState("");
   const [loading, setLoading] = useState(false);

   const handleChangePassword = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/change-password", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      setLoading(false);
      setMessage(data.message || data.error);
   };

   return (
      <div className="max-w-md mx-auto my-10 border p-6 rounded-xl shadow bg-white">
         <h1 className="text-2xl font-bold mb-4 text-center">Change Password</h1>

         <form onSubmit={handleChangePassword} className="space-y-4">
            <input
               type="password"
               placeholder="Enter current password"
               value={currentPassword}
               onChange={(e) => setCurrentPassword(e.target.value)}
               className="w-full p-2 border rounded"
               required
            />

            <input
               type="password"
               placeholder="Enter new password"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               className="w-full p-2 border rounded"
               required
            />

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
               {loading ? "Updating..." : "Update Password"}
            </button>
         </form>

         {message && (
            <p
               className={`mt-4 text-center ${message.includes("success")
                     ? "text-green-600"
                     : "text-red-600"
                  }`}
            >
               {message}
            </p>
         )}
      </div>
   );
}
