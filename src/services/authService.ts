import axiosInstance from "@/config/axios";

// Authentication service
export class AuthService {
  static async login(email: string, password: string) {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      }

      return {
        success: false,
        message: response.data.message || "Đăng nhập thất bại",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi kết nối server",
      };
    }
  }

  static async logout() {
    try {
      // Call logout endpoint if needed
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn("Logout server call failed:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return { success: true };
  }

  static async register(email: string, password: string) {
    try {
      const response = await axiosInstance.post("/auth/register", {
        email,
        password,
      });

      if (response.data.success) {
        return { success: true, user: response.data.user };
      }

      return {
        success: false,
        message: response.data.message || "Đăng ký thất bại",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi kết nối server",
      };
    }
  }

  static async getCurrentUser() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return null;
      }

      // Try to get user from localStorage first
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      // If not in localStorage, fetch from server
      const response = await axiosInstance.get("/auth/me");

      if (response.data.success && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return !!token;
  }

  static getToken(): string | null {
    return localStorage.getItem("token");
  }
}