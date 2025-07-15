import axiosInstance from "@/config/axios";

export class InvoiceService {
  static async getAllInvoices() {
    try {
      const response = await axiosInstance.get("/invoice");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách hóa đơn");
    }
  }

  static async getInvoiceByTable(tableId: string) {
    try {
      const response = await axiosInstance.get(`/invoice/${tableId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy hóa đơn theo bàn");
    }
  }

  static async createInvoice(tableId: string, customerData: { customerName: string; customerPhone: string }) {
    try {
      const response = await axiosInstance.post(`/invoice/${tableId}`, customerData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi tạo hóa đơn");
    }
  }
}