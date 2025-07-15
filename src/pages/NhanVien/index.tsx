import React from "react";

const NhanVien = () => {
  const employees = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      position: "Quản lý",
      phone: "0123456789",
      email: "an.nguyen@restaurant.com",
      status: "Đang làm việc",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      position: "Phục vụ",
      phone: "0987654321",
      email: "binh.tran@restaurant.com",
      status: "Đang làm việc",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Binh",
    },
    {
      id: 3,
      name: "Lê Văn Cường",
      position: "Đầu bếp",
      phone: "0369852147",
      email: "cuong.le@restaurant.com",
      status: "Nghỉ phép",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong",
    },
    {
      id: 4,
      name: "Phạm Thị Dung",
      position: "Thu ngân",
      phone: "0741852963",
      email: "dung.pham@restaurant.com",
      status: "Đang làm việc",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung",
    },
  ];

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-800">Nhân viên</h1>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200">
            Thêm nhân viên
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Tổng nhân viên</h3>
            <p className="text-3xl font-bold">{employees.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Đang làm việc</h3>
            <p className="text-3xl font-bold">
              {employees.filter((e) => e.status === "Đang làm việc").length}
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Nghỉ phép</h3>
            <p className="text-3xl font-bold">
              {employees.filter((e) => e.status === "Nghỉ phép").length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Danh sách nhân viên
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chức vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={employee.avatar}
                          alt={employee.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.status === "Đang làm việc"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-orange-600 hover:text-orange-900 mr-3">
                        Sửa
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NhanVien;
