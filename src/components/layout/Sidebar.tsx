import React from "react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-orange-100 min-h-screen p-4">
      <nav className="space-y-2">
        <a href="/banan" className="block p-2 rounded hover:bg-orange-200">
          Bàn ăn
        </a>
        <a href="/hoadon" className="block p-2 rounded hover:bg-orange-200">
          Hóa đơn
        </a>
        <a href="/thucdon" className="block p-2 rounded hover:bg-orange-200">
          Thực đơn
        </a>
        <a href="/doanhthu" className="block p-2 rounded hover:bg-orange-200">
          Doanh thu
        </a>
        <a href="/nhanvien" className="block p-2 rounded hover:bg-orange-200">
          Nhân viên
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
