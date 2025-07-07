import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import ProjectDetailPage from '../../../app/projects/[id]/page';

// Mock fetch
const mockFetch = vi.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-project-id' }),
  useRouter: () => ({ push: mockPush }),
}));

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
  PencilIcon: () => <span data-testid="pencil-icon">✏️</span>,
  TrashIcon: () => <span data-testid="trash-icon">🗑️</span>,
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
  UserPlusIcon: () => <span data-testid="user-plus-icon">👤+</span>,
  UsersIcon: () => <span data-testid="users-icon">👥</span>,
  CalendarIcon: () => <span data-testid="calendar-icon">📅</span>,
  DocumentTextIcon: () => <span data-testid="document-icon">📄</span>,
  ChatBubbleLeftRightIcon: () => <span data-testid="chat-icon">💬</span>,
}));

// Mock the TodoModal component
vi.mock('@/components/todos/TodoModal', () => ({
  default: ({ isOpen, onClose, onSubmit, title }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (data: { title: string; projectIds: string[] }) => void; 
    title: string; 
  }) => (
    isOpen ? (
      <div data-testid="todo-modal">
        <div data-testid="todo-modal-title">{title}</div>
        <button data-testid="todo-modal-submit" onClick={() => onSubmit({ title: 'New Todo', projectIds: ['test-project-id'] })}>
          Submit
        </button>
        <button data-testid="todo-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
  ),
}));

