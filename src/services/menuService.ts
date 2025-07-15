import axiosInstance from "@/config/axios";

export class MenuService {
  static async getAllMenuItems() {
    try {
      const response = await axiosInstance.get("/dishes");
      console.log("Response from GET /dishes:", response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách món");
    }
  }

  static async getMenuItemsByType(dishTypeId: string) {
    try {
      const response = await axiosInstance.get(`/dishes?dishTypeId=${dishTypeId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy món theo loại");
    }
  }

  static async createDish(dishData: {
    dishType: { id: string; name: string };
    name: string;
    price: number;
    unit: string;
    note?: string | null;
    image?: string | null;
  }) {
    try {
      const response = await axiosInstance.post("/dishes", dishData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi thêm món");
    }
  }

  static async updateDish(dishId: string, dishData: {
    dishType?: { id: string; name: string };
    name?: string;
    price?: number;
    unit?: string;
    note?: string | null;
    image?: string | null;
  }) {
    try {
      const response = await axiosInstance.put(`/dishes/${dishId}`, dishData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi cập nhật món");
    }
  }

  static async deleteDish(dishId: string) {
    try {
      const response = await axiosInstance.delete(`/dishes/${dishId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi xóa món");
    }
  }
}