import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";

// --- 1. MOCK CÁC THƯ VIỆN BÊN NGOÀI ---

// Mock react-router-dom (Giả lập hàm navigate)
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Zustand Store (Giả lập hàm setLogin)
const mockSetLogin = vi.fn();
vi.mock("../../store/useAuthStore", () => ({
  default: (selector) => selector({ setLogin: mockSetLogin }),
}));

// Mock API (Giả lập hàm login)
vi.mock("../../services/authApi", () => ({
  default: {
    login: vi.fn(),
  },
}));

// Mock Toast Handler (Giả lập hàm hiển thị thông báo)
vi.mock("../../utils/toastHandler", () => ({
  showToast: vi.fn(),
}));

describe("Login Component", () => {
  // Reset lại tất cả các mock trước mỗi bài test để không bị nhiễu dữ liệu
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function để render component kèm theo Router (vì Login có dùng thẻ <Link>)
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );
  };

  // --- BÀI TEST 1 ---
  it("should render the login form correctly", () => {
    renderLogin();

    // Kiểm tra logo và tiêu đề
    expect(screen.getByText("Oil & Gas Analyzer")).toBeInTheDocument();
    expect(screen.getByText("Engineer Login")).toBeInTheDocument();

    // Kiểm tra các ô input và nút bấm
    expect(
      screen.getByPlaceholderText("john.davis@oilgas.com"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i }),
    ).toBeInTheDocument();
  });

  // --- BÀI TEST 2 ---
  it("should toggle password visibility when eye icon is clicked", () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText("••••••••••••");

    // Mặc định ô input phải là kiểu "password" (bị che)
    expect(passwordInput).toHaveAttribute("type", "password");

    // Tìm nút có chứa icon con mắt (nằm cùng div với ô password)
    // Vì button không có tên cụ thể, ta tìm icon hoặc nút button gần nhất
    const toggleButton = passwordInput.nextElementSibling;

    // Click vào nút con mắt
    fireEvent.click(toggleButton);

    // Sau khi click, ô input phải chuyển sang kiểu "text" (hiển thị mật khẩu)
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click thêm lần nữa
    fireEvent.click(toggleButton);

    // Nó phải quay lại kiểu "password"
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  // --- BÀI TEST 3 ---
  it("should show validation errors when submitting an empty form", async () => {
    renderLogin();

    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    // Cố tình bấm Sign In khi chưa nhập gì
    fireEvent.click(submitButton);

    // Vì thư viện react-hook-form chạy validation bất đồng bộ, ta phải dùng waitFor
    await waitFor(() => {
      // Kỳ vọng màn hình sẽ xuất hiện thông báo lỗi (dựa vào class text-red-500)
      // Lưu ý: Đoạn này phụ thuộc vào nội dung lỗi trong loginSchema của bạn.
      // Em giả định có chữ "required" hoặc bạn có thể bắt theo class.
      const errorMessages = document.querySelectorAll(".text-red-500");
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    // Đảm bảo API login KHÔNG bị gọi vì form không hợp lệ
    const authApi = await import("../../services/authApi");
    expect(authApi.default.login).not.toHaveBeenCalled();
  });
});
