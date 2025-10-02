"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Search, ShoppingCart, User, ChevronDown, Store } from "lucide-react"
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
    const [isVisible, setIsVisible] = React.useState(true)
    const [lastScrollY, setLastScrollY] = React.useState(0)
    const [isAtTop, setIsAtTop] = React.useState(true)

    React.useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY
            setIsAtTop(y < 50)
            setIsVisible(y < lastScrollY || y < 100)
            setLastScrollY(y)
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [lastScrollY])

    const [category, setCategory] = React.useState("all")

    const TopBar = () => (
        <div className="hidden w-full border-b bg-gray-200 md:block">
            <div className="mx-auto flex max-w-7xl items-center justify-end gap-6 px-4 py-2 text-xs">
                <Link href="#" className="hover:text-foreground transition-colors">
                    Become a Regular Seller
                </Link>
                <Link href="#" className="hover:text-foreground transition-colors">
                    Become a Premium Seller
                </Link>
                <Link href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                </Link>
                <Link href="#" className="hover:text-foreground transition-colors">
                    Our Blogs
                </Link>
            </div>
        </div>
    )

    const SearchBar = () => (
        <form
            className="flex w-full items-stretch gap-2"
            onSubmit={(e) => {
                e.preventDefault()
                // no-op demo handler
            }}
            role="search"
            aria-label="Product search"
        >
            <div className="flex w-full items-stretch gap-2 rounded-md border bg-background p-1">
                <Input
                    className="flex-1 border-0 focus-visible:ring-0"
                    placeholder="Search products"
                    aria-label="Search products"
                />
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-44">
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
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </div>
        </form>
    )

    const AuthCart = () => (
        <div className="flex items-center gap-4">
            <Link href="#" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" aria-hidden="true" />
                <span className="flex flex-col">
                    <span>Seller</span>
                    <span>Sign In</span>
                </span>
            </Link>
            <Link href="#" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" aria-hidden="true" />
                <span className="flex flex-col">
                    <span>Buyer</span>
                    <span>Sign In</span>
                </span>
            </Link>
            <Link
                href="#"
                className="relative inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                aria-label="Cart"
            >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                <span>Cart</span>
                <span
                    aria-label="Cart items"
                    className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground"
                >
                    0
                </span>
            </Link>
        </div>
    )

    const BottomNav = () => (
        <nav className="w-full border-t border-b bg-background">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="inline-flex items-center gap-2">
                            <Menu className="h-4 w-4" aria-hidden="true" />
                            Categories
                            <ChevronDown className="h-4 w-4 opacity-70" aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
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

                <Link href="#" className="text-sm text-foreground hover:underline">
                    Auctions
                </Link>
                <Link href="#" className="text-sm text-foreground hover:underline">
                    Tenders
                </Link>
                <Link href="#" className="text-sm text-foreground hover:underline">
                    Make an Offer
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
                "fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out",
                isAtTop ? "top-0" : "top-0",
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
            )}
            aria-label="Site header"
        >
            {/* Topbar */}
            <TopBar />

            {/* Mainbar */}
            <div className={cn("border-b bg-background", isAtTop ? "rounded-none" : "shadow-sm")}>
                <div className="mx-auto flex max-w-7xl bg-white items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <MobileSheet />
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/Logo/logo.png" alt="Brand logo" className="w-[200px]" />
                        </Link>
                    </div>

                    <div className="hidden flex-1 max-w-2xl md:block">
                        <SearchBar />
                    </div>

                    <div className="hidden md:block">
                        <AuthCart />
                    </div>
                </div>
            </div>

            {/* Bottom navigation */}
            <BottomNav />

            {/* Mobile search under bottom nav for better reachability */}
            <div className="border-t bg-background px-4 py-3 md:hidden">
                <SearchBar />
            </div>
        </header>
    )
}

export default Navbar
