import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SetupForm from '../SetupForm';

// Mock fetch
global.fetch = vi.fn();

describe('SetupForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('setup-button')).toBeInTheDocument();
  });

  it('should show password requirements', () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    expect(screen.getByText('Password Requirements:')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters long')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('One number')).toBeInTheDocument();
    expect(screen.getByText('One special character')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  it('should validate name length', async () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'a' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Fill in all required fields except email
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert', { name: /Please enter a valid email address/ });
    expect(errorMessage).toBeInTheDocument();
  });

  it('should validate password complexity', async () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('should validate password complexity requirements', async () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'weakpassword' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')).toBeInTheDocument();
    });
  });

  it('should validate password confirmation', async () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should show password requirements as met when valid password is entered', () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'StrongPass1!' } });

    // Check that all requirements show as met (green)
    const requirements = screen.getAllByText(/At least 8 characters long|One uppercase letter|One lowercase letter|One number|One special character/);
    requirements.forEach(requirement => {
      expect(requirement).toHaveClass('text-green-600');
    });
  });

  it('should clear field errors when user starts typing', async () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: '1', email: 'test@example.com', name: 'Test User' } }),
    });

    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Fill in valid form data
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/setup/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'StrongPass1!',
        }),
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle 409 conflict error (setup already complete)', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: { message: 'Setup already complete' } }),
    });

    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Fill in valid form data
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle 400 validation errors', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ 
        error: { 
          code: 'INVALID_EMAIL',
          message: 'Invalid email format' 
        } 
      }),
    });

    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Fill in form data
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    expect(mockOnError).toHaveBeenCalledWith('Invalid email format');
  });

  it('should handle weak password error from backend', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ 
        error: { 
          code: 'WEAK_PASSWORD',
          message: 'Password must contain at least one uppercase letter' 
        } 
      }),
    });

    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Fill in form data
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
    });
  });

  it('should handle general errors', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ 
        error: { 
          message: 'Internal server error' 
        } 
      }),
    });

    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Fill in form data
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Internal server error')).toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Fill in form data
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    (global.fetch as vi.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Fill in form data
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Setting up...')).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
  });

  it('should have proper accessibility attributes', () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const form = screen.getByRole('form', { name: 'Setup form' });
    expect(form).toBeInTheDocument();

    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('should show aria-invalid when field has error', async () => {
    render(<SetupForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    const submitButton = screen.getByTestId('setup-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const nameInput = screen.getByTestId('name-input');
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });
}); 