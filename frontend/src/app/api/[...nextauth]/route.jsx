import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db/db";
import Admin from "@/models/model";
import bcrypt from "bcryptjs";

async function ensureAdminUser() {
    await connectDB();
    const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (!existing) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        await Admin.create({
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin",
        });
        console.log("✅ Admin user created");
    }
}

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await ensureAdminUser();
                const user = await Admin.findOne({ email: credentials.email });
                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return { id: user._id, email: user.email, role: user.role };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = user.role;
            return token;
        },
        async session({ session, token }) {
            session.user.role = token.role;
            return session;
        },
    },
    pages: {
        signIn: "/admin/signin",
    },
});

export { handler as GET, handler as POST };
