"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Alert,
    Button,
    Card,
    Empty,
    Popconfirm,
    Skeleton,
    Tag,
} from "antd";
import {
    DeleteOutlined,
    ShoppingCartOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/api";
import { getToken } from "../../lib/auth";

type CartItem = {
    product: {
        _id: string;
        name: string;
        price: number;
        stock: number;
        description?: string;
    };
    quantity: number;
};

type FlashMessage =
    | {
        type: "success" | "error" | "warning";
        text: string;
    }
    | null;

export default function CartPage() {
    const router = useRouter();
    const alertRef = useRef<HTMLDivElement | null>(null);

    const [items, setItems] = useState<CartItem[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [message, setMessage] = useState<FlashMessage>(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const loadCart = async () => {
        try {
            setLoading(true);

            const res = await api("/cart", { auth: true });

            setItems(res.data?.cart?.items || []);
            setSubtotal(Number(res.data?.subtotal ?? res.data?.cart?.subtotal ?? 0));
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.message || "Failed to load cart",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!getToken()) {
            router.push("/login");
            return;
        }

        void loadCart();
    }, [router]);

    useEffect(() => {
        if (!message) return;

        requestAnimationFrame(() => {
            alertRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        });
    }, [message]);

    const removeItem = async (productId: string) => {
        try {
            setMessage(null);

            await api(`/cart/${productId}`, {
                method: "DELETE",
                auth: true,
            });

            setMessage({
                type: "success",
                text: "Item removed from cart",
            });

            await loadCart();
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.message || "Failed to remove item",
            });
        }
    };

    const placeOrder = async () => {
        try {
            setMessage(null);
            setPlacingOrder(true);

            await api("/orders", {
                method: "POST",
                auth: true,
                body: JSON.stringify({}),
            });

            setMessage({
                type: "success",
                text: "Order placed successfully",
            });

            await loadCart();
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.message || "Failed to place order",
            });
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <section className="mb-8 overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-200">
                                    <ShoppingCartOutlined />
                                    Your cart
                                </p>
                                <h1 className="text-3xl font-bold sm:text-4xl">Ready to checkout</h1>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                                    <p className="text-xs uppercase tracking-wider text-slate-300">
                                        Items
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-white">{totalItems}</p>
                                </div>

                                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                                    <p className="text-xs uppercase tracking-wider text-slate-300">
                                        Subtotal
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-white">
                                        ${subtotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {message && (
                        <div ref={alertRef} className="mb-6">
                            <Alert
                                showIcon
                                closable
                                type={message.type}
                                title={message.text}
                                onClose={() => setMessage(null)}
                            />
                        </div>
                    )}

                    {loading ? (
                        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <Card key={index} className="rounded-3xl shadow-sm">
                                        <Skeleton active paragraph={{ rows: 4 }} />
                                    </Card>
                                ))}
                            </div>

                            <Card className="rounded-3xl shadow-sm">
                                <Skeleton active paragraph={{ rows: 6 }} />
                            </Card>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
                            <Empty
                                description="Your cart is empty"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            >
                                <Button type="primary" onClick={() => router.push("/products")}>
                                    Browse Products
                                </Button>
                            </Empty>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
                            <div className="space-y-4">
                                {items.map((item, index) => {
                                    const lineTotal = item.product.price * item.quantity;

                                    return (
                                        <motion.div
                                            key={item.product._id}
                                            initial={{ opacity: 0, y: 18 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25, delay: index * 0.05 }}
                                        >
                                            <Card className="rounded-3xl border-0 shadow-sm">
                                                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                                            <h3 className="m-0 text-xl font-semibold text-slate-900">
                                                                {item.product.name}
                                                            </h3>

                                                            <Tag color={item.product.stock > 0 ? "green" : "red"}>
                                                                {item.product.stock > 0 ? "In stock" : "Out of stock"}
                                                            </Tag>
                                                        </div>

                                                        {item.product.description && (
                                                            <p className="mb-4 text-sm text-slate-500">
                                                                {item.product.description}
                                                            </p>
                                                        )}

                                                        <div className="grid gap-3 sm:grid-cols-3">
                                                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                                                <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                                                                    Price
                                                                </p>
                                                                <p className="text-base font-semibold text-slate-900">
                                                                    ${item.product.price.toFixed(2)}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                                                <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                                                                    Quantity
                                                                </p>
                                                                <p className="text-base font-semibold text-slate-900">
                                                                    {item.quantity}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                                                <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                                                                    Line Total
                                                                </p>
                                                                <p className="text-base font-semibold text-slate-900">
                                                                    ${lineTotal.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:w-auto">
                                                        <Popconfirm
                                                            title="Remove this item?"
                                                            okText="Remove"
                                                            cancelText="Cancel"
                                                            onConfirm={() => removeItem(item.product._id)}
                                                        >
                                                            <Button
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                className="rounded-xl!"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </Popconfirm>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="self-start lg:sticky lg:top-24">
                                <motion.div
                                    initial={{ opacity: 0, x: 18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <Card className="rounded-3xl border-0 shadow-sm">
                                        <div className="mb-5">
                                            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                                                Order summary
                                            </p>
                                            <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                                Checkout
                                            </h2>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                                <span className="text-sm text-slate-600">Total items</span>
                                                <span className="font-semibold text-slate-900">{totalItems}</span>
                                            </div>

                                            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                                <span className="text-sm text-slate-600">Subtotal</span>
                                                <span className="font-semibold text-slate-900">
                                                    ${subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                            Stock is revalidated when you place the order, because the
                                            universe enjoys race conditions.
                                        </div>

                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            icon={<CreditCardOutlined />}
                                            loading={placingOrder}
                                            disabled={items.length === 0}
                                            onClick={placeOrder}
                                            className="mt-6! h-12! rounded-xl!"
                                        >
                                            Place Order
                                        </Button>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}