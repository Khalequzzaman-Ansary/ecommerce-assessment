"use client";

import { useEffect } from "react";
import { Button, Card, Form, Input, InputNumber, Space, Typography } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { TextArea } = Input;

export type ProductFormValues = {
    name: string;
    price: number | null;
    stock: number | null;
    description: string;
};

type ProductFormProps = {
    initialValues: ProductFormValues;
    editing: boolean;
    submitting?: boolean;
    onSubmit: (values: ProductFormValues) => Promise<void> | void;
    onCancelEdit: () => void;
};

export default function ProductForm({
    initialValues,
    editing,
    submitting = false,
    onSubmit,
    onCancelEdit,
}: ProductFormProps) {
    const [form] = Form.useForm<ProductFormValues>();

    useEffect(() => {
        form.setFieldsValue(initialValues);
    }, [form, initialValues]);

    const handleFinish = async (values: ProductFormValues) => {
        await onSubmit(values);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/60">
                <div className="mb-6">
                    <Typography.Title level={3} className="mb-1!">
                        {editing ? "Update Product" : "Create Product"}
                    </Typography.Title>
                </div>

                <Form<ProductFormValues>
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    requiredMark={false}
                >
                    <Form.Item
                        label="Product name"
                        name="name"
                        rules={[
                            { required: true, whitespace: true, message: "Enter a product name" },
                        ]}
                    >
                        <Input size="large" placeholder="Wireless Mouse" />
                    </Form.Item>

                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true, message: "Enter a price" }]}
                    >
                        <InputNumber
                            size="large"
                            min={0}
                            precision={2}
                            className="w-full!"
                            placeholder="99.99"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Stock"
                        name="stock"
                        rules={[
                            { required: true, message: "Enter available stock" },
                            {
                                validator: (_, value) => {
                                    if (value === null || value === undefined) {
                                        return Promise.resolve();
                                    }

                                    if (Number.isInteger(value) && value >= 0) {
                                        return Promise.resolve();
                                    }

                                    return Promise.reject(new Error("Stock must be a whole non-negative number"));
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            size="large"
                            min={0}
                            precision={0}
                            step={1}
                            className="w-full!"
                            placeholder="25"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            { required: true, whitespace: true, message: "Enter a description" },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Describe the product clearly"
                            showCount
                            maxLength={300}
                        />
                    </Form.Item>

                    <Space wrap>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={submitting}
                            icon={editing ? <SaveOutlined /> : <PlusOutlined />}
                        >
                            {editing ? "Save Changes" : "Create Product"}
                        </Button>

                        {editing && (
                            <Button size="large" onClick={onCancelEdit}>
                                Cancel Edit
                            </Button>
                        )}
                    </Space>
                </Form>
            </Card>
        </motion.div>
    );
}