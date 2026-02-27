"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import { Alert, Button, Divider, Input } from "antd";
import {
    CheckCircleOutlined,
    LockOutlined,
    MailOutlined,
    ShoppingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("error");
    const [loading, setLoading] = useState(false);
    const [confirmTouched, setConfirmTouched] = useState(false);
    const confirmMatches =
        form.password.length > 0 &&
        form.confirmPassword.length > 0 &&
        form.password === form.confirmPassword;

    const confirmIconColor = confirmMatches
        ? "#16a34a" // green
        : confirmTouched
            ? "#dc2626" // red
            : "#111111"; // black

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
            setMessageType("error");
            setMessage("Name, email and password are required");
            setLoading(false);
            return;
        }

        if (form.password.length < 6) {
            setMessageType("error");
            setMessage("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        if (form.password !== form.confirmPassword) {
            setMessageType("error");
            setMessage("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await api("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                }),
            });

            setMessageType("success");
            setMessage("Registration successful. Redirecting to login...");

            setTimeout(() => {
                router.push("/login");
            }, 1000);
        } catch (err: any) {
            setMessageType("error");
            setMessage(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
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
                                New account
                            </div>

                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                                Create your account and stop shopping like a stranger.
                            </h1>

                            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                                Register once, keep your cart, place orders faster, and make the
                                whole experience feel less like temporary chaos.
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
                                    Join the platform
                                </p>
                                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                    Register
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Create your account in one clean step.
                                </p>
                            </div>

                            {message && (
                                <div className="mb-5">
                                    <Alert
                                        showIcon
                                        closable
                                        type={messageType}
                                        title={message}
                                        onClose={() => setMessage("")}
                                    />
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Full Name
                                    </label>
                                    <Input
                                        size="large"
                                        prefix={<UserOutlined className="text-slate-400" />}
                                        placeholder="Your name"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                    />
                                </div>

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
                                        placeholder="Create a password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Confirm Password
                                    </label>
                                    <Input.Password
                                        size="large"
                                        prefix={
                                            <CheckCircleOutlined
                                                style={{
                                                    color: confirmIconColor,
                                                    transition: "color 0.2s ease",
                                                }}
                                            />
                                        }
                                        placeholder="Repeat your password"
                                        value={form.confirmPassword}
                                        onChange={(e) => {
                                            if (!confirmTouched) setConfirmTouched(true);
                                            setForm({ ...form, confirmPassword: e.target.value });
                                        }}
                                    />
                                </div>

                                <Button
                                    htmlType="submit"
                                    type="primary"
                                    size="large"
                                    loading={loading}
                                    block
                                    className="mt-2! h-12! rounded-xl!"
                                >
                                    Create Account
                                </Button>
                            </form>

                            <Divider className="my-6!">or</Divider>

                            <div className="space-y-3 text-sm">
                                <p className="text-slate-600">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-semibold text-slate-900 underline underline-offset-4"
                                    >
                                        Sign in
                                    </Link>
                                </p>

                                <p className="text-slate-600">
                                    Just browsing?{" "}
                                    <Link
                                        href="/products"
                                        className="font-semibold text-slate-900 underline underline-offset-4"
                                    >
                                        Explore products
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