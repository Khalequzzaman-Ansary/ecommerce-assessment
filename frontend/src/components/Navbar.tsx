"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuth, getUser } from "../lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
    const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setUser(getUser());
    }, [pathname]);

    const logout = () => {
        clearAuth();
        setUser(null);
        router.push("/login");
    };

    const linkClass = (href: string) => {
        const isActive = pathname === href;

        return [
            "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
            isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ");
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur"
        >
            <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <Link
                        href="/products"
                        className="mr-2 text-lg font-bold tracking-tight text-slate-900"
                    >
                        ShopFlow
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/products" className={linkClass("/products")}>
                            Products
                        </Link>

                        <Link href="/cart" className={linkClass("/cart")}>
                            Cart
                        </Link>

                        {!user && (
                            <>
                                <Link href="/login" className={linkClass("/login")}>
                                    Login
                                </Link>

                                <Link href="/register" className={linkClass("/register")}>
                                    Register
                                </Link>
                            </>
                        )}

                        {user?.role === "admin" && (
                            <Link href="/admin" className={linkClass("/admin")}>
                                Admin
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {user && (
                        <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex sm:items-center sm:gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>

                            <div className="leading-tight">
                                <p className="text-sm font-semibold text-slate-900">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {user.role === "admin" ? "Administrator" : "Signed in"}
                                </p>
                            </div>
                        </div>
                    )}

                    {user && (
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </nav>
        </motion.header>
    );
}