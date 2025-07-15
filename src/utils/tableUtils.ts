import { OrderItem } from "@/types/table";

export const getTableStatus = (status: string, time?: string) => {
  return status === "Trống"
    ? { text: "Trống", color: "bg-green-100 text-green-600" }
    : status === "Đang sử dụng"
      ? { text: "Sử dụng", color: "bg-red-100 text-red-600" }
      : status === "Đã đặt"
        ? { text: time || "Đã đặt", color: "bg-blue-100 text-blue-600" }
        : { text: "Đang dọn", color: "bg-gray-100 text-gray-600" };
};

export const getDishStatus = (status: string, qty: number) => {
  return status === "Ordered"
    ? { text: `Đã gọi (${qty})`, color: "bg-gray-400 text-white" }
    : status === "Preparing"
      ? { text: `Đang (${qty})`, color: "bg-orange-400 text-white" }
      : status === "Completed"
        ? { text: "", color: "bg-green-500 text-white", icon: true }
        : { text: "Từ chối", color: "bg-gray-400 text-white" };
};

export const calculateTableTotal = (dishes?: OrderItem[]) => {
  if (!dishes) return 0;
  return dishes.reduce((total, dish) => total + dish.price * dish.quantity, 0);
};