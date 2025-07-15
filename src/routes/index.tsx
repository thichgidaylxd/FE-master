import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import HoaDon from "@/pages/HoaDon";
import ThucDon from "@/pages/ThucDon";
import DoanhThu from "@/pages/DoanhThu";
import NhanVien from "@/pages/NhanVien";
import TaiKhoan from "@/pages/TaiKhoan";

// App Router - Main routing configuration

const AppRoutes = () => {
  return (
    <Routes>
      {/* All routes are now public - no authentication required */}
      <Route path="/" element={<Home />} />
      <Route path="/banan" element={<Home />} />
      <Route path="/banan/:id" element={<Home />} />
      <Route path="/ban" element={<Home />} />
      <Route path="/hoadon" element={<HoaDon />} />
      <Route path="/thucdon" element={<ThucDon />} />
      <Route path="/doanhthu" element={<DoanhThu />} />
      <Route path="/nhanvien" element={<NhanVien />} />
      <Route path="/taikhoan" element={<TaiKhoan />} />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
