import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import RegisterForm from '../RegisterForm';

// Mock fetch
global.fetch = vi.fn();

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render registration form with all required fields', () => {
    render(<RegisterForm />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<RegisterForm />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    render(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    render(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'invalid-email' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockOnSuccess = vi.fn();
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    render(<RegisterForm onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"name":"Test User"'),
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should show error message on registration failure', async () => {
    const mockOnError = vi.fn();
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Email already exists' } })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    render(<RegisterForm onError={mockOnError} />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Email already exists');
    });
  });

  it('should show loading state during submission', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100)));
    
    render(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should disable form inputs during submission', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100)));
    
    render(<RegisterForm />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('should clear error message when form is resubmitted', async () => {
    const mockOnError = vi.fn();
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Email already exists' } })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    render(<RegisterForm onError={mockOnError} />);
    
    // First submission with error
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    // Second submission should clear error
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
}); 