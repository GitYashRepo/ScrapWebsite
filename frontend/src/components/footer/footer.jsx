"use client"

import Image from "next/image"
import { Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
   return (
      <footer className="w-full border-t bg-muted/30 text-muted-foreground">
         {/* Main Footer Section */}
         <div className="max-w-[90vw] mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand / About */}
            <div>
               <h2 className="text-xl font-semibold text-foreground mb-3">Kabaad Mandi</h2>
               <p className="text-sm leading-relaxed text-justify">
                  At Kabaad Mandi, we are revolutionizing the way scrap materials are bought and sold. Our platform connects sellers and buyers across industries, creating a transparent, efficient, and secure marketplace for scrap trading. Whether you’re looking to buy, sell, or auction industrial scrap, we make it simple with real-time bidding.
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

            {/* Help */}
            <div>
               <h3 className="text-base font-semibold text-foreground mb-3">Help</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</a></li>
                  <li><a href="/refund-cancellation" className="hover:text-foreground transition-colors">Refund & Cancellation</a></li>
               </ul>
            </div>

            {/* Quick Links */}
            <div>
               <h3 className="text-base font-semibold text-foreground mb-3">Quick Links</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="/shop" className="hover:text-foreground transition-colors">Shop</a></li>
                  <li><a href="/auctions" className="hover:text-foreground transition-colors">Auction</a></li>
                  <li><a href="/about" className="hover:text-foreground transition-colors">About Us</a></li>
                  <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
               </ul>
            </div>

            {/* Account */}
            <div>
               <h3 className="text-base font-semibold text-foreground mb-3">Account</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="/signin" className="hover:text-foreground transition-colors">Sign in</a></li>
                  <li><a href="/signup" className="hover:text-foreground transition-colors">Create Account</a></li>
                  <li><a href="/enquiries" className="hover:text-foreground transition-colors">Enquiry</a></li>
               </ul>
            </div>
         </div>

         {/* Payment Methods */}
         <div className="border-t bg-muted/40 py-6 pb-24">
            <div className="max-w-[90vw] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
               <p className="text-xs text-muted-foreground text-center sm:text-left">
                  © {new Date().getFullYear()} Kabaad Mandi. All rights reserved.
               </p>
               <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <Image src="/payments/visa.svg" alt="Visa" width={48} height={30} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/paypal.svg" alt="PayPal" width={30} height={20} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/paytm.svg" alt="Paytm" width={48} height={30} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/phonepe.svg" alt="PhonePe" width={30} height={20} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/googlepay.svg" alt="Google Pay" width={48} height={30} className="opacity-80 hover:opacity-100" />
                  <Image src="/payments/razorpay.svg" alt="Razorpay" width={30} height={20} className="opacity-80 hover:opacity-100" />
               </div>
            </div>
         </div>
      </footer>
   )
}
