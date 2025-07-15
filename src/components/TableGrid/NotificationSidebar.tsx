import React from "react";
import { Bell } from "lucide-react";
import { Notification } from "@/types/dish";

interface NotificationSidebarProps {
  notifications: Notification[];
  tableId: string;
  onCallOrder: () => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  notifications,
  tableId,
  onCallOrder,
}) => {
  const tableNotifications = notifications
    .filter((n) => n.tableId === tableId)
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 mb-4 flex-1 overflow-auto animate-slide-in-from-right">
        <h2 className="text-lg font-bold text-orange-600 mb-3 flex items-center">
          <Bell className="w-5 h-5 mr-2 animate-bounce" />
          Thông báo
        </h2>
        <div className="space-y-3">
          {tableNotifications.map((n, i) => (
            <div
              key={n.id}
              className="flex items-start space-x-2 animate-slide-in-from-right"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  n.status === "Preparing"
                    ? "bg-orange-500"
                    : n.status === "Completed"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              ></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span
                    className={`font-medium ${
                      n.status === "Preparing"
                        ? "text-orange-600"
                        : n.status === "Completed"
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {n.quantity} {n.dishName}
                  </span>
                  <span
                    className={
                      n.status === "Preparing"
                        ? "text-orange-600"
                        : n.status === "Completed"
                          ? "text-green-600"
                          : "text-red-600"
                    }
                  >
                    {n.status === "Preparing"
                      ? " đang chuẩn bị"
                      : n.status === "Completed"
                        ? " đã hoàn thành"
                        : " bị từ chối"}
                  </span>
                </p>
                <p className="text-xs text-gray-500">{n.time}</p>
              </div>
            </div>
          ))}
          {!tableNotifications.length && (
            <p className="text-sm text-gray-500 text-center py-4">
              Chưa có thông báo nào
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onCallOrder}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 animate-bounce-in shrink-0"
      >
        Gọi món
      </button>
    </div>
  );
};

export default NotificationSidebar;