describe('ProjectDetailPage', () => {
  const mockProject = {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'Test project description',
    ownerId: 'user1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    members: [
      {
        id: 'member1',
        projectId: 'test-project-id',
        userId: 'user1',
        role: 'owner' as const,
        permissions: [],
        joinedAt: '2024-01-01T00:00:00Z',
        user: { id: 'user1', name: 'User 1', email: 'user1@example.com' }
      },
      {
        id: 'member2',
        projectId: 'test-project-id',
        userId: 'user2',
        role: 'editor' as const,
        permissions: [],
        joinedAt: '2024-01-02T00:00:00Z',
        user: { id: 'user2', name: 'User 2', email: 'user2@example.com' }
      }
    ]
  };

  const mockTodos = [
    {
      id: 'todo1',
      title: 'Test Todo 1',
      description: 'Test todo description',
      dueDate: '2024-01-15T00:00:00Z',
      priority: 'high' as const,
      status: 'pending' as const,
      estimatedTime: 60,
      createdBy: 'user1',
      assignedTo: 'user2',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'todo2',
      title: 'Test Todo 2',
      description: 'Completed todo',
      priority: 'medium' as const,
      status: 'completed' as const,
      createdBy: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockMessages = [
    {
      id: 'message1',
      projectId: 'test-project-id',
      userId: 'user1',
      message: 'Test message',
      todoReferences: [],
      createdAt: '2024-01-01T00:00:00Z',
      user: { id: 'user1', name: 'User 1', email: 'user1@example.com' }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('should render project detail page with title', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated-layout')).toBeInTheDocument();
      expect(screen.getByTestId('authenticated-layout')).toHaveAttribute('data-title', 'Test Project');
    });
  });

  it('should fetch and display project data', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test project description')).toBeInTheDocument();
      expect(screen.getByText('2 members')).toBeInTheDocument();
      expect(screen.getByText(/2023|2024/)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', async () => {
    render(<ProjectDetailPage />);
    await waitFor(() => {
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  it('should show error state when project not found', async () => {
    const mockResponse = {
      ok: false,
      status: 404
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading project')).toBeInTheDocument();
      expect(screen.getByText('Project not found')).toBeInTheDocument();
      expect(screen.getByText('Back to Projects')).toBeInTheDocument();
    });
  });

  it('should show error state when access denied', async () => {
    const mockResponse = {
      ok: false,
      status: 403
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading project')).toBeInTheDocument();
      expect(screen.getByText('You do not have access to this project')).toBeInTheDocument();
    });
  });

  it('should navigate back to projects when back button is clicked', async () => {
    const mockResponse = {
      ok: false,
      status: 404
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Back to Projects')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Projects'));

    expect(mockPush).toHaveBeenCalledWith('/projects');
  });

  it('should display overview tab by default', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Project Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Todos')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total todos
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Completed todos
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // In progress todos
    });
  });

  it('should switch to todos tab when clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Todos'));

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('should switch to members tab when clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Members')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Members'));

    await waitFor(() => {
      expect(screen.getByText('Team Members')).toBeInTheDocument();
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('owner')).toBeInTheDocument();
      expect(screen.getByText('editor')).toBeInTheDocument();
    });
  });

  it('should switch to messages tab when clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Messages'));

    await waitFor(() => {
      expect(screen.getByText('Project Messages')).toBeInTheDocument();
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('should open edit project modal when edit button is clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Project')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test project description')).toBeInTheDocument();
    });
  });

  it('should update project successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    const mockUpdateResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: { ...mockProject, name: 'Updated Project', description: 'Updated description' }
      })
    };

    mockFetch
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockUpdateResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Project')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Test Project');
    const descriptionInput = screen.getByDisplayValue('Test project description');

    fireEvent.change(nameInput, { target: { value: 'Updated Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

    fireEvent.click(screen.getByText('Update Project'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/projects/test-project-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Project',
          description: 'Updated description'
        }),
      });
    });
  });

  it('should show validation error when project name is empty', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Project')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Test Project');
    fireEvent.change(nameInput, { target: { value: '' } });

    fireEvent.click(screen.getByText('Update Project'));

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });
  });

  it('should open delete confirmation modal when delete button is clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete Project')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete "Test Project"? This action cannot be undone.')).toBeInTheDocument();
    });
  });

  it('should delete project successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    const mockDeleteResponse = {
      ok: true,
      json: () => Promise.resolve({ message: 'Project deleted successfully' })
    };

    global.fetch
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockDeleteResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Click the delete button in the header
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete Project')).toBeInTheDocument();
    });

    // Click the delete button in the modal
    const modalContainer = screen.getByText('Delete Project').closest('div');
    const deleteButton = within(modalContainer!).getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const found = calls.some(
        ([url, options]) =>
          url === '/api/projects/test-project-id' &&
          options && options.method === 'DELETE'
      );
      expect(found).toBe(true);
    });
  });

  it('should open add member modal when add member button is clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Switch to members tab first
    fireEvent.click(screen.getByText('Members'));

    await waitFor(() => {
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    // Click the add member button
    fireEvent.click(screen.getByText('Add Member'));

    await waitFor(() => {
      expect(screen.getByText('Add Team Member')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
      expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });
  });

  it('should add member successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    const mockAddMemberResponse = {
      ok: true,
      json: () => Promise.resolve({ message: 'Member added successfully' })
    };

    global.fetch
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockAddMemberResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Switch to members tab
    fireEvent.click(screen.getByText('Members'));

    await waitFor(() => {
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    // Open add member modal
    fireEvent.click(screen.getByText('Add Member'));

    await waitFor(() => {
      expect(screen.getByText('Add Team Member')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email Address *');
    const roleSelect = screen.getByLabelText('Role');

    fireEvent.change(emailInput, { target: { value: 'user3@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'viewer' } });

    // Submit the form
    const modalContainer = screen.getByText('Add Team Member').closest('div');
    const submitButton = within(modalContainer!).getByText('Add Member');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/projects/test-project-id/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user3@example.com',
          role: 'viewer'
        }),
      });
    });
  });

  it('should show validation error when email is empty', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Switch to members tab
    fireEvent.click(screen.getByText('Members'));

    await waitFor(() => {
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    // Open add member modal
    fireEvent.click(screen.getByText('Add Member'));

    await waitFor(() => {
      expect(screen.getByText(/Add Team Member/)).toBeInTheDocument();
    });

    // Submit with empty email
    const modalContainer = screen.getByText('Add Team Member').closest('div');
    const submitButton = within(modalContainer!).getByText('Add Member');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should show empty state for todos when no todos exist', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: [],
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Todos'));

    await waitFor(() => {
      expect(screen.getByText('No todos')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first todo.')).toBeInTheDocument();
    });
  });

  it('should show empty state for messages when no messages exist', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: []
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Messages'));

    await waitFor(() => {
      expect(screen.getByText('No messages')).toBeInTheDocument();
      expect(screen.getByText('Start a conversation with your team.')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/2023|2024/)).toBeInTheDocument();
    });
  });

  it('should display priority and status colors correctly', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    mockFetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Todos'));

    await waitFor(() => {
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('should open add todo modal when add todo button is clicked', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    global.fetch.mockResolvedValue(mockResponse);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Switch to todos tab
    fireEvent.click(screen.getByText('Todos'));

    await waitFor(() => {
      expect(screen.getByText('Add Todo')).toBeInTheDocument();
    });

    // Click the Add Todo button
    fireEvent.click(screen.getByText('Add Todo'));

    await waitFor(() => {
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();
      expect(screen.getByTestId('todo-modal-title')).toHaveTextContent('Add New Todo');
    });
  });

  it('should create new todo successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        project: mockProject,
        todos: mockTodos,
        messages: mockMessages
      })
    };

    const mockCreateResponse = {
      ok: true,
      json: () => Promise.resolve({
        todo: {
          id: 'new-todo-id',
          title: 'New Todo',
          description: 'New todo description',
          priority: 'medium',
          status: 'pending',
          createdBy: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      })
    };

    global.fetch
      .mockResolvedValueOnce(mockResponse) // Initial project data
      .mockResolvedValueOnce(mockCreateResponse); // Create todo response

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Switch to todos tab
    fireEvent.click(screen.getByText('Todos'));

    await waitFor(() => {
      expect(screen.getByText('Add Todo')).toBeInTheDocument();
    });

    // Click the Add Todo button
    fireEvent.click(screen.getByText('Add Todo'));

    await waitFor(() => {
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();
    });

    // Submit the todo
    fireEvent.click(screen.getByTestId('todo-modal-submit'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Todo',
          projectIds: ['test-project-id']
        }),
      });
    });
  });
}); 