import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import EquipmentControl from "./EquipmentControl";

// --- 1. MOCK CÁC THƯ VIỆN VÀ API ---

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock adminEquipmentApi
vi.mock("../../services/adminEquipmentApi", () => ({
  default: {
    getAll: vi.fn(),
    getStats: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("EquipmentControl Component", () => {
  let adminEquipmentApi;

  beforeEach(async () => {
    vi.clearAllMocks();
    adminEquipmentApi = (await import("../../services/adminEquipmentApi"))
      .default;

    // Cài đặt dữ liệu giả mặc định cho API trả về thành công
    adminEquipmentApi.getStats.mockResolvedValue({
      data: { total: 10, active: 5, maintenance: 3, inactive: 2 },
    });

    adminEquipmentApi.getAll.mockResolvedValue({
      data: { equipment: [] },
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <EquipmentControl />
      </BrowserRouter>,
    );
  };

  // --- BÀI TEST 1: Kiểm tra Render và Gọi API mặc định ---
  it("should render the header and fetch data on mount", async () => {
    renderComponent();

    // 1. Kiểm tra tiêu đề trang có xuất hiện không
    expect(screen.getByText("Equipment Management")).toBeInTheDocument();

    // 2. Kiểm tra xem 2 API lấy dữ liệu có được gọi ngay khi load trang không
    await waitFor(() => {
      expect(adminEquipmentApi.getStats).toHaveBeenCalledTimes(1);
      // getAll được gọi ít nhất 1 lần (có thể nhiều hơn do debounce filter)
      expect(adminEquipmentApi.getAll).toHaveBeenCalled();
    });
  });

  // --- BÀI TEST 2: Mở Modal thêm thiết bị ---
  it("should open the Add Equipment modal when the button is clicked", async () => {
    renderComponent();

    // 1. Tìm và click vào nút "Add Equipment"
    const addButton = screen.getByRole("button", { name: /Add Equipment/i });
    fireEvent.click(addButton);

    // 2. Kiểm tra xem Modal đã hiện lên với tiêu đề đúng chưa
    expect(screen.getByText("Add New Equipment")).toBeInTheDocument();

    // 3. Kiểm tra xem một field trong form có xuất hiện không
    expect(
      screen.getByPlaceholderText("Enter equipment name"),
    ).toBeInTheDocument();
  });

  // --- BÀI TEST 3: Tương tác với thanh tìm kiếm (Search Box) ---
  it("should update search input and show clear button", async () => {
    renderComponent();

    // 1. Tìm ô search
    const searchInput = screen.getByPlaceholderText(
      "Search by name, serial number, or location...",
    );

    // 2. Gõ chữ vào ô search
    fireEvent.change(searchInput, { target: { value: "Pump" } });
    expect(searchInput.value).toBe("Pump");

    // 3. Sau khi gõ, nút "Clear" (dấu X) phải xuất hiện
    // Nút này không có chữ nên ta tìm dựa vào class hoặc SVG
    const clearButton = container.querySelector(".search-clear");
    // Dùng querySelector hoặc tìm kiếm dựa trên text của Active Filters info
    expect(screen.getByText('Search: "Pump"')).toBeInTheDocument();
  });
});
