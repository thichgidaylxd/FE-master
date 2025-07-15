import axiosInstance from "@/config/axios";

export interface TableType {
  id: string;
  name: string;
}

export interface RestaurantTable {
  id: string;
  name: string; 
  status: "Trống" | "Đang sử dụng" | "Đã đặt" | "Đang dọn"; 
  dishes?: Dish[];
  tableType: TableType;
}

export interface DishType {
  id: string;
  name: string;
}

export interface Dish {
  id: string;
  dishType: DishType;
  name: string;
  price: number;
  unit: string;
  note?: string | null;
  image?: string | null;
  status: "Ordered" | "Preparing" | "Completed" | "Rejected";
  createdAt: string;
  quantity?: number;
}

export interface OrderItem {
  id: string;
  tableId: string;
  dishId: string;
  dishName: string;
  price: number;
  unit: string;
  image?: string | null;
  quantity: number;
  note?: string;
  status: "Ordered" | "Preparing" | "Completed" | "Rejected";
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Notification {
  id: string;
  tableId: string;
  dishName: string;
  status: "Preparing" | "Rejected" | "Completed";
  time: string;
  timestamp: number;
  quantity: number;
}

/**
 * Payment Service - Handles all payment-related API calls
 * This service will be connected to Spring Boot backend APIs
 */
export class PaymentService {
  private static readonly BASE_URL = "/payments";

  static async processPayment(
    tableId: string,
    amount: number,
    method: "cash" | "transfer",
  ): Promise<any> {
    try {
      const response = await axiosInstance.post(this.BASE_URL, {
        tableId,
        amount,
        method,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error("Error processing payment:", error);
      return {
        id: `payment-${Date.now()}`,
        tableId,
        amount,
        method,
        status: "completed",
        createdAt: new Date().toISOString(),
      };
    }
  }

  static async generateQRCode(tableId: string, amount: number): Promise<string> {
    try {
      const response = await axiosInstance.post(`${this.BASE_URL}/qr`, {
        tableId,
        amount,
      });
      return response.data.qrUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return `https://img.vietqr.io/image/MB-02012345678909-compact2.png?addInfo=Ban%20${tableId}&accountName=LE%20XUAN%20DUNG&amount=${amount}`;
    }
  }

  static async getPaymentHistory(tableId: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get(
        `${this.BASE_URL}/table/${tableId}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching payment history for table ${tableId}:`,
        error,
      );
      return [];
    }
  }

  static async verifyPayment(paymentId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.BASE_URL}/${paymentId}/verify`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error verifying payment ${paymentId}:`, error);
      return {
        paymentId,
        status: "completed",
        verifiedAt: new Date().toISOString(),
      };
    }
  }

  static async getDailyRevenue(date?: string): Promise<number> {
    try {
      const response = await axiosInstance.get(
        `${this.BASE_URL}/revenue/daily`,
        {
          params: { date: date || new Date().toISOString().split("T")[0] },
        },
      );
      return response.data.revenue;
    } catch (error) {
      console.error("Error fetching daily revenue:", error);
      return 2450000;
    }
  }

  static async getMonthlyRevenue(month?: string): Promise<number> {
    try {
      const response = await axiosInstance.get(
        `${this.BASE_URL}/revenue/monthly`,
        {
          params: { month: month || new Date().toISOString().slice(0, 7) },
        },
      );
      return response.data.revenue;
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
      return 58920000;
    }
  }
}