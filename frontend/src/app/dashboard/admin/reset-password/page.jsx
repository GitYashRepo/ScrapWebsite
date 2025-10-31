"use client";

import { useState } from "react";

export default function AdminResetPassword() {
   const [email, setEmail] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [message, setMessage] = useState("");
   const [loading, setLoading] = useState(false);

   const handleReset = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/reset-password", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      setLoading(false);
      setMessage(data.message || data.error);
   };

   return (
      <div className="max-w-md mx-auto my-10 border p-6 rounded-xl shadow bg-white">
         <h1 className="text-2xl font-bold mb-4 text-center">
            Admin Reset Password
         </h1>

         <form onSubmit={handleReset} className="space-y-4">
            <input
               type="email"
               placeholder="Enter User Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full p-2 border rounded"
               required
            />

            <div className="relative">
               <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded pr-10"
                  required
               />
               <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
               >
                  {showPassword ? (
                     // 👁️‍🗨️ Eye-Off Icon
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="w-5 h-5"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           d="M3.98 8.223a10.477 10.477 0 00-.963 1.14C1.38 10.516 1 11.24 1 12s.38 1.484 2.017 2.637C4.676 16.519 8.058 18 12 18c1.49 0 2.915-.2 4.207-.561m3.902-2.221a10.475 10.475 0 00.964-1.139C22.62 13.484 23 12.76 23 12s-.38-1.484-2.017-2.637C19.324 7.481 15.942 6 12 6c-1.49 0-2.915.2-4.207.561M3 3l18 18"
                        />
                     </svg>
                  ) : (
                     // 👁️ Eye Icon
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="w-5 h-5"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z"
                        />
                        <circle cx="12" cy="12" r="3" />
                     </svg>
                  )}
               </button>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
               {loading ? "Resetting..." : "Reset Password"}
            </button>
         </form>

         {message && (
            <p
               className={`mt-4 text-center ${message.toLowerCase().includes("success")
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
