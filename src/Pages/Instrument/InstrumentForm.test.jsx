import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InstrumentForm from './InstrumentForm';

describe('InstrumentForm Component', () => {
  // 1. Tạo các dữ liệu và hàm giả (Mock)
  const mockFormData = {
    name: 'Test Analyzer',
    type: 'gas',
    model: 'Test-Model',
    manufacturer: 'Test-Maker',
  };
  const mockOnInputChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  // Test case 1: Không render gì nếu showModal = false
  it('should NOT render when showModal is false', () => {
    const { container } = render(
      <InstrumentForm showModal={false} formData={mockFormData} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  // Test case 2: Render đúng tiêu đề khi showModal = true
  it('should render "Register New Instrument" when showModal is true', () => {
    render(
      <InstrumentForm
        showModal={true}
        formData={mockFormData}
        editTarget={null}
        onInputChange={mockOnInputChange} // <-- Bổ sung hàm này để React ngừng báo lỗi
      />
    );
    expect(screen.getByText('Register New Instrument')).toBeInTheDocument();
  });

  // Test case 3: Nút Cancel gọi đúng hàm onCancel
  it('should call onCancel when Cancel button is clicked', () => {
    render(
      <InstrumentForm
        showModal={true}
        formData={mockFormData}
        onCancel={mockOnCancel}
        onInputChange={mockOnInputChange} // <-- Bổ sung hàm này để React ngừng báo lỗi
      />
    );
    
    // Tìm nút Cancel và click thử
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Kiểm tra xem hàm mockOnCancel có bị gọi 1 lần không
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});