"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Empty,
    Popconfirm,
    Spin,
    Statistic,
    Tag,
    Typography,
} from "antd";
import {
    AppstoreOutlined,
    DeleteOutlined,
    DollarOutlined,
    EditOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";
import ProductForm, { ProductFormValues } from "../../components/ProductForm";
import { api } from "../../lib/api";
import { getToken, isAdmin } from "../../lib/auth";

type Product = {
    _id: string;
    name: string;
    price: number;
    stock: number;
    description: string;
};

type ReportData = {
    totalOrders: number;
    totalRevenue: number;
    topProducts: {
        productId: string;
        name: string;
        totalSold: number;
    }[];
};

type FlashMessage = {
    type: "success" | "error";
    text: string;
} | null;

const emptyForm: ProductFormValues = {
    name: "",
    price: null,
    stock: null,
    description: "",
};

export default function AdminPage() {
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [report, setReport] = useState<ReportData | null>(null);
    const [message, setMessage] = useState<FlashMessage>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [focusedProductId, setFocusedProductId] = useState<string | null>(null);
    const [pendingFocusProductId, setPendingFocusProductId] = useState<string | null>(null);

    const formValues = useMemo<ProductFormValues>(() => {
        if (!editingProduct) return emptyForm;

        return {
            name: editingProduct.name,
            price: editingProduct.price,
            stock: editingProduct.stock,
            description: editingProduct.description,
        };
    }, [editingProduct]);

    const loadProducts = async () => {
        const res = await api("/products?page=1&limit=100");
        setProducts(res.data.products || []);
    };

    const loadReport = async () => {
        const res = await api("/reports/summary", { auth: true });
        setReport(res.data);
    };

    const refreshAdminData = async () => {
        await Promise.all([loadProducts(), loadReport()]);
    };

    useEffect(() => {
        const bootstrap = async () => {
            if (!getToken()) {
                router.push("/login");
                return;
            }

            if (!isAdmin()) {
                router.push("/products");
                return;
            }

            try {
                setMessage(null);
                await refreshAdminData();
            } catch (err: any) {
                setMessage({
                    type: "error",
                    text: err.message || "Failed to load admin data",
                });
            } finally {
                setLoading(false);
            }
        };

        void bootstrap();
    }, [router]);

    useEffect(() => {
        if (!pendingFocusProductId) return;

        const element = document.getElementById(`product-row-${pendingFocusProductId}`);
        if (!element) return;

        element.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        setFocusedProductId(pendingFocusProductId);
        setPendingFocusProductId(null);

        const timer = window.setTimeout(() => {
            setFocusedProductId((current) =>
                current === pendingFocusProductId ? null : current
            );
        }, 2200);

        return () => window.clearTimeout(timer);
    }, [products, pendingFocusProductId]);

    const resetForm = () => {
        setEditingProduct(null);
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setMessage(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const submitProduct = async (values: ProductFormValues) => {
        const payload = {
            name: values.name.trim(),
            price: Number(values.price),
            stock: Number(values.stock),
            description: values.description.trim(),
        };

        if (!payload.name || !payload.description) {
            setMessage({ type: "error", text: "Name and description are required" });
            return;
        }

        if (Number.isNaN(payload.price) || payload.price < 0) {
            setMessage({ type: "error", text: "Price must be a valid non-negative number" });
            return;
        }

        if (!Number.isInteger(payload.stock) || payload.stock < 0) {
            setMessage({ type: "error", text: "Stock must be a valid non-negative integer" });
            return;
        }

        try {
            setSubmitting(true);
            setMessage(null);

            if (editingProduct?._id) {
                const updatedProductId = editingProduct._id;
                await api(`/products/${editingProduct._id}`, {
                    method: "PUT",
                    auth: true,
                    body: JSON.stringify(payload),
                });
                await refreshAdminData();
                resetForm();
                setPendingFocusProductId(updatedProductId);
                return;
            } else {
                await api("/products", {
                    method: "POST",
                    auth: true,
                    body: JSON.stringify(payload),
                });
                resetForm();
                await refreshAdminData();
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.message || "Failed to save product",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            setMessage(null);

            await api(`/products/${id}`, {
                method: "DELETE",
                auth: true,
            });

            if (editingProduct?._id === id) {
                resetForm();
            }

            setMessage({ type: "success", text: "Product deleted successfully" });
            await refreshAdminData();
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.message || "Failed to delete product",
            });
        }
    };

    const getStockTag = (stock: number) => {
        if (stock === 0) return <Tag color="red">Out of stock</Tag>;
        if (stock < 10) return <Tag color="orange">Low stock</Tag>;
        return <Tag color="green">In stock</Tag>;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
                    <Spin size="large" description="Loading admin data..." />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-100">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mb-6 rounded-3xl bg-slate-900 p-6 shadow-2xl shadow-slate-300/40"
                    >
                        <Typography.Title level={2} className="mb-1! text-white!">
                            Admin Dashboard
                        </Typography.Title>
                        <Typography.Paragraph className="mb-0! text-slate-300!">
                            Manage products, track sales, and keep inventory from becoming a dumpster fire.
                        </Typography.Paragraph>
                    </motion.div>

                    {message?.type === "error" && (
                        <Alert
                            className="mb-6 rounded-2xl"
                            showIcon
                            closable
                            onClose={() => setMessage(null)}
                            type={message.type}
                            title={message.text}
                        />
                    )}

                    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                        <div className="space-y-6">
                            <ProductForm
                                initialValues={formValues}
                                editing={Boolean(editingProduct)}
                                submitting={submitting}
                                onSubmit={submitProduct}
                                onCancelEdit={resetForm}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.08 }}
                            >
                                <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60">
                                    <Typography.Title level={4} className="mb-4!">
                                        Top Products
                                    </Typography.Title>

                                    {report?.topProducts?.length ? (
                                        <div className="space-y-3">
                                            {report.topProducts.map((item, index) => (
                                                <div
                                                    key={item.productId || `${item.name}-${index}`}
                                                    className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                                                >
                                                    <div>
                                                        <div className="font-medium text-slate-900">{item.name}</div>
                                                        <div className="text-sm text-slate-500">
                                                            Sold {item.totalSold} unit{item.totalSold === 1 ? "" : "s"}
                                                        </div>
                                                    </div>
                                                    <Tag color="blue">#{index + 1}</Tag>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty description="No sales yet" />
                                    )}
                                </Card>
                            </motion.div>
                        </div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.12 }}
                                className="grid gap-4 md:grid-cols-3"
                            >
                                <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60">
                                    <Statistic
                                        title="Products"
                                        value={products.length}
                                        prefix={<AppstoreOutlined />}
                                    />
                                </Card>

                                <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60">
                                    <Statistic
                                        title="Orders"
                                        value={report?.totalOrders ?? 0}
                                        prefix={<ShoppingCartOutlined />}
                                    />
                                </Card>

                                <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60">
                                    <Statistic
                                        title="Revenue"
                                        value={report?.totalRevenue ?? 0}
                                        precision={2}
                                        prefix={<DollarOutlined />}
                                    />
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.16 }}
                            >
                                <Card
                                    className="rounded-3xl border-0 shadow-xl shadow-slate-200/60"
                                    styles={{ body: { padding: 0 } }}
                                >
                                    <div className="border-b border-slate-100 px-6 py-5">
                                        <Typography.Title level={4} className="mb-1!">
                                            All Products
                                        </Typography.Title>
                                    </div>

                                    {products.length ? (
                                        <div className="divide-y divide-slate-100">
                                            {products.map((product, index) => (
                                                <motion.div
                                                    key={product._id}
                                                    id={`product-row-${product._id}`}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.25, delay: index * 0.03 }}
                                                    className={
                                                        focusedProductId === product._id
                                                            ? "rounded-2xl bg-blue-50/70 ring-2 ring-blue-400 ring-offset-2 ring-offset-white transition-all"
                                                            : "rounded-2xl transition-all"
                                                    }
                                                >
                                                    <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                                <Typography.Title level={5} className="mb-0!">
                                                                    {product.name}
                                                                </Typography.Title>
                                                                {getStockTag(product.stock)}
                                                            </div>

                                                            <Typography.Paragraph className="mb-3! text-slate-600!">
                                                                {product.description}
                                                            </Typography.Paragraph>

                                                            <div className="flex flex-wrap gap-2">
                                                                <Tag color="geekblue">${product.price.toFixed(2)}</Tag>
                                                                <Tag>{product.stock} in inventory</Tag>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                icon={<EditOutlined />}
                                                                onClick={() => startEdit(product)}
                                                            >
                                                                Edit
                                                            </Button>

                                                            <Popconfirm
                                                                title="Delete this product?"
                                                                description="This cannot be undone."
                                                                okText="Delete"
                                                                cancelText="Cancel"
                                                                onConfirm={() => deleteProduct(product._id)}
                                                            >
                                                                <Button danger icon={<DeleteOutlined />}>
                                                                    Delete
                                                                </Button>
                                                            </Popconfirm>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10">
                                            <Empty description="No products found" />
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}