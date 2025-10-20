"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, User, ChevronDown, Store, LogOut } from "lucide-react"
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
import { useRouter } from "next/navigation";
import {
   Command,
   CommandGroup,
   CommandItem,
   CommandList,
   CommandEmpty,
} from "@/components/ui/command";
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Navbar() {
   const [category, setCategory] = React.useState("all");
   const [categories, setCategories] = React.useState([]);
   const { data: session, status } = useSession();


   // ✅ Fetch all categories
   React.useEffect(() => {
      const fetchCategories = async () => {
         try {
            const res = await fetch("/api/category");
            const data = await res.json();
            setCategories(data);
         } catch (error) {
            console.error("Error fetching categories:", error);
         }
      };
      fetchCategories();
   }, []);

   const SearchBar = () => {
      const [searchTerm, setSearchTerm] = React.useState("");
      const [filteredCategories, setFilteredCategories] = React.useState([]);
      const [open, setOpen] = React.useState(false);
      const [category, setCategory] = React.useState("all");
      const router = useRouter();

      React.useEffect(() => {
         if (searchTerm.trim() === "") {
            setFilteredCategories([]);
         } else {
            const matches = categories.filter((cat) =>
               cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCategories(matches);
         }
      }, [searchTerm, categories]);

      const handleSearch = (e) => {
         e.preventDefault();
         if (filteredCategories.length > 0) {
            // Navigate to first matched category
            router.push(`/categories/${filteredCategories[0]._id}`);
         } else {
            toast.error("No Category Available!");
         }
      };

      return (
         <form
            className="flex w-[100%] justify-center items-stretch gap-2"
            onSubmit={handleSearch}
         >
            <Popover open={open} onOpenChange={setOpen}>
               <PopoverTrigger asChild>
                  <div className="relative w-full">
                     <Input
                        value={searchTerm}
                        onChange={(e) => {
                           setSearchTerm(e.target.value);
                           setOpen(true);
                        }}
                        placeholder="Search categories"
                        className="w-full"
                     />
                     <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
               </PopoverTrigger>

               <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
               >
                  <Command>
                     <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                           {filteredCategories.map((cat) => (
                              <CommandItem
                                 key={cat._id}
                                 value={cat.name}
                                 onSelect={() => {
                                    router.push(`/categories/${cat._id}`);
                                    setOpen(false);
                                 }}
                              >
                                 {cat.name}
                              </CommandItem>
                           ))}
                        </CommandGroup>
                     </CommandList>
                  </Command>
               </PopoverContent>
            </Popover>

            <Select value={category} onValueChange={setCategory}>
               <SelectTrigger className="w-auto">
                  <SelectValue placeholder="All categories" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                     <SelectItem key={cat._id} value={cat.name.toLowerCase()}>
                        {cat.name}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>

            <Button type="submit" className="shrink-0">
               <Search className="h-4 w-4 mr-1" /> Search
            </Button>
         </form>
      )
   }

   const UserProfile = () => {
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
                     <DropdownMenuItem asChild>
                        <Link href={`/enquiries`}>Enquiries</Link>
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
                  {categories.map((cat) => (
                     <DropdownMenuItem key={cat._id} asChild>
                        <Link href={`/categories/${cat._id}`} className="flex items-center gap-2">
                           <Store className="h-4 w-4" /> {cat.name}
                        </Link>
                     </DropdownMenuItem>
                  ))}
               </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/shop" className="text-sm text-foreground hover:underline">
               Shop
            </Link>
            <Link href="/auctions" className="text-sm text-foreground hover:underline">
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
                  <UserProfile />
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
                  <UserProfile />
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
