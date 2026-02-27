"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import Navbar from "../../components/Navbar";
import { setAuth } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { Alert, Button, Divider, Input } from "antd";
import {
    LockOutlined,
    LoginOutlined,
    MailOutlined,
    ShoppingOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const res = await api("/auth/login", {
                method: "POST",
                body: JSON.stringify(form),
            });

            setAuth(res.data.token, res.data.user);

            const nextRoute =
                res.data.user?.role === "admin" ? "/admin" : "/products";

            router.push(nextRoute);
        } catch (err: any) {
            setMessage(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
                    <motion.section
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35 }}
                        className="order-2 lg:order-1"
                    >
                        <div className="max-w-xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">
                                <ShoppingOutlined />
                                Welcome back
                            </div>

                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                                Sign in and get back to shopping without the ritual suffering.
                            </h1>

                            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                                Clean access, faster checkout, and your cart waiting where you
                                left it instead of vanishing into the void like bad socks.
                            </p>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, x: 24, y: 16 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 }}
                        className="order-1 lg:order-2"
                    >
                        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                            <div className="mb-6">
                                <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                                    Account Access
                                </p>
                                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                    Login
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Use your email and password to continue.
                                </p>
                            </div>

                            {message && (
                                <div className="mb-5">
                                    <Alert
                                        showIcon
                                        closable
                                        type="error"
                                        message={message}
                                        onClose={() => setMessage("")}
                                    />
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Email
                                    </label>
                                    <Input
                                        size="large"
                                        prefix={<MailOutlined className="text-slate-400" />}
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Password
                                    </label>
                                    <Input.Password
                                        size="large"
                                        prefix={<LockOutlined className="text-slate-400" />}
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                    />
                                </div>

                                <Button
                                    htmlType="submit"
                                    type="primary"
                                    size="large"
                                    icon={<LoginOutlined />}
                                    loading={loading}
                                    block
                                    className="!mt-2 !h-12 !rounded-xl"
                                >
                                    Sign In
                                </Button>
                            </form>

                            <Divider className="!my-6">or</Divider>

                            <div className="space-y-3 text-sm">
                                <p className="text-slate-600">
                                    Don’t have an account?{" "}
                                    <Link
                                        href="/register"
                                        className="font-semibold text-slate-900 underline underline-offset-4"
                                    >
                                        Create one
                                    </Link>
                                </p>

                                <p className="text-slate-600">
                                    Just browsing?{" "}
                                    <Link
                                        href="/products"
                                        className="font-semibold text-slate-900 underline underline-offset-4"
                                    >
                                        Continue as guest
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>
        </>
    );
}