import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginPage from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock the LoginForm component
vi.mock('@/components/auth/LoginForm', () => ({
  default: function MockLoginForm({ onError }: { onError?: (error: string) => void }) {
    return (
      <div data-testid="login-form">
        <button onClick={() => onError?.('Test error')} data-testid="mock-error-button">
          Mock Error
        </button>
      </div>
    );
  }
}));

describe('LoginPage', () => {
  const mockGet = vi.fn();
  const mockPush = vi.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as vi.Mock).mockReturnValue({ get: mockGet });
    (useRouter as vi.Mock).mockReturnValue(mockRouter);
  });

  it('should show loading state initially', () => {
    (global.fetch as vi.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    mockGet.mockReturnValue(null);

    render(<LoginPage />);

    expect(screen.getByText('Checking setup status...')).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should redirect to setup when setup is needed', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: true }),
    });
    mockGet.mockReturnValue(null);

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/setup');
    });
  });

  it('should render login form when setup is complete', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue(null);

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  it('should show setup success message when redirected from setup and setup is complete', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue('success');

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText('Setup completed successfully! You can now sign in with your admin account.')).toBeInTheDocument();
    });
  });

  it('should not show setup success message when not redirected from setup', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue(null);

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.queryByText('Setup completed successfully! You can now sign in with your admin account.')).not.toBeInTheDocument();
    });
  });

  it('should show error message when LoginForm calls onError', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue(null);

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    const errorButton = screen.getByTestId('mock-error-button');
    errorButton.click();

    const errorMessage = await screen.findByText('Test error');
    expect(errorMessage).toBeInTheDocument();
    expect(screen.getByTestId('login-error')).toBeInTheDocument();
  });

  it('should show both success and error messages when both are present', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue('success');

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText('Setup completed successfully! You can now sign in with your admin account.')).toBeInTheDocument();
    });

    const errorButton = screen.getByTestId('mock-error-button');
    errorButton.click();

    const errorMessage = await screen.findByText('Test error');
    expect(errorMessage).toBeInTheDocument();
    expect(screen.getByTestId('login-error')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue(null);

    render(<LoginPage />);

    await waitFor(() => {
      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      
      // Check for proper form labeling
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  it('should have link to register page', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue(null);

    render(<LoginPage />);

    await waitFor(() => {
      const registerLink = screen.getByRole('link', { name: /create a new account/i });
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  it('should display success message with proper styling', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue('success');

    render(<LoginPage />);

    await waitFor(() => {
      const successMessage = screen.getByText('Setup completed successfully! You can now sign in with your admin account.');
      expect(successMessage).toBeInTheDocument();
      
      // Check that it's in a green success container
      const successContainer = successMessage.closest('.bg-green-50');
      expect(successContainer).toBeInTheDocument();
    });
  });

  it('should display error message with proper styling', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });
    mockGet.mockReturnValue(null);

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    const errorButton = screen.getByTestId('mock-error-button');
    errorButton.click();

    const errorMessage = await screen.findByText('Test error');
    expect(errorMessage).toBeInTheDocument();
    const errorContainer = screen.getByTestId('login-error');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveClass('bg-red-50');
  });

  it('should handle setup status check failure gracefully', async () => {
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));
    mockGet.mockReturnValue('success');

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText('Setup completed successfully! You can now sign in with your admin account.')).toBeInTheDocument();
    });
  });
}); 