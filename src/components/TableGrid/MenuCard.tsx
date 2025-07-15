import React from "react";
import { Plus } from "lucide-react";
import { Dish } from "@/types/dish";

interface MenuCardProps {
  item: Dish;
  index: number;
  onAddToCart: (item: Dish) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, index, onAddToCart }) => {
  return (
    <div
      className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 hover:shadow-xl hover:scale-105 hover:-translate-y-2 animate-fade-in-up group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover border-2 border-orange-200 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-orange-600">
            {item.name}
          </h3>
          <p className="text-orange-600 font-medium">
            {item.price.toLocaleString()} VND
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Món chính</span>
        <button
          onClick={() => onAddToCart(item)}
          className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 hover:scale-110 hover:rotate-90 hover:shadow-lg animate-bounce-in"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MenuCard;
