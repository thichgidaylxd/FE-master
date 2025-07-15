import axiosInstance from "@/config/axios";

export class OrderItemService {
  static async getOrderItems(tableId: string) {
    try {
      const response = await axiosInstance.get(`/order-items/${tableId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách món trong bàn");
    }
  }

  static async addOrderItems(tableId: string, orderItems: { dishId: string; quantity: number; note?: string }[]) {
    try {
      const requestData = orderItems.map(item => ({
        tableId,
        ...item,
      }));
      const response = await axiosInstance.post(`/order-items/${tableId}`, requestData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi thêm món vào bàn");
    }
  }

  static async updateQuantity(tableId: string, orderItemId: string, quantity: number) {
    try {
      const response = await axiosInstance.patch(`/order-items/${tableId}/quantity`, { id: orderItemId, quantity });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi cập nhật số lượng món");
    }
  }

  static async deleteOrderItem(orderItemId: string) {
    try {
      const response = await axiosInstance.delete(`/order-items/${orderItemId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi xóa món");
    }
  }
}