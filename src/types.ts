export interface Category {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  category_name?: string;
  sku: string;
  stock: number;
  image_url?: string;
  low_stock_threshold?: number;
}

export interface CartItem extends Item {
  quantity: number;
}

export interface Sale {
  id: number;
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  timestamp: string;
  payment_method: string;
  status: 'completed' | 'refunded' | 'voided';
  status_reason?: string;
  customer_id?: number | null;
  customer_name?: string;
  customer_phone?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  is_active: number;
}

export interface DayEndReport {
  summary: {
    transaction_count: number;
    total_sales: number;
    total_revenue: number;
    total_tax: number;
    total_discount: number;
    total_refunds: number;
    total_voids: number;
    payment_method: string;
  }[];
  items: {
    name: string;
    total_quantity: number;
    total_revenue: number;
  }[];
  categories: {
    name: string;
    total_revenue: number;
  }[];
}
