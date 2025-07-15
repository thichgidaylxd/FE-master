import { useCallback, useState } from "react";
import { OrderItem, RestaurantTable } from "@/types/table";
import { Dish } from "@/types/dish";
import axiosInstance from "@/config/axios";

const BASE_URL = "http://localhost:8081/restaurant/api";

interface TableData {
  tables: RestaurantTable[];
  setTables: React.Dispatch<React.SetStateAction<RestaurantTable[]>>;
  menuItems: Dish[];
  loading: boolean;
  error: string | null;
  apiMessage: string | null;
  updateTableStatus: (tableId: string, status: string) => Promise<void>;
  addNewTable: (table: Partial<RestaurantTable>) => Promise<void>;
  addDishesToTable: (tableId: string, items: any[]) => Promise<void>;
  updateDishStatus: (tableId: string, dishId: string, status: string) => Promise<void>;
  updateDishQuantity: (tableId: string, dishId: string, change: number) => Promise<void>;
  removeDishFromTable: (tableId: string, dishId: string) => Promise<void>;
  processPayment: (tableId: string, customer: { name: string; phone: string }) => Promise<void>;
  getTableStatistics: () => Promise<{
    total: number;
    occupied: number;
    available: number;
    reserved: number;
    cleaning: number;
    revenue: number;
  }>;
  getTableById: (tableId: string) => RestaurantTable | undefined;
  fetchTableDishes: (tableId: string) => Promise<void>;
  fetchTables: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  clearError: () => void;
}

export const useTableService = (): TableData => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [menuItems, setMenuItems] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);


  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/tables`);
      console.log("Fetching tables from:", `${BASE_URL}/tables`);
      console.log("Response from GET /tables:", response.data);

      const result = await response.data;
      if (result.code === 200) {
        setTables(result.data || []);
      } else {
        setApiMessage(result.message || "Không thể tải danh sách bàn");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/dishes`);
      console.log("Fetching menu items from:", `${BASE_URL}/dishes`);
      console.log("Response from GET /dishes:", response.data);
      const result = await response.data;
      if (result.code === 200) {
        setMenuItems(result.data || []);
      } else {
        setApiMessage(result.message || "Không thể tải thực đơn");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTableDishes = useCallback(async (tableId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/order-items/${tableId}`);
      console.log("Fetching dishes for table:", tableId);
      console.log("Response from GET /order-items:", response.data);
      const result = await response.data;
      if (result.code === 200) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === tableId ? { ...t, dishes: result.data } : t
          )
        );
      } else {
        setApiMessage(result.message || "Không thể tải món ăn của bàn");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTableStatus = useCallback(async (tableId: string, status: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.patch(
        `${BASE_URL}/tables/${tableId}/update-status`,
        null, // PATCH không có body, chỉ gửi query param
        { params: { status } }
      );
      const result = response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể cập nhật trạng thái bàn");
        throw new Error(result.message || "Không thể cập nhật trạng thái bàn");
      }
      // Cập nhật lại state tables nếu cần
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, status } : t
        )
      );
      setApiMessage(result.message || "Bàn đã cập nhật trạng thái mới");
    } catch (err) {
      setError("Lỗi khi cập nhật trạng thái bàn");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewTable = useCallback(async (restaurantTable: Partial<RestaurantTable>) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`${BASE_URL}/tables`, restaurantTable);
      const result = await response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể thêm bàn mới");
        throw new Error(result.message || "Không thể thêm bàn mới");
      }
    } catch (err) {
      setError("Lỗi khi thêm bàn mới");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDishesToTable = useCallback(
    async (
      tableId: string,
      orderItems: { tableId: string; dishId: string; quantity: number; note?: string }[]
    ): Promise<void> => {
      try {
        const response = await axiosInstance.post(`/order-items/${tableId}`, orderItems);
        if (response.data.code !== 200) {
          throw new Error(response.data.message || "Không thể thêm món vào bàn");
        }
        console.log("Dishes added to table:", tableId);
        console.log("Response from POST /order-items:", response.data);
      } catch (err: any) {
        throw new Error(err.response?.data?.message || err.message || "Không thể thêm món vào bàn");
      }
    },
    []
  );

  const updateDishStatus = useCallback(async (tableId: string, dishId: string, status: string) => {
    // Triển khai API PATCH /order-items/{tableId}/status
  }, []);

  const updateDishQuantity = useCallback(async (tableId: string, dishId: string, change: number) => {
    // Triển khai API PATCH /order-items/{tableId}/quantity
  }, []);

  const removeDishFromTable = useCallback(async (tableId: string, dishId: string) => {
    // Triển khai API DELETE /order-items/{orderItemId}
  }, []);

  const processPayment = useCallback(async (tableId: string, customer: { name: string; phone: string }) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`${BASE_URL}/invoice/${tableId}`);
      console.log("Processing payment for table:", tableId);
      console.log("Response from POST /invoice:", response.data);
      const result = await response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể tạo hóa đơn");
        throw new Error(result.message || "Không thể tạo hóa đơn");
      }
      // Nếu muốn lấy dữ liệu hóa đơn trả về: result.data
    } catch (err) {
      setError("Lỗi khi tạo hóa đơn");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTableStatistics = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/tables`);
      const result = await response.data;
      if (result.code === 200) {
        const data = result.data || [];
        return {
          total: data.length,
          occupied: data.filter((t: RestaurantTable) => t.status === "Đang sử dụng").length,
          available: data.filter((t: RestaurantTable) => t.status === "Trống").length,
          reserved: data.filter((t: RestaurantTable) => t.status === "Đã đặt").length,
          cleaning: data.filter((t: RestaurantTable) => t.status === "Đang dọn").length,
          revenue: 0, // Cần API invoices để tính
        };
      }
      return { total: 0, occupied: 0, available: 0, reserved: 0, cleaning: 0, revenue: 0 };
    } catch (err) {
      console.error("Lỗi khi lấy thống kê:", err);
      return { total: 0, occupied: 0, available: 0, reserved: 0, cleaning: 0, revenue: 0 };
    }
  };

  const getTableById = (tableId: string) => {
    return tables.find((t) => t.id === tableId);
  };

  const clearError = () => {
    setError(null);
    setApiMessage(null);
  };

  return {
    tables,
    setTables,
    menuItems,
    loading,
    error,
    apiMessage,
    updateTableStatus,
    addNewTable,
    addDishesToTable,
    updateDishStatus,
    updateDishQuantity,
    removeDishFromTable,
    processPayment,
    getTableStatistics,
    getTableById,
    fetchTableDishes,
    fetchTables,
    fetchMenuItems,
    clearError,
  };
};