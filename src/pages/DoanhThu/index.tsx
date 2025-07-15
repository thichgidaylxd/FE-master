import React from "react";

const DoanhThu = () => {
  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-800 mb-6">Doanh thu</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Doanh thu hôm nay</h3>
              <p className="text-3xl font-bold">2,450,000 VND</p>
              <p className="text-sm opacity-90 mt-2">+12% so với hôm qua</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Doanh thu tuần này</h3>
              <p className="text-3xl font-bold">15,680,000 VND</p>
              <p className="text-sm opacity-90 mt-2">+8% so với tuần trước</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">
                Doanh thu tháng này
              </h3>
              <p className="text-3xl font-bold">58,920,000 VND</p>
              <p className="text-sm opacity-90 mt-2">+15% so với tháng trước</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Biểu đồ doanh thu
              </h3>
              <div className="h-64 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-gray-500">Biểu đồ sẽ được hiển thị ở đây</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Món ăn bán chạy
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium">Phở bò</span>
                  <span className="text-orange-600 font-semibold">45 món</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium">Cơm tấm</span>
                  <span className="text-orange-600 font-semibold">38 món</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium">Bánh mì</span>
                  <span className="text-orange-600 font-semibold">32 món</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoanhThu;
