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
}

export interface CartItem extends Item {
  quantity: number;
}

export interface Sale {
  id: number;
  total: number;
  timestamp: string;
  payment_method: string;
}

export interface DayEndReport {
  summary: {
    transaction_count: number;
    total_sales: number;
    payment_method: string;
  }[];
  items: {
    name: string;
    total_quantity: number;
    total_revenue: number;
  }[];
}
