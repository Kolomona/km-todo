import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LoginForm from '../LoginForm';

// Mock fetch
global.fetch = vi.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with all required fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me for 30 days/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<LoginForm />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockOnSuccess = vi.fn();
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"email":"test@example.com"'),
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should show error message on login failure', async () => {
    const mockOnError = vi.fn();
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Invalid credentials' } })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    render(<LoginForm onError={mockOnError} />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('should show loading state during submission', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100)));
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should disable form inputs during submission', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100)));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('should clear error message when form is resubmitted', async () => {
    const mockOnError = vi.fn();
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Invalid credentials' } })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    render(<LoginForm onError={mockOnError} />);
    
    // First submission with error
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Second submission should clear error
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should have remember me checkbox unchecked by default', () => {
    render(<LoginForm />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me for 30 days/i) as HTMLInputElement;
    expect(rememberMeCheckbox.checked).toBe(false);
  });

  it('should toggle remember me checkbox when clicked', () => {
    render(<LoginForm />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me for 30 days/i) as HTMLInputElement;
    
    // Initially unchecked
    expect(rememberMeCheckbox.checked).toBe(false);
    
    // Click to check
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(true);
    
    // Click to uncheck
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox.checked).toBe(false);
  });

  it('should include rememberMe parameter in API call when checked', async () => {
    const mockOnSuccess = vi.fn();
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Check the remember me checkbox
    const rememberMeCheckbox = screen.getByLabelText(/remember me for 30 days/i);
    fireEvent.click(rememberMeCheckbox);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true
        }),
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should include rememberMe: false in API call when unchecked', async () => {
    const mockOnSuccess = vi.fn();
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    render(<LoginForm onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false
        }),
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should disable remember me checkbox during form submission', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com', name: 'Test User' } })
    };
    
    (global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100)));
    
    render(<LoginForm />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me for 30 days/i) as HTMLInputElement;
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(rememberMeCheckbox).toBeDisabled();
  });
}); 