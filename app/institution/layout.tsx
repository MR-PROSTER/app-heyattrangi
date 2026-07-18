"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" && 
      (session?.user as any)?.role !== "INSTITUTION_ADMIN" &&
      (session?.user as any)?.role !== "ADMIN"
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const navItems = [
    { name: "Dashboard", href: "/institution" },
    { name: "Students", href: "/institution/students" },
    { name: "Batches", href: "/institution/batches" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-800">Institution Portal</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div
                className={`px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-brown-50 text-brown-900 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-brown-100 flex items-center justify-center text-brown-700 font-bold">
              {(session.user?.name || "A")[0]}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800">{session.user?.name}</p>
              <p className="text-gray-500 text-xs">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8 h-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
