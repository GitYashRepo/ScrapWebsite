import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/admin/signin");
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Welcome, Admin 👋</h1>
            <p>Only admin can see this page.</p>
        </div>
    );
}
