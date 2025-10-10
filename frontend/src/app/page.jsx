import Navbar from "@/components/navbar/navbar";

export default function Home() {
    return (
        <main className="h-[500vh]">
            <Navbar />
            <div className="font-sans">
                <h1>Main Page</h1>
            </div>
        </main>
    );
}
