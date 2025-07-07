import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from '../page';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
const mockFetch = vi.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner initially', () => {
    render(<Home />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('should redirect to dashboard when user is authenticated', async () => {
    // Mock successful authentication response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: '1', email: 'test@example.com', name: 'Test User' } }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    // Mock failed authentication response
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should redirect to login when authentication check fails', async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle 401 unauthorized response', async () => {
    // Mock 401 response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle 403 forbidden response', async () => {
    // Mock 403 response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
}); 