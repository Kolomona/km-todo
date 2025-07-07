import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import Home from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Home', () => {
  const mockPush = vi.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue(mockRouter);
  });

  it('should show loading spinner initially', () => {
    (global.fetch as vi.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Home />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should redirect to setup when setup is needed', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: true }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/setup');
    });
  });

  it('should redirect to dashboard when user is authenticated', async () => {
    (global.fetch as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ needsSetup: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: '1', email: 'test@example.com' } }),
      });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    (global.fetch as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ needsSetup: false }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should redirect to login when setup status check fails', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should redirect to login when network error occurs', async () => {
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should check setup status first, then auth status', async () => {
    (global.fetch as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ needsSetup: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: '1', email: 'test@example.com' } }),
      });

    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/setup/status');
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me');
    });
  });

  it('should not check auth status when setup is needed', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ needsSetup: true }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/setup/status');
      expect(global.fetch).not.toHaveBeenCalledWith('/api/auth/me');
    });
  });
}); 