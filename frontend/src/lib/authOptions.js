import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Buyer from "@/models/Buyer";
import Seller from "@/models/Seller";
import { comparePassword } from "@/utils/hash";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        await connectDB();
        const { email, password } = credentials;

        // Try to find user in each model
        const admin = await Admin.findOne({ email });
        if (admin && (await comparePassword(password, admin.password))) {
          return { id: admin._id, name: admin.name, email, role: "admin" };
        }

        const buyer = await Buyer.findOne({ email });
        if (buyer && (await comparePassword(password, buyer.password))) {
          return { id: buyer._id, name: buyer.name, email, role: "buyer" };
        }

        const seller = await Seller.findOne({ email });
        if (seller && (await comparePassword(password, seller.password))) {
          return { id: seller._id, name: seller.ownerName, email, role: "seller" };
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl, token }) {
        if (token?.role === "admin") return `${baseUrl}/dashboard/admin`;
        if (token?.role === "buyer") return `${baseUrl}/dashboard/buyer`;
        if (token?.role === "seller") return `${baseUrl}/dashboard/seller`;
        return baseUrl;
    },
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
    signIn: "/signin",
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
