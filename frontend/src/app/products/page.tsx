"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/api";
import { getToken } from "../../lib/auth";
import {
    Alert,
    Button,
    Card,
    Empty,
    Input,
    InputNumber,
    Pagination,
    Skeleton,
    Tag,
} from "antd";
import {
    SearchOutlined,
    ShoppingCartOutlined,
    FireOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

type Product = {
    _id: string;
    name: string;
    price: number;
    stock: number;
    description: string;
};

type FlashMessage = {
    type: "success" | "error" | "warning";
    text: string;
} | null;

const { Search } = Input;
const PAGE_SIZE = 6;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<FlashMessage>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const alertRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);

            try {
                const res = await api(
                    `/products?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(
                        searchTerm
                    )}`
                );

                const nextProducts = res.data?.products || [];
                const nextTotal = res.data?.pagination?.totalItems || 0;

                setProducts(nextProducts);
                setTotalItems(nextTotal);

                setQuantities((prev) => {
                    const next = { ...prev };

                    for (const product of nextProducts) {
                        if (next[product._id] == null) {
                            next[product._id] = 1;
                        }
                    }

                    return next;
                });
            } catch (err: any) {
                setMessage({
                    type: "error",
                    text: err.message || "Failed to load products",
                });
            } finally {
                setLoading(false);
            }
        };

        void loadProducts();
    }, [page, searchTerm]);

    /* User redirection to the alerts */
    /* Scroll user to the alert whenever one appears */
    useEffect(() => {
        if (!message) return;

        const frame = requestAnimationFrame(() => {
            alertRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            alertRef.current?.focus({ preventScroll: true });
        });

        return () => cancelAnimationFrame(frame);
    }, [message]);

    const handleSearch = () => {
        setPage(1);
        setSearchTerm(searchInput.trim());
    };

    const handleQuantityChange = (productId: string, value: number | null) => {
        setQuantities((prev) => ({
            ...prev,
            [productId]: value && value > 0 ? Math.floor(value) : 1,
        }));
    };

    const addToCart = async (product: Product) => {
        if (!getToken()) {
            setMessage({
                type: "warning",
                text: "Please login first",
            });
            return;
        }

        try {
            const quantity = quantities[product._id] || 1;

            await api("/cart", {
                method: "POST",
                auth: true,
                body: JSON.stringify({
                    productId: product._id,
                    quantity,
                }),
            });

            setMessage({
                type: "success",
                text: `${quantity} × ${product.name} added to cart`,
            });
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.message || "Failed to add item to cart",
            });
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
                                    <FireOutlined />
                                    Fresh inventory
                                </p>
                                <h1 className="text-3xl font-bold sm:text-4xl">Browse Products</h1>
                            </div>

                            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                                <p className="font-semibold text-white">{totalItems}</p>
                                <p>products found</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-col gap-3 md:flex-row">
                            <Search
                                allowClear
                                enterButton={
                                    <Button type="primary" icon={<SearchOutlined />}>
                                        Search
                                    </Button>
                                }
                                placeholder="Search products by name"
                                size="large"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onSearch={handleSearch}
                            />
                        </div>

                        {message && (
                            <div ref={alertRef} tabIndex={-1} className="mt-4 outline-none">
                                <Alert
                                    showIcon
                                    closable
                                    type={message.type}
                                    title={message.text}
                                    onClose={() => setMessage(null)}
                                />
                            </div>
                        )}
                    </section>

                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                                <Card key={index} className="rounded-3xl shadow-sm">
                                    <Skeleton active paragraph={{ rows: 4 }} />
                                </Card>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                            <Empty description="No products found" />
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {products.map((product, index) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.05 }}
                                    >
                                        <Card
                                            className="h-full rounded-3xl border-0 shadow-sm transition-shadow duration-300 hover:shadow-lg"
                                        >
                                            <div className="flex h-full flex-col">
                                                <div className="mb-4 flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-slate-900">
                                                            {product.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {product.description}
                                                        </p>
                                                    </div>

                                                    <Tag color={product.stock > 0 ? "green" : "red"}>
                                                        {product.stock > 0 ? "In stock" : "Out of stock"}
                                                    </Tag>
                                                </div>

                                                <div className="mb-5 space-y-2">
                                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                                        <span className="text-sm font-medium text-slate-500">
                                                            Price
                                                        </span>
                                                        <span className="text-lg font-bold text-slate-900">
                                                            ${product.price.toFixed(2)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                                        <span className="text-sm font-medium text-slate-500">
                                                            Available
                                                        </span>
                                                        <span className="font-semibold text-slate-900">
                                                            {product.stock}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto flex flex-col gap-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm font-medium text-slate-600">
                                                            Quantity
                                                        </span>

                                                        <InputNumber<number>
                                                            min={1}
                                                            max={Math.max(product.stock, 1)}
                                                            value={quantities[product._id] || 1}
                                                            disabled={product.stock < 1}
                                                            onChange={(value) =>
                                                                handleQuantityChange(product._id, value)
                                                            }
                                                        />
                                                    </div>

                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        icon={<ShoppingCartOutlined />}
                                                        disabled={product.stock < 1}
                                                        onClick={() => addToCart(product)}
                                                        className="h-11! rounded-xl!"
                                                    >
                                                        Add to Cart
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Pagination
                                    current={page}
                                    pageSize={PAGE_SIZE}
                                    total={totalItems}
                                    showSizeChanger={false}
                                    onChange={(nextPage) => setPage(nextPage)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}