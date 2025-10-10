"use client";
import { useState } from "react";

export default function SignupPage() {
   const [role, setRole] = useState("buyer");
   const [form, setForm] = useState({});
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");

      const res = await fetch(`/api/signup/${role}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
         setMessage(data.message || "Account created successfully!");
         setForm({});
      } else {
         setMessage(data.error || "Something went wrong!");
      }
   };

   return (
      <div className="max-w-lg mx-auto mt-10 border p-6 rounded-xl shadow bg-white">
         <h1 className="text-3xl font-bold mb-4 text-center">
            Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
         </h1>

         <select
            onChange={(e) => setRole(e.target.value)}
            value={role}
            className="w-full p-2 border rounded mb-4"
         >
            <option value="admin">Admin</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
         </select>

         <form onSubmit={handleSubmit} className="space-y-3">
            {/* Admin Fields */}
            {role === "admin" && (
               <>
                  <input
                     name="email"
                     placeholder="Admin Email"
                     type="email"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="password"
                     placeholder="Password"
                     type="password"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
               </>
            )}

            {/* Buyer Fields */}
            {role === "buyer" && (
               <>
                  <input
                     name="name"
                     placeholder="Full Name"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="email"
                     placeholder="Email"
                     type="email"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="companyName"
                     placeholder="Company Name"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="gst"
                     placeholder="GST Number (15 digits)"
                     minLength={15}
                     maxLength={15}
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="address"
                     placeholder="Address"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="city"
                     placeholder="City"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="state"
                     placeholder="State"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="pinCode"
                     placeholder="Pincode"
                     type="number"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="phone"
                     placeholder="Phone Number"
                     type="number"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="password"
                     placeholder="Password"
                     type="password"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
               </>
            )}

            {/* Seller Fields */}
            {role === "seller" && (
               <>
                  <input
                     name="storeName"
                     placeholder="Store Name"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="ownerName"
                     placeholder="Owner Name"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="email"
                     placeholder="Email"
                     type="email"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="address"
                     placeholder="Address"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="city"
                     placeholder="City"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="state"
                     placeholder="State"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="pinCode"
                     placeholder="Pincode"
                     type="number"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="phone"
                     placeholder="Phone Number"
                     type="number"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
                  <input
                     name="password"
                     placeholder="Password"
                     type="password"
                     required
                     onChange={handleChange}
                     className="w-full p-2 border rounded"
                  />
               </>
            )}

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
               {loading ? "Creating..." : "Create Account"}
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
