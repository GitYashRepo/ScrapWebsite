import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import SideBar from "@/components/sidebar/sidebar";
import WhatsAppWidget from "@/components/whatsapp/whatsapp";
import { Providers } from "@/components/Providers/Providers";
import { Toaster } from "@/components/ui/sonner"
import AdDisplayModal from "@/components/ad/AdDisplayModal";
import AdTicker from "@/components/ad/AdTicker";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kabaad Mandi",
  description: "We deals in Scrap Metals - Sell or Buy here !",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <Providers>
            <SideBar />
            <Navbar />
            <AdDisplayModal />
            <AdTicker />
               {children}
            <WhatsAppWidget brandName="KabaadiMandi" phone = '+918003316534' />
            <Footer />
            <Toaster
               position="top-center"
               rich
               toastOptions={{
                 className: "toast px-6 py-4",
               }}
            />
         </Providers>
      </body>
    </html>
  );
}
