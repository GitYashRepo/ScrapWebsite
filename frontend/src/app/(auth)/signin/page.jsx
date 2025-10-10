"use client";
import Link from "next/link";

export default function SignInRoleSelection() {
        return (
                <div className="max-w-md mx-auto mt-20 text-center space-y-6">
                        <h1 className="text-3xl font-bold">Sign In</h1>
                        <p className="text-gray-600">Choose your account type:</p>
                        <div className="flex flex-col space-y-3">
                                <Link href="/signin/admin" className="block bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
                                        Sign in as Admin
                                </Link>
                                <Link href="/signin/buyer" className="block bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                        Sign in as Buyer
                                </Link>
                                <Link href="/signin/seller" className="block bg-green-600 text-white py-2 rounded hover:bg-green-700">
                                        Sign in as Seller
                                </Link>
                        </div>
                </div>
        );
}
