import { useState, useEffect, useRef } from "react";
import { RestaurantTable } from "@/types/table";
import { Notification } from "@/types/dish";

export const useWebSocket = (
  tables: RestaurantTable[],
  setTables: React.Dispatch<React.SetStateAction<RestaurantTable[]>>,
  setNotifs: React.Dispatch<React.SetStateAction<Notification[]>>,
) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const processedMessages = useRef(new Set<string>());

  useEffect(() => {
    const websocket = new WebSocket("wss://echo.websocket.org/");

    websocket.onopen = () => setWs(websocket);

    websocket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "dish_status_update") {
          // Create unique message ID to prevent duplicates
          const messageId = `${data.tableId}-${data.dishId}-${data.status}-${data.timestamp || Date.now()}`;

          // Skip if we've already processed this message
          if (processedMessages.current.has(messageId)) {
            return;
          }
          processedMessages.current.add(messageId);

          // Clean up old processed messages (keep only last 100)
          if (processedMessages.current.size > 100) {
            const messagesArray = Array.from(processedMessages.current);
            processedMessages.current = new Set(messagesArray.slice(-50));
          }

          // Update dish status in tables
          setTables((prevTables) =>
            prevTables.map((table) => {
              if (table.id === data.tableId && table.dishes) {
                return {
                  ...table,
                  dishes: table.dishes.map((dish) =>
                    dish.id === data.dishId
                      ? { ...dish, status: data.status }
                      : dish,
                  ),
                };
              }
              return table;
            }),
          );

          const time = new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });

          // Create notification
          const notificationId = `${data.tableId}-${data.dishId}-${data.status}-${Date.now()}`;

          setNotifs((prevNotifs) => {
            // Remove any existing notifications for the same dish to avoid duplicates
            const filteredNotifs = prevNotifs.filter(
              (notif) =>
                !(
                  notif.tableId === data.tableId &&
                  notif.dishName === data.dishName
                ),
            );

            return [
              ...filteredNotifs,
              {
                id: notificationId,
                tableId: data.tableId,
                dishName: data.dishName || "",
                status: data.status,
                time,
                timestamp: Date.now(),
                quantity: data.quantity || 1,
              },
            ];
          });
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    websocket.onerror = (error) => console.error("WebSocket error:", error);
    websocket.onclose = () => console.log("WebSocket disconnected");

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [setTables, setNotifs]);

  return ws;
};
