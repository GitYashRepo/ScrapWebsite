"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInForm({ role }) {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [error, setError] = useState("");

        const handleSubmit = async (e) => {
                e.preventDefault();
                setError("");
                const res = await signIn("credentials", {
                        redirect: false,
                        email,
                        password,
                        callbackUrl: `/dashboard/${role}`,
                });

                if (res.error) setError(res.error);
                else window.location.href = `/dashboard/${role}`;
        };

        return (
                <div className="max-w-md mx-auto mt-16 border p-6 rounded-xl shadow bg-white">
                        <h1 className="text-2xl font-bold mb-4 text-center">
                                {role.charAt(0).toUpperCase() + role.slice(1)} Sign In
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-2 border rounded"
                                />
                                <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-2 border rounded"
                                />
                                {error && <p className="text-red-600 text-sm">{error}</p>}
                                <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                >
                                        Sign In
                                </button>
                        </form>
                </div>
        );
}
