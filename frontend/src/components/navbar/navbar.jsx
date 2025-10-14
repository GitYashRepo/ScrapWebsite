"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, Search, ShoppingCart, User, ChevronDown, Store, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
   const [category, setCategory] = React.useState("all");
   const { data: session, status } = useSession();

   const SearchBar = () => (
      <form
         className="flex w-[100%] justify-center items-stretch gap-2"
         onSubmit={(e) => e.preventDefault()}
         role="search"
         aria-label="Product search"
      >
         <div className="flex w-[100%] items-stretch gap-2 rounded-md bg-background">
            <Input
               className="flex-1 border-none"
               placeholder="Search products"
               aria-label="Search products"
            />
            <Select value={category} onValueChange={setCategory}>
               <SelectTrigger className="w-auto">
                  <SelectValue placeholder="All categories" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="metals">Metals</SelectItem>
                  <SelectItem value="plastics">Plastics</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
               </SelectContent>
            </Select>
            <Button type="submit" variant="default" className="shrink-0">
               <Search className="h-4 w-4" />
            </Button>
         </div>
      </form>
   )

   // const AuthCart = () => (
   //    <div className="flex items-center gap-4">
   //       <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
   //          <User className="h-4 w-4" aria-hidden="true" />
   //          <span className="flex flex-col">
   //             <span>Seller</span>
   //             <span>Sign In/ Register</span>
   //          </span>
   //       </Link>
   //       <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
   //          <User className="h-4 w-4" aria-hidden="true" />
   //          <span className="flex flex-col">
   //             <span>Buyer</span>
   //             <span>Sign In/ Register</span>
   //          </span>
   //       </Link>
   //       <Link
   //          href="/cart"
   //          className="relative inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
   //          aria-label="Cart"
   //       >
   //          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
   //          <span>Cart</span>
   //          <span
   //             aria-label="Cart items"
   //             className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground"
   //          >
   //             0
   //          </span>
   //       </Link>
   //    </div>
   // )
   const AuthCart = () => {
      if (status === "loading") {
         return <div className="text-sm text-muted-foreground">Loading...</div>;
      }

      if (session?.user) {
         const { name, role } = session.user;

         return (
            <div className="flex items-center gap-4">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button
                        variant="ghost"
                        className="inline-flex items-center gap-2 text-sm"
                     >
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span>
                           {name || "User"}{" "}
                           <span className="text-muted-foreground text-xs capitalize">
                              ({role})
                           </span>
                        </span>
                        <ChevronDown className="h-3 w-3 opacity-70" aria-hidden="true" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuLabel>Account</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link href={`/dashboard/${role}`}>Dashboard</Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 text-red-600"
                     >
                        <LogOut className="h-4 w-4" />
                        Sign out
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <Link
                  href="/cart"
                  className="relative inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  aria-label="Cart"
               >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  <span>Cart</span>
                  <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground">
                     0
                  </span>
               </Link>
            </div>
         );
      }

      // 🧑‍💻 Not signed in → show sign in button
      return (
         <Link href="/signup" className="inline-block">
            <Button variant="outline" className="text-sm">
               <User className="h-4 w-4 mr-2" />
               Sign In / Register
            </Button>
         </Link>
      );
   };

   const BottomNav = () => (
      <nav className="w-full border-t border-b bg-background">
         <div className="mx-auto flex max-w-[90vw] items-center gap-4 py-1">
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="inline-flex items-center gap-2">
                     <Menu className="h-4 w-4" aria-hidden="true" />
                     Categories
                     <ChevronDown className="h-4 w-4 opacity-70" aria-hidden="true" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="">
                  <DropdownMenuLabel>Browse categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                     <Store className="h-4 w-4" /> Metals
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                     <Store className="h-4 w-4" /> Plastics
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                     <Store className="h-4 w-4" /> Paper
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                     <Store className="h-4 w-4" /> Electronics
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/dashboard/buyer/auctions" className="text-sm text-foreground hover:underline">
               Auctions
            </Link>
         </div>
      </nav>
   )

   const MobileSheet = () => (
      <Sheet>
         <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
               <Menu className="h-5 w-5" />
               <span className="sr-only">Open menu</span>
            </Button>
         </SheetTrigger>
         <SheetContent side="left" className="w-[300px] sm:w-[360px]">
            <SheetHeader>
               <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3">
               <SearchBar />
               <div className="grid gap-2 pt-3">
                  <Link href="#" className="text-sm hover:underline">
                     Become a Regular Seller
                  </Link>
                  <Link href="#" className="text-sm hover:underline">
                     Become a Premium Seller
                  </Link>
                  <Link href="#" className="text-sm hover:underline">
                     Contact Us
                  </Link>
                  <Link href="#" className="text-sm hover:underline">
                     Our Blogs
                  </Link>
               </div>
               <div className="grid gap-2 pt-4">
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="justify-between">
                           Categories
                           <ChevronDown className="h-4 w-4 opacity-70" />
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel>Browse categories</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Metals</DropdownMenuItem>
                        <DropdownMenuItem>Plastics</DropdownMenuItem>
                        <DropdownMenuItem>Paper</DropdownMenuItem>
                        <DropdownMenuItem>Electronics</DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>

                  <Link href="#" className="text-sm hover:underline">
                     Auctions
                  </Link>
                  <Link href="#" className="text-sm hover:underline">
                     Tenders
                  </Link>
                  <Link href="#" className="text-sm hover:underline">
                     Make an Offer
                  </Link>
               </div>

               <div className="pt-4">
                  <AuthCart />
               </div>
            </div>
         </SheetContent>
      </Sheet>
   )

   return (
      <header
         className={cn(
            "transition-all duration-300 ease-in-out",
         )}
      >
         {/* Mainbar */}
         <div className="border-b bg-background top-0 left-0 w-full">
            <div className="mx-auto flex max-w-[90vw] bg-white items-center justify-between gap-4 py-1">
               <div className="flex items-center gap-3">
                  <MobileSheet />
                  <Link href="/" className="flex items-center gap-2">
                     <img src="/Logo/logo.png" alt="Brand logo" className="w-[350px]" />
                  </Link>
               </div>

               <div className="hidden max-w-2xl md:block">
                  <SearchBar />
               </div>

               <div className="hidden md:block">
                  <AuthCart />
               </div>
            </div>
            {/* Bottom navigation */}
            <BottomNav />
         </div>


         {/* Mobile search under bottom nav for better reachability */}
         <div className="border-t bg-background px-4 py-1 md:hidden">
            <SearchBar />
         </div>
      </header>
   )
}

export default Navbar
