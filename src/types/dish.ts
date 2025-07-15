export interface Dish {
  id: string;
  dishId?: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  unit?: string;
  status?: string;
  tableId?: string;
  dishName?: string;
  note?: string | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  note?: string | null | undefined;
}

export interface Notification {
  id: string;
  tableId: string;
  dishId: string;
  dishName: string;
  quantity: number;
  status: string;
  timestamp: number;
}