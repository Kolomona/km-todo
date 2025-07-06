import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProjectsPage from '../../../app/projects/page';

// Mock the AuthenticatedLayout component
vi.mock('@/components/layout/AuthenticatedLayout', () => ({
  default: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="authenticated-layout" data-title={title}>
      {children}
    </div>
  ),
}));

// Mock the Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
  FolderIcon: () => <span data-testid="folder-icon">📁</span>,
  UsersIcon: () => <span data-testid="users-icon">👥</span>,
  CalendarIcon: () => <span data-testid="calendar-icon">📅</span>,
}));

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render projects page with title', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: [] })
    };
    global.fetch.mockResolvedValue(mockResponse);
    render(<ProjectsPage />);
    await waitFor(() => {
      expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
      expect(screen.getByTestId('authenticated-layout')).toHaveAttribute('data-title', 'Projects');
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', async () => {
    render(<ProjectsPage />);
    await waitFor(() => {
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  it('should fetch and display projects', async () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Test Project 1',
        description: 'Test description 1',
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        members: [
          {
            id: 'member1',
            projectId: '1',
            userId: 'user1',
            role: 'owner' as const,
            permissions: [],
            joinedAt: '2024-01-01T00:00:00Z',
            user: { id: 'user1', name: 'User 1', email: 'user1@example.com' }
          }
        ]
      },
      {
        id: '2',
        name: 'Test Project 2',
        description: 'Test description 2',
        ownerId: 'user2',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        members: []
      }
    ];

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects })
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
      expect(screen.getByText('Test description 1')).toBeInTheDocument();
      expect(screen.getByText('1 members')).toBeInTheDocument();
      expect(screen.getByText('0 members')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/projects');
  });

  it('should show empty state when no projects', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: [] })
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('No projects')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first project.')).toBeInTheDocument();
      expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
    });
  });

  it('should show error state when fetch fails', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading projects')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch projects')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching projects when retry button is clicked', async () => {
    const mockErrorResponse = { ok: false };
    const mockSuccessResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: [] })
    };
    global.fetch
      .mockResolvedValueOnce(mockErrorResponse)
      .mockResolvedValueOnce(mockSuccessResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading projects')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Error loading projects')).not.toBeInTheDocument();
    });
  });

  it('should show create project button', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: [] })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('New Project').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should open create project modal when button is clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: [] })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('New Project').length).toBeGreaterThanOrEqual(1);
    });

    fireEvent.click(screen.getAllByText('New Project')[0]);

    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
      expect(screen.getByLabelText('Project Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  it('should create new project successfully', async () => {
    const mockProjects = [];
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects })
    };

    const mockCreateResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: {
          id: '3',
          name: 'New Project',
          description: 'New description',
          ownerId: 'user1',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
          members: []
        }
      })
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockResponse) // Initial fetch
      .mockResolvedValueOnce(mockCreateResponse); // Create project

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('New Project').length).toBeGreaterThanOrEqual(1);
    });

    fireEvent.click(screen.getAllByText('New Project')[0]);

    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Project Name *');
    const descriptionInput = screen.getByLabelText('Description');

    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });

    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Project',
          description: 'New description'
        }),
      });
    });
  });

  it('should show validation error when project name is empty', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: [] })
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('New Project').length).toBeGreaterThanOrEqual(1);
    });

    fireEvent.click(screen.getAllByText('New Project')[0]);

    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });
  });

  it('should show server error when project creation fails', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: [] })
    };

    const mockCreateResponse = {
      ok: false,
      json: () => Promise.resolve({
        error: { message: 'Project creation failed' }
      })
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockCreateResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('New Project').length).toBeGreaterThanOrEqual(1);
    });

    fireEvent.click(screen.getAllByText('New Project')[0]);

    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Project Name *');
    fireEvent.change(nameInput, { target: { value: 'New Project' } });

    fireEvent.click(screen.getByText('Create Project'));

    await waitFor(() => {
      expect(screen.getByText('Project creation failed')).toBeInTheDocument();
    });
  });

  it('should close modal when cancel button is clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: [] })
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('New Project').length).toBeGreaterThanOrEqual(1);
    });

    fireEvent.click(screen.getAllByText('New Project')[0]);

    await waitFor(() => {
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Test Project',
        description: 'Test description',
        ownerId: 'user1',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        members: []
      }
    ];

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });

  it('should display project cards with correct information', async () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Test Project 1',
        description: 'This is a test project description that should be displayed',
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        members: [
          { id: 'member1', projectId: '1', userId: 'user1', role: 'owner' as const, permissions: [], joinedAt: '2024-01-01T00:00:00Z', user: { id: 'user1', name: 'User 1', email: 'user1@example.com' } },
          { id: 'member2', projectId: '1', userId: 'user2', role: 'editor' as const, permissions: [], joinedAt: '2024-01-01T00:00:00Z', user: { id: 'user2', name: 'User 2', email: 'user2@example.com' } }
        ]
      }
    ];

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ projects: mockProjects })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('This is a test project description that should be displayed')).toBeInTheDocument();
      expect(screen.getByText('2 members')).toBeInTheDocument();
      expect(screen.getByText(/2023|2024/)).toBeInTheDocument();
    });
  });
}); 