import React from "react";
import { Plus, Minus } from "lucide-react";
import { CartItem } from "@/types/dish";
import { Input } from "@/components/ui/input";

interface CartSidebarProps {
  cart: CartItem[];
  onQuantityChange: (id: string, change: number) => void;
  onAddToTable: () => void;
  onNoteChange: (id: string, note: string) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  onQuantityChange,
  onAddToTable,
  onNoteChange,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 mb-4 flex-1 overflow-auto">
        <h2 className="text-lg font-bold text-orange-600 mb-3">Giỏ hàng</h2>
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col space-y-2 p-2 bg-white rounded border"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-orange-600 text-sm">
                    {item.price.toLocaleString()} VND
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onQuantityChange(item.id, -1)}
                    className="p-1 rounded border hover:bg-gray-100 animate-bounce-in"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 py-1 text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onQuantityChange(item.id, 1)}
                    className="p-1 rounded border hover:bg-gray-100 animate-bounce-in"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div>
                <Input
                  value={item.note || ""}
                  onChange={(e) => onNoteChange(item.id, e.target.value)}
                  placeholder="Nhập ghi chú (ví dụ: không đường)"
                  className="w-full text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onAddToTable}
        disabled={!cart.length}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed animate-bounce-in shrink-0"
      >
        Thêm món vào bàn
      </button>
    </div>
  );
};

export default CartSidebar;