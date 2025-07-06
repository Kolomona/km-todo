import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AuthenticatedLayout from '../AuthenticatedLayout';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('AuthenticatedLayout', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    global.fetch.mockResolvedValue({
      ok: false,
    });

    render(
      <AuthenticatedLayout title="Test Page">
        <div>Test content</div>
      </AuthenticatedLayout>
    );

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('should render authenticated layout with user data', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    render(
      <AuthenticatedLayout title="Test Page">
        <div>Test content</div>
      </AuthenticatedLayout>
    );

    await waitFor(() => {
      expect(screen.getByText('KM Todo')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test Page')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  it('should render navigation links correctly', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    render(
      <AuthenticatedLayout title="Projects">
        <div>Test content</div>
      </AuthenticatedLayout>
    );

    await waitFor(() => {
      // Use getAllByText and filter for <a> elements
      const dashboardLink = screen.getAllByText('Dashboard').find(el => el.closest('a'));
      const projectsLink = screen.getAllByText('Projects').find(el => el.closest('a'));
      const todosLink = screen.getAllByText('Todos').find(el => el.closest('a'));
      const analyticsLink = screen.getAllByText('Analytics').find(el => el.closest('a'));
      expect(dashboardLink).toBeTruthy();
      expect(projectsLink).toBeTruthy();
      expect(todosLink).toBeTruthy();
      expect(analyticsLink).toBeTruthy();
    });
  });

  it('should highlight active navigation link', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    render(
      <AuthenticatedLayout title="Projects">
        <div>Test content</div>
      </AuthenticatedLayout>
    );

    await waitFor(() => {
      // Find the sidebar link (the <a> element)
      const projectsLinks = screen.getAllByText('Projects');
      const sidebarLink = projectsLinks.find(el => el.closest('a'));
      expect(sidebarLink?.closest('a')).toHaveClass('text-gray-900', 'bg-gray-100');
    });
  });

  it('should render user profile with avatar and logout button', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    render(
      <AuthenticatedLayout title="Test Page">
        <div>Test content</div>
      </AuthenticatedLayout>
    );

    await waitFor(() => {
      // Check for user avatar with first letter
      expect(screen.getByText('T')).toBeInTheDocument();
      
      // Check for user name and email
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      
      // Check for logout button
      expect(screen.getByTitle('Logout')).toBeInTheDocument();
    });
  });

  it('should have proper sidebar structure without overlap', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    render(
      <AuthenticatedLayout title="Test Page">
        <div>Test content</div>
      </AuthenticatedLayout>
    );

    await waitFor(() => {
      // Find the nav element and traverse up to the sidebar flex container
      const nav = screen.getByText('Dashboard').closest('nav');
      const sidebarFlex = nav?.parentElement;
      expect(sidebarFlex).toHaveClass('flex', 'flex-col', 'h-full');
      // Check that navigation is scrollable
      expect(nav).toHaveClass('flex-1', 'overflow-y-auto');
      // Check that user profile is fixed at bottom
      const userProfile = screen.getByText('Test User').closest('div');
      const userProfileContainer = userProfile?.parentElement?.parentElement;
      expect(userProfileContainer).toHaveClass('flex-shrink-0');
    });
  });

  it('should have root flex layout and sidebar/main content top-aligned', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    render(
      <AuthenticatedLayout title="Test Page">
        <div>Test content</div>
      </AuthenticatedLayout>
    );

    await waitFor(() => {
      // Root container should have flex and min-h-screen
      const root = screen.getByTestId('layout-root');
      expect(root).toHaveClass('flex', 'min-h-screen');
      // Sidebar should be at the top (not offset)
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('w-64', 'flex-shrink-0', 'h-screen');
      // Main content should be flex-1 and min-h-screen
      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toHaveClass('flex-1', 'flex', 'flex-col', 'min-h-screen');
    });
  });
}); 