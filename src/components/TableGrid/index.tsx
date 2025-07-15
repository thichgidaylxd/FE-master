import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RestaurantTable } from "@/types/table";
import { Dish, CartItem, Notification } from "@/types/dish";
import { useWebSocket } from "@/hooks/useWebSocket";
import { calculateTableTotal } from "@/utils/tableUtils";
import TableCard from "./TableCard";
import DishCard from "./DishCard";
import MenuCard from "./MenuCard";
import CartSidebar from "./CartSidebar";
import NotificationSidebar from "./NotificationSidebar";
import PaymentDialog from "./PaymentDialog";
import axiosInstance from "@/config/axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTableService } from "@/services/tableService";

interface TableType {
  id: string;
  name: string;
}

const TableGrid = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTableType, setSelectedTableType] = useState<string | null>(null);
  const [selTable, setSelTable] = useState<string | null>(null);
  const [selDish, setSelDish] = useState<string | null>(null);
  const [showDelNotif, setShowDelNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [isTableView, setIsTableView] = useState(false);
  const [isMenuView, setIsMenuView] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState<"cash" | "transfer" | null>(null);
  const [showPayOpt, setShowPayOpt] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [tableStats, setTableStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    reserved: 0,
    cleaning: 0,
    revenue: 0,
  });
  const [dishError, setDishError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [newTable, setNewTable] = useState({
    name: "",
    tableTypeId: "",
    maxPerson: "",
    note: "",
  });
  const [addTableError, setAddTableError] = useState<string | null>(null);

  const {
    tables = [],
    setTables,
    menuItems = [],
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
  } = useTableService();

  const ws = useWebSocket(tables, setTables, setNotifs);

  // Fetch table types for dropdown
  useEffect(() => {
    const fetchTableTypes = async () => {
      try {
        const response = await axiosInstance.get("/tables/type");
        if (response.data.code === 200) {
          setTableTypes(response.data.data || []);
        } else {
          setAddTableError("Không thể tải danh sách loại bàn");
        }
      } catch (err) {
        setAddTableError("Lỗi kết nối server khi tải loại bàn");
      }
    };
    fetchTableTypes();
  }, []);

  // Automatically fetch tables on component mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        await fetchTables();
        setTableError(null);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bàn:", err);
        setTableError("Không thể tải danh sách bàn. Vui lòng thử lại.");
      }
    };
    loadTables();
  }, [fetchTables]);

  // Load table statistics when tables change
  useEffect(() => {
    loadTableStatistics();
  }, [tables]);

  // Load dishes when a table is selected
  useEffect(() => {
    if (selTable) {
      setDishError(null);
      fetchTableDishes(selTable).catch((err) => {
        console.error("Lỗi khi tải món ăn:", err);
        setDishError("Không thể tải danh sách món ăn của bàn");
      });
    }
  }, [selTable, fetchTableDishes]);

  const loadTableStatistics = async () => {
    try {
      const stats = await getTableStatistics();
      setTableStats(stats || { total: 0, occupied: 0, available: 0, reserved: 0, cleaning: 0, revenue: 0 });
    } catch (err) {
      console.error("Lỗi khi tải thống kê bàn:", err);
      setTableStats({ total: 0, occupied: 0, available: 0, reserved: 0, cleaning: 0, revenue: 0 });
    }
  };

  const addToCart = (item: Dish) => {
    setCart((c) => {
      const exists = c.find((i) => i.id === item.id);
      return exists
        ? c.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...c, { id: item.id, name: item.name, price: item.price, image: item.image ?? "", quantity: 1, note: "" }];
    });
  };

  const updateCartQty = (id: string, change: number) => {
    setCart(
      (c) =>
        c
          .map((i) =>
            i.id === id
              ? i.quantity + change > 0
                ? { ...i, quantity: i.quantity + change }
                : null
              : i
          )
          .filter((i) => i) as CartItem[]
    );
  };

  const updateCartNote = (id: string, note: string) => {
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, note } : i))
    );
  };

  const addCartToTable = async () => {
    if (selTable && cart.length > 0) {
      try {
        const orderItems = cart.map((item) => ({
          tableId: selTable,
          dishId: item.id,
          quantity: item.quantity,
          note: item.note || undefined,
        }));
        await addDishesToTable(selTable, orderItems);
        await updateTableStatus(selTable, "Đang sử dụng");
        setCart([]);
        setIsMenuView(false);
        await fetchTableDishes(selTable);
      } catch (err) {
        console.error("Lỗi khi thêm giỏ hàng vào bàn:", err);
        setDishError("Không thể thêm món vào bàn");
      }
    }
  };

  const callOrder = async () => {
    if (selTable) {
      const currentTable = getTableById(selTable);
      if (!currentTable?.dishes) return;

      for (const dish of currentTable.dishes) {
        if (dish.status === "Ordered") {
          try {
            const dishName = dish.dishName || "Unknown Dish";
            const timestamp = Date.now();
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "dish_status_update",
                  tableId: selTable,
                  dishId: dish.dishId,
                  dishName,
                  quantity: dish.quantity,
                  status: "Preparing",
                  timestamp,
                })
              );
            }
            const processingTime = Math.random() * 8000 + 3000;
            setTimeout(() => {
              const isCompleted = Math.random() > 0.3;
              const finalStatus = isCompleted ? "Completed" : "Rejected";
              const finalTimestamp = Date.now();
              if (ws?.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: "dish_status_update",
                    tableId: selTable,
                    dishId: dish.dishId,
                    dishName,
                    quantity: dish.quantity,
                    status: finalStatus,
                    timestamp: finalTimestamp,
                  })
                );
              }
            }, processingTime);
          } catch (err) {
            console.error("Lỗi khi xử lý đơn hàng:", err);
          }
        }
      }
    }
  };

  const toggleStatus = async (dishId: string) => {
    if (selTable) {
      try {
        const currentTable = getTableById(selTable);
        const dish = currentTable?.dishes?.find((d) => d.id === dishId);
        if (dish) {
          const newStatus =
            dish.status === "Ordered"
              ? "Preparing"
              : dish.status === "Preparing"
                ? "Completed"
                : dish.status === "Completed"
                  ? "Rejected"
                  : "Ordered";
          await updateDishStatus(selTable, dishId, newStatus);
          await fetchTableDishes(selTable);
        }
      } catch (err) {
        console.error("Lỗi khi thay đổi trạng thái món:", err);
        setDishError("Không thể cập nhật trạng thái món");
      }
    }
  };

  const handleQuantityChange = async (dishId: string, change: number) => {
    if (selTable) {
      try {
        await updateDishQuantity(selTable, dishId, change);
        await fetchTableDishes(selTable);
      } catch (err) {
        console.error("Lỗi khi cập nhật số lượng món:", err);
        setDishError("Không thể cập nhật số lượng món");
      }
    }
  };

  const addTable = async () => {
    try {
      const tableCount = tables.length + 100;
      const tableName = newTable.name || `Bàn ${tableCount}`;
      const existingTable = tables.find((t) => t.name === tableName);
      if (existingTable) {
        setAddTableError(`Bàn ${tableName} đã tồn tại. Vui lòng chọn tên khác.`);
        return;
      }
      const tableTypeId = newTable.tableTypeId || selectedTableType;
      if (!tableTypeId) {
        setAddTableError("Vui lòng chọn loại bàn.");
        return;
      }
      if (!newTable.maxPerson || isNaN(parseInt(newTable.maxPerson)) || parseInt(newTable.maxPerson) <= 0) {
        setAddTableError("Số lượng người tối đa phải là số dương.");
        return;
      }
      const payload = {
        name: tableName,
        tableType: {
          id: tableTypeId,
          name: tableTypes.find((t) => t.id === tableTypeId)?.name || "",
        },
        maxPerson: parseInt(newTable.maxPerson),
        note: newTable.note || null,
      };
      console.log("Sending POST /tables with payload:", payload);
      await addNewTable(payload);
      await fetchTables();
      setTableError(null);
      setNotifMessage("Thêm bàn thành công!");
      setShowDelNotif(true);
      setShowAddTable(false);
      setNewTable({ name: "", tableTypeId: selectedTableType || "", maxPerson: "", note: "" });
      setSelectedTableType(null);
      setAddTableError(null);
      setTimeout(() => setShowDelNotif(false), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể thêm bàn mới. Vui lòng thử lại.";
      console.error("Lỗi khi thêm bàn mới:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
      });
      setAddTableError(errorMessage);
    }
  };

  const delDish = async (dishId: string) => {
    if (selTable) {
      try {
        await removeDishFromTable(selTable, dishId);
        setSelDish(null);
        setNotifMessage("Xóa món thành công!");
        setShowDelNotif(true);
        setTimeout(() => setShowDelNotif(false), 3000);
        await fetchTableDishes(selTable);
      } catch (err) {
        console.error("Lỗi khi xóa món khỏi bàn:", err);
        setDishError("Không thể xóa món khỏi bàn");
      }
    }
  };

  const handleTableClick = async (table: RestaurantTable) => {
    setAnimating(true);
    setTimeout(() => {
      setSelTable(table.id);
      setIsTableView(true);
      setAnimating(false);
      setSelDish(null);
      setIsMenuView(false);
      setDishError(null);
      setTableError(null);
      window.history.pushState(null, "", "/banan");
    }, 300);
  };

  const backToGrid = () => {
    setAnimating(true);
    setTimeout(() => {
      setSelTable(null);
      setIsTableView(false);
      setIsMenuView(false);
      setAnimating(false);
      setDishError(null);
      setTableError(null);
      window.history.pushState(null, "", "/banan");
    }, 300);
  };

  const showMenu = async () => {
    if (selTable) {
      setIsMenuView(true);
      setCart([]);
      try {
        await fetchMenuItems();
      } catch (err) {
        console.error("Lỗi khi tải thực đơn:", err);
        setDishError("Không thể tải thực đơn");
      }
    }
  };

  const backFromMenu = () => {
    setIsMenuView(false);
    setCart([]);
    setDishError(null);
  };

  const payRequest = () => {
    if (selTable) {
      setShowPay(true);
      setPayMethod(null);
      setShowPayOpt(false);
    }
  };

  const selectPayMethod = async (method: "cash" | "transfer") => {
    if (selTable) {
      setPayMethod(method);
      try {
        await processPayment(selTable, { name: "Unknown", phone: "Unknown" });
        if (method === "transfer") genQR();
      } catch (err) {
        setDishError("Không thể tạo hóa đơn");
      }
    }
  };

  const confirmPay = async () => {
    if (selTable) {
      try {
        await processPayment(selTable, { name: "Unknown", phone: "Unknown" });
        setShowPayOpt(true);
        await fetchTableDishes(selTable);
        setNotifMessage("Thanh toán thành công!");
        setShowDelNotif(true);
        setTimeout(() => setShowDelNotif(false), 3000);
      } catch (err) {
        console.error("Lỗi khi xác nhận thanh toán:", err);
        setDishError("Không thể xác nhận thanh toán");
      }
    }
  };

  const genQR = async () => {
    if (selTable) {
      try {
        const currentTable = getTableById(selTable);
        const total = calculateTableTotal(currentTable?.dishes);
        setQrUrl(`https://img.vietqr.io/image/mbbank-02012345678909-compact2.jpg?amount=${total}&accountName=LE%20XUAN%20DUNG`);
      } catch (err) {
        console.error("Lỗi khi tạo mã QR:", err);
        setDishError("Không thể tạo mã QR");
      }
    }
  };

  const closePay = () => {
    setShowPay(false);
    setPayMethod(null);
    setShowPayOpt(false);
    setQrUrl("");
    setDishError(null);
    setTableError(null);
  };

  const tableStatuses = ["Trống", "Đang sử dụng", "Đã đặt", "Đang dọn"];
  const statusMap: Record<string, string> = {
    Trống: "Trống",
    "Đang sử dụng": "Đang sử dụng",
    "Đã đặt": "Đã đặt",
    "Đang dọn": "Đang dọn",
  };

  const filteredTables = tables.filter((t) => {
    const name = t.name || "";
    return (
      name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || t.status === statusMap[filter]) &&
      (selectedTableType === null || t.tableType.id === selectedTableType)
    );
  });

  const currentTable = selTable ? getTableById(selTable) : null;

  return (
    <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">
      <div className="w-48 bg-orange-50 border-r border-orange-200 flex flex-col">
        <div className="p-4">
          <div
            onClick={() => (window.location.href = "/banan")}
            className="bg-orange-200 text-orange-800 px-3 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 cursor-pointer hover:bg-orange-300 transition-colors duration-200"
          >
            <span>📁</span>
            <span>Bàn ăn</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <div
            onClick={() => (window.location.href = "/hoadon")}
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <span>📋</span>
            <span>Hóa đơn</span>
          </div>
          <div
            onClick={() => (window.location.href = "/thucdon")}
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <span>🍽️</span>
            <span>Thực đơn</span>
          </div>
          <div
            onClick={() => (window.location.href = "/doanhthu")}
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <span>💰</span>
            <span>Doanh thu</span>
          </div>
          <div
            onClick={() => (window.location.href = "/nhanvien")}
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <span>👥</span>
            <span>Nhân viên</span>
          </div>
          <div
            onClick={() => (window.location.href = "/taikhoan")}
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <span>👤</span>
            <span>Tài khoản</span>
          </div>
        </nav>
        <div className="p-4 border-t border-orange-200">
          <div
            onClick={() => (window.location.href = "/ca設定")}
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors duration-200"
          >
            <span>⚙️</span>
            <span>Cài đặt</span>
          </div>
        </div>
      </div>

      <div
        className={`flex-1 transition-all duration-500 ${animating ? "opacity-50 scale-95" : "opacity-100 scale-100"
          } flex flex-col h-full`}
      >
        {!isTableView ? (
          <div className="w-full bg-orange-50 flex flex-col h-full">
            <div className="p-6 bg-orange-50">
              <div className="flex space-x-4 mb-6 justify-between">
                <div className="flex space-x-4">
                  <div
                    className="bg-amber-800 text-white px-6 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in-up hover-lift animate-glow relative overflow-hidden"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
                    <div className="relative z-10">
                      <div
                        className="text-sm opacity-90 animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}
                      >
                        Đang sử dụng:
                      </div>
                      <div className="text-xl font-bold animate-heartbeat">
                        {tableStats.occupied}
                      </div>
                    </div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                  </div>
                  <div
                    className="bg-amber-700 text-white px-6 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in-up hover-lift animate-float relative overflow-hidden"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div
                        className="text-sm opacity-90 animate-fade-in-up"
                        style={{ animationDelay: "0.3s" }}
                      >
                        Số bàn trống:
                      </div>
                      <div
                        className="text-xl font-bold animate-bounce-in"
                        style={{ animationDelay: "0.4s" }}
                      >
                        {tableStats.available}
                      </div>
                    </div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div
                    className="bg-amber-600 text-white px-6 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in-up hover-lift hover-rotate relative overflow-hidden"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
                    <div className="relative z-10">
                      <div
                        className="text-sm opacity-90 animate-fade-in-up"
                        style={{ animationDelay: "0.4s" }}
                      >
                        Tổng số bàn:
                      </div>
                      <div
                        className="text-xl font-bold animate-zoom-in"
                        style={{ animationDelay: "0.5s" }}
                      >
                        {tableStats.total}
                      </div>
                    </div>
                    <div
                      className="absolute bottom-1 left-1 w-1 h-1 bg-blue-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                </div>
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-8 py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up hover-glow animate-gradient relative overflow-hidden"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 hover:opacity-20 transition-opacity duration-500 animate-gradient"></div>
                  <div className="relative z-10">
                    <div
                      className="text-sm opacity-90 animate-slide-in-from-right"
                      style={{ animationDelay: "0.5s" }}
                    >
                      Doanh thu:
                    </div>
                    <div className="text-xl font-bold animate-heartbeat">
                      {tableStats.revenue.toLocaleString()}.VND
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 text-yellow-300 animate-rotate-slow">
                    💰
                  </div>
                  <div className="absolute bottom-1 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 animate-slide-in-from-left hover-scale">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] hover:shadow-lg transition-all duration-300 hover-glow">
                      <SelectValue placeholder="Tất cả bàn" />
                    </SelectTrigger>
                    <SelectContent className="animate-zoom-in">
                      <SelectItem
                        value="all"
                        className="hover:bg-orange-100 transition-colors duration-200"
                      >
                        Tất cả bàn
                      </SelectItem>
                      {tableStatuses.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="hover:bg-orange-100 transition-colors duration-200"
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedTableType || undefined}
                    onValueChange={(value) => setSelectedTableType(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-[180px] hover:shadow-lg transition-all duration-300 hover-glow">
                      <SelectValue placeholder="Tất cả loại bàn" />
                    </SelectTrigger>
                    <SelectContent className="animate-zoom-in">
                      <SelectItem
                        value="all"
                        className="hover:bg-orange-100 transition-colors duration-200"
                      >
                        Tất cả loại bàn
                      </SelectItem>
                      {tableTypes.map((type) => (
                        <SelectItem
                          key={type.id}
                          value={type.id}
                          className="hover:bg-orange-100 transition-colors duration-200"
                        >
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 animate-slide-in-from-right">
                  <div className="relative hover-lift">
                    <Input
                      type="text"
                      placeholder="Tìm kiếm"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pr-8 w-64 hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-orange-300 hover-glow"
                    />
                    <svg
                      className="h-5 w-5 absolute right-3 top-2 text-gray-400 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <button
                    onClick={fetchTables}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-lg transition-all duration-300 hover-rotate hover:border-orange-300 group"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors duration-300 animate-rotate-slow"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6">
              {tableError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 font-medium mb-4">{tableError}</p>
                    <button
                      onClick={() => {
                        setTableError(null);
                        fetchTables();
                      }}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : tables.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-gray-600 font-medium text-lg">
                      Chưa có bàn nào để hiển thị.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-6 pb-6">
                  {filteredTables.map((t, i) => (
                    <TableCard
                      key={t.id}
                      table={t}
                      index={i}
                      onClick={handleTableClick}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-orange-50 border-t border-orange-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3 animate-fade-in-right">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-3 border-white flex items-center justify-center text-sm font-bold shadow-lg transform hover:scale-110 transition-all duration-300 animate-bounce-in hover-lift animate-float cursor-pointer relative overflow-hidden"
                      style={{
                        backgroundColor: `hsl(${i * 60}, 70%, 60%)`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 animate-gradient"></div>
                      <span
                        className="relative z-10 animate-heartbeat"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      >
                        {String.fromCharCode(65 + i - 1)}
                      </span>
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-semibold animate-fade-in-up hover:text-orange-600 transition-colors duration-200">
                  5 người khác đang online
                </span>
              </div>
              <button
                onClick={() => setShowAddTable(true)}
                className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse-slow hover-glow hover-lift relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 animate-gradient"></div>
                <Plus className="w-5 h-5 animate-rotate-slow group-hover:animate-spin transition-all duration-300" />
                <span className="relative z-10 animate-heartbeat">
                  Thêm bàn
                </span>
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        ) : !isMenuView ? (
          <div className="w-full bg-orange-50 p-6 rounded-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-orange-200 shrink-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={backToGrid}
                  className="p-2 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:-translate-x-1 animate-bounce-in"
                >
                  <ArrowLeft className="w-5 h-5 hover:-translate-x-1" />
                </button>
                <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg border-2 border-orange-300 animate-bounce-in">
                  <h1 className="text-xl font-bold">-- Bàn số {currentTable?.name || "N/A"} --</h1>
                </div>
              </div>
              <button
                onClick={showMenu}
                className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg border-2 border-orange-300 hover:bg-orange-200 font-medium hover:scale-105 hover:shadow-lg animate-bounce-in"
              >
                Thực đơn
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {dishError ? (
                <div className="col-span-full text-center py-8 text-red-500 animate-fade-in">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="font-medium">{dishError}</p>
                  <button
                    onClick={() => {
                      setDishError(null);
                      fetchTableDishes(selTable!);
                    }}
                    className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Thử lại
                  </button>
                </div>
              ) : currentTable?.dishes?.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500 animate-fade-in">
                  <div className="animate-bounce mb-4">🍽️</div>
                  Chưa có món ăn nào. Nhấn "Thực đơn" để thêm món.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {currentTable?.dishes?.map((d, i) => (
                    <DishCard
                      key={d.id}
                      dish={{
                        id: d.id,
                        dishId: d.dishId,
                        quantity: d.quantity,
                        status: d.status,
                        dishName: d.dishName,
                        name: d.dishName,
                        price: d.price,
                        unit: d.unit,
                        tableId: selTable || "",
                      }}
                      index={i}
                      isSelected={selDish === d.id}
                      onSelect={setSelDish}
                      onQuantityChange={handleQuantityChange}
                      onStatusToggle={toggleStatus}
                      onDelete={delDish}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t-2 border-orange-200 shrink-0">
              <button
                onClick={payRequest}
                className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 animate-bounce-in"
              >
                Yêu cầu thanh toán
              </button>
              <div className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold text-lg animate-fade-in">
                Tổng: {calculateTableTotal(currentTable?.dishes).toLocaleString()}.VND
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-orange-50 p-6 rounded-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-orange-200 shrink-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={backFromMenu}
                  className="p-2 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 animate-bounce-in"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg border-2 border-orange-300">
                  <h1 className="text-xl font-bold">-- Bàn số {currentTable?.name || "N/A"} --</h1>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {dishError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-6xl mb-4 text-red-500">⚠️</div>
                    <p className="text-red-600 font-medium text-lg">{dishError}</p>
                    <button
                      onClick={() => {
                        setDishError(null);
                        fetchMenuItems();
                      }}
                      className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-gray-600 font-medium text-lg">
                      Chưa có món ăn nào. Nhấn "Tải thực đơn" để lấy danh sách món.
                    </p>
                    <button
                      onClick={() => {
                        setDishError(null);
                        fetchMenuItems();
                      }}
                      className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Tải thực đơn
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {menuItems.map((item, i) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      index={i}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selTable && (
        <div className="w-80 bg-white border-l-2 border-gray-200 p-4 flex flex-col h-full shrink-0">
          {isMenuView ? (
            <CartSidebar
              cart={cart}
              onQuantityChange={updateCartQty}
              onAddToTable={addCartToTable}
              onNoteChange={updateCartNote}
            />
          ) : (
            <NotificationSidebar
              notifications={notifs}
              tableId={selTable}
              onCallOrder={callOrder}
            />
          )}
        </div>
      )}

      {showDelNotif && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-from-right hover:scale-105">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 animate-bounce" />
            <span>{notifMessage}</span>
          </div>
        </div>
      )}

      <Dialog open={showAddTable} onOpenChange={() => {
        setShowAddTable(false);
        setNewTable({ name: "", tableTypeId: selectedTableType || "", maxPerson: "", note: "" });
        setAddTableError(null);
      }}>
        <DialogContent className="bg-orange-50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-600">Thêm bàn mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Loại bàn</label>
              <Select
                value={newTable.tableTypeId || selectedTableType || undefined}
                onValueChange={(value) => setNewTable({ ...newTable, tableTypeId: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại bàn" />
                </SelectTrigger>
                <SelectContent>
                  {tableTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên bàn</label>
              <Input
                value={newTable.name}
                onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                placeholder="Nhập tên bàn (ví dụ: Bàn 11)"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số lượng người tối đa</label>
              <Input
                type="number"
                value={newTable.maxPerson}
                onChange={(e) => setNewTable({ ...newTable, maxPerson: e.target.value })}
                placeholder="Nhập số lượng người"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <Input
                value={newTable.note}
                onChange={(e) => setNewTable({ ...newTable, note: e.target.value })}
                placeholder="Nhập ghi chú (nếu có)"
                className="w-full"
              />
            </div>
            {addTableError && (
              <p className="text-red-500 text-sm">{addTableError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowAddTable(false);
                setNewTable({ name: "", tableTypeId: selectedTableType || "", maxPerson: "", note: "" });
                setAddTableError(null);
              }}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Hủy
            </Button>
            <Button
              onClick={addTable}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Thêm bàn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentDialog
        isOpen={showPay}
        onClose={closePay}
        table={currentTable}
        payMethod={payMethod}
        showPayOpt={showPayOpt}
        qrUrl={qrUrl}
        onConfirmPay={confirmPay}
        onSelectPayMethod={selectPayMethod}
      />
    </div>
  );
};

export default TableGrid;