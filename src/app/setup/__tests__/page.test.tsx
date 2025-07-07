import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import SetupPage from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the SetupForm component
vi.mock('@/components/setup/SetupForm', () => ({
  default: function MockSetupForm({ onSuccess }: { onSuccess?: () => void }) {
    return (
      <div data-testid="setup-form">
        <button onClick={onSuccess} data-testid="mock-success-button">
          Mock Success
        </button>
      </div>
    );
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('SetupPage', () => {
  const mockPush = vi.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue(mockRouter);
  });

  it('should show loading state initially', () => {
    (global.fetch as vi.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SetupPage />);

    expect(screen.getByText('Checking setup status...')).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should show setup form when setup is needed', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: true }),
    });

    render(<SetupPage />);

    await waitFor(() => {
      expect(screen.getByTestId('setup-form')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome to KM Todo! Let\'s set up your admin account.')).toBeInTheDocument();
    expect(screen.getByTestId('setup-form')).toBeInTheDocument();
  });

  it('should redirect to login when setup is not needed', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: false }),
    });

    render(<SetupPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should show error message when setup status check fails', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to check setup status' }),
    });

    render(<SetupPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to check setup status. Please try again.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('should show network error when fetch throws', async () => {
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<SetupPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('should retry setup status check when try again is clicked', async () => {
    (global.fetch as vi.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ needsSetup: true }),
      });

    render(<SetupPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
    tryAgainButton.click();

    // Wait for the fetch to resolve and the new UI to appear
    const setupForm = await screen.findByTestId('setup-form');
    expect(setupForm).toBeInTheDocument();
  });

  it('should redirect to login with success parameter when setup is successful', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: true }),
    });

    render(<SetupPage />);

    await waitFor(() => {
      expect(screen.getByTestId('setup-form')).toBeInTheDocument();
    });

    const successButton = screen.getByTestId('mock-success-button');
    successButton.click();

    expect(mockPush).toHaveBeenCalledWith('/login?setup=success');
  });

  it('should display setup information message', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: true }),
    });

    render(<SetupPage />);

    await waitFor(() => {
      expect(screen.getByTestId('setup-form')).toBeInTheDocument();
    });

    expect(screen.getByText(/This is a one-time setup to create your admin account/)).toBeInTheDocument();
    expect(screen.getByText(/After setup, you'll be able to log in and start using the application/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: true }),
    });

    render(<SetupPage />);

    await waitFor(() => {
      expect(screen.getByTestId('setup-form')).toBeInTheDocument();
    });

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    // Check for proper form labeling
    expect(screen.getByTestId('setup-form')).toBeInTheDocument();
  });
}); 