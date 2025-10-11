"use client"

import Image from "next/image"
import { Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
   return (
      <footer className="w-full border-t bg-muted/30 text-muted-foreground">
         <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">

            {/* Brand / About */}
            <div className="col-span-2 sm:col-span-1">
               <h2 className="text-xl font-semibold text-foreground mb-3">Kabaadi Mandi</h2>
               <p className="text-sm leading-relaxed">
                  Your one-stop marketplace for buying and selling scrap metals. Join us to turn your waste into wealth!
               </p>
               <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                     <Phone className="h-4 w-4" />
                     <span>+91 8003316534</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Mail className="h-4 w-4" />
                     <span>kabaadmandi@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <MapPin className="h-4 w-4" />
                     <span>Delhi, India</span>
                  </div>
               </div>
            </div>

            {/* Become a Seller */}
            <div>
               <h3 className="text-base font-semibold text-foreground mb-3">Sell With Us</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-foreground transition-colors">Become a Regular Seller</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Become a Premium Seller</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Our Blogs</a></li>
               </ul>
            </div>

            {/* Help */}
            <div>
               <h3 className="text-base font-semibold text-foreground mb-3">Help</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms & Conditions</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Refund & Cancellation</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Shipping Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Your Order</a></li>
               </ul>
            </div>

            {/* Account */}
            <div>
               <h3 className="text-base font-semibold text-foreground mb-3">Account</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-foreground transition-colors">Sign in</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Create Account</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Orders</a></li>
               </ul>
            </div>

            {/* Company */}
            <div>
               <h3 className="text-base font-semibold text-foreground mb-3">Company</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Sitemap</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Become a Seller</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Sign in</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Register as Regular Seller</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Become a Premium Seller</a></li>
               </ul>
            </div>
         </div>

         {/* Payment Methods */}
         <div className="border-t bg-muted/40 py-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
               <p className="text-xs text-muted-foreground text-center sm:text-left">
                  © {new Date().getFullYear()} Kabaad Mandi. All rights reserved.
               </p>
               <div className="flex items-center justify-center gap-4">
                  <Image src="/payments/visa.svg" alt="Visa" width={48} height={30} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/paypal.svg" alt="PayPal" width={30} height={20} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/paytm.svg" alt="UPI" width={48} height={30} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/phonepe.svg" alt="UPI" width={30} height={20} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/googlepay.svg" alt="UPI" width={48} height={30} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/razorpay.svg" alt="UPI" width={30} height={20} className="opacity-80 hover:opacity-100" />
               </div>
            </div>
         </div>
      </footer>
   )
}
