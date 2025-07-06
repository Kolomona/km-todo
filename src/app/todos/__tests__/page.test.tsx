import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import TodosPage from '../page'

// Mock the components
vi.mock('@/components/layout/AuthenticatedLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="authenticated-layout">{children}</div>
}))

vi.mock('@/components/todos/TodoList', () => ({
  default: ({ todos, loading, onEdit, onDelete, onStatusToggle }: any) => (
    <div data-testid="todo-list">
      {loading ? 'Loading...' : `Todos: ${todos?.length || 0}`}
      {todos && todos.length > 0 && (
        <>
          <button onClick={() => onEdit(todos[0])}>Edit First Todo</button>
          <button onClick={() => onDelete('1')}>Delete First Todo</button>
          <button onClick={() => onStatusToggle('1', 'completed')}>Toggle Status</button>
        </>
      )}
    </div>
  )
}))

vi.mock('@/components/todos/TodoModal', () => ({
  default: ({ isOpen, onClose, onSubmit, title }: any) => (
    isOpen ? (
      <div data-testid="todo-modal">
        <h2>{title}</h2>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSubmit({ title: 'Test Todo' })}>
          {title === 'Edit Todo' ? 'Update Todo' : 'Create Todo'}
        </button>
      </div>
    ) : null
  )
}))

vi.mock('@/components/todos/TodoFilters', () => ({
  default: ({ filters, onFilterChange }: any) => (
    <div data-testid="todo-filters">
      <button onClick={() => onFilterChange({ status: 'pending' })}>Apply Status Filter</button>
      <button onClick={() => onFilterChange({})}>Clear Filters</button>
    </div>
  )
}))

// Mock fetch
global.fetch = vi.fn()

const mockTodos = [
  {
    id: '1',
    title: 'Test Todo 1',
    description: 'This is a test todo',
    dueDate: '2024-12-25T00:00:00Z',
    priority: 'high' as const,
    status: 'pending' as const,
    estimatedTime: 60,
    createdBy: 'user1',
    assignedTo: 'user2',
    createdAt: '2024-12-19T00:00:00Z',
    updatedAt: '2024-12-19T00:00:00Z',
    projects: [],
    timeLogs: [],
    recurringPattern: undefined
  },
  {
    id: '2',
    title: 'Test Todo 2',
    description: 'Another test todo',
    dueDate: '2024-12-26T00:00:00Z',
    priority: 'medium' as const,
    status: 'completed' as const,
    estimatedTime: 120,
    createdBy: 'user1',
    assignedTo: undefined,
    createdAt: '2024-12-19T00:00:00Z',
    updatedAt: '2024-12-19T00:00:00Z',
    projects: [],
    timeLogs: [],
    recurringPattern: undefined
  }
]

describe('TodosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        todos: mockTodos,
        totalCount: 2,
        page: 1,
        totalPages: 1
      })
    })
  })

  afterEach(() => {
    // Reset to default mock after each test
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        todos: mockTodos,
        totalCount: 2,
        page: 1,
        totalPages: 1
      })
    })
  })

  describe('Initial Render', () => {
    it('should render the page with correct title and description', () => {
      render(<TodosPage />)
      
      expect(screen.getByText('Todos')).toBeInTheDocument()
      expect(screen.getByText('Manage your tasks and track your progress')).toBeInTheDocument()
    })

    it('should render the Add Todo button', () => {
      render(<TodosPage />)
      
      expect(screen.getByText('Add Todo')).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(<TodosPage />)
      
      expect(screen.getByPlaceholderText('Search todos...')).toBeInTheDocument()
    })

    it('should render filters button', () => {
      render(<TodosPage />)
      
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('should render TodoList component', () => {
      render(<TodosPage />)
      
      expect(screen.getByTestId('todo-list')).toBeInTheDocument()
    })
  })

  describe('Data Fetching', () => {
    it('should fetch todos on component mount', async () => {
      render(<TodosPage />)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos?page=1&limit=20')
      })
    })

    it('should handle fetch error gracefully', async () => {
      ;(fetch as any).mockRejectedValue(new Error('Failed to fetch'))
      
      render(<TodosPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
      })
    })

    it('should show loading state initially', () => {
      render(<TodosPage />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Create Todo', () => {
    it('should open create modal when Add Todo button is clicked', () => {
      render(<TodosPage />)
      
      const addButton = screen.getByText('Add Todo')
      fireEvent.click(addButton)
      
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument()
      expect(screen.getByText('Create New Todo')).toBeInTheDocument()
    })

    it('should close modal and refresh todos when todo is created', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<TodosPage />)
      
      // Open modal
      const addButton = screen.getByText('Add Todo')
      fireEvent.click(addButton)
      
      // Submit todo
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument()
      })
    })

    it('should handle create todo error', async () => {
      // First call returns todos, second call fails for create todo
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            todos: mockTodos,
            totalCount: 2,
            page: 1,
            totalPages: 1
          })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: { message: 'Failed to create todo' } })
        })
      
      render(<TodosPage />)
      
      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Todos: 2')).toBeInTheDocument()
      })
      
      // Open modal
      const addButton = screen.getByText('Add Todo')
      fireEvent.click(addButton)
      
      // Submit todo
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create todo')).toBeInTheDocument()
      })
    })
  })

  describe('Edit Todo', () => {
    it('should open edit modal when edit button is clicked', async () => {
      render(<TodosPage />)
      
      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Todos: 2')).toBeInTheDocument()
      })
      
      const editButton = screen.getByText('Edit First Todo')
      fireEvent.click(editButton)
      
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument()
      expect(screen.getByText('Edit Todo')).toBeInTheDocument()
    })

    it('should close modal and refresh todos when todo is updated', async () => {
      // First call returns todos, second call is for the update
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            todos: mockTodos,
            totalCount: 2,
            page: 1,
            totalPages: 1
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })
      
      render(<TodosPage />)
      
      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Todos: 2')).toBeInTheDocument()
      })
      
      const editButton = screen.getByText('Edit First Todo')
      fireEvent.click(editButton)
      
      const submitButton = screen.getByText('Update Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Delete Todo', () => {
    it('should show confirmation dialog and delete todo', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      // First call returns todos, second call is for the delete
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            todos: mockTodos,
            totalCount: 2,
            page: 1,
            totalPages: 1
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })
      
      render(<TodosPage />)
      
      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Todos: 2')).toBeInTheDocument()
      })
      
      const deleteButton = screen.getByText('Delete First Todo')
      fireEvent.click(deleteButton)
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?')
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos/1', { method: 'DELETE' })
      })
      
      confirmSpy.mockRestore()
    })

    it('should not delete todo when user cancels confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      render(<TodosPage />)
      
      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Todos: 2')).toBeInTheDocument()
      })
      
      const deleteButton = screen.getByText('Delete First Todo')
      fireEvent.click(deleteButton)
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?')
      expect(fetch).not.toHaveBeenCalledWith('/api/todos/1', { method: 'DELETE' })
      
      confirmSpy.mockRestore()
    })
  })

  describe('Status Toggle', () => {
    it('should toggle todo status', async () => {
      // First call returns todos, second call is for the status toggle
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            todos: mockTodos,
            totalCount: 2,
            page: 1,
            totalPages: 1
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })
      
      render(<TodosPage />)
      
      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Todos: 2')).toBeInTheDocument()
      })
      
      const toggleButton = screen.getByText('Toggle Status')
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' })
        })
      })
    })
  })

  describe('Search and Filtering', () => {
    it('should update search filter when typing in search input', async () => {
      render(<TodosPage />)
      
      const searchInput = screen.getByPlaceholderText('Search todos...')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos?page=1&limit=20&search=test')
      })
    })

    it('should toggle filters section when filters button is clicked', () => {
      render(<TodosPage />)
      
      const filtersButton = screen.getByText('Filters')
      fireEvent.click(filtersButton)
      
      expect(screen.getByTestId('todo-filters')).toBeInTheDocument()
    })

    it('should apply filters when filter component calls onFilterChange', async () => {
      render(<TodosPage />)
      
      // Open filters
      const filtersButton = screen.getByText('Filters')
      fireEvent.click(filtersButton)
      
      // Apply filter
      const applyFilterButton = screen.getByText('Apply Status Filter')
      fireEvent.click(applyFilterButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos?page=1&limit=20&status=pending')
      })
    })

    it('should clear filters when clear filters is clicked', async () => {
      render(<TodosPage />)
      
      // Open filters
      const filtersButton = screen.getByText('Filters')
      fireEvent.click(filtersButton)
      
      // Clear filters
      const clearFiltersButton = screen.getByText('Clear Filters')
      fireEvent.click(clearFiltersButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos?page=1&limit=20')
      })
    })
  })

  describe('Pagination', () => {
    it('should handle page changes', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          todos: mockTodos,
          totalCount: 40,
          page: 2,
          totalPages: 2
        })
      })
      
      render(<TodosPage />)
      
      // This would be handled by the TodoList component
      // The page component should pass the onPageChange handler
      await waitFor(() => {
        expect(screen.getByTestId('todo-list')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error message and retry button when fetch fails', async () => {
      ;(fetch as any).mockRejectedValue(new Error('Network error'))
      
      render(<TodosPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    it('should retry fetch when retry button is clicked', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))
      
      render(<TodosPage />)
      
      await waitFor(() => {
        const retryButton = screen.getByText('Try Again')
        fireEvent.click(retryButton)
      })
      
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Component Integration', () => {
    it('should pass correct props to TodoList component', async () => {
      render(<TodosPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('todo-list')).toBeInTheDocument()
      })
    })

    it('should pass correct props to TodoModal component', () => {
      render(<TodosPage />)
      
      const addButton = screen.getByText('Add Todo')
      fireEvent.click(addButton)
      
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument()
    })

    it('should pass correct props to TodoFilters component', () => {
      render(<TodosPage />)
      
      const filtersButton = screen.getByText('Filters')
      fireEvent.click(filtersButton)
      
      expect(screen.getByTestId('todo-filters')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should maintain filter state across operations', async () => {
      render(<TodosPage />)
      
      // Set a filter
      const searchInput = screen.getByPlaceholderText('Search todos...')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos?page=1&limit=20&search=test')
      })
      
      // Create a todo should maintain the filter
      const addButton = screen.getByText('Add Todo')
      fireEvent.click(addButton)
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos?page=1&limit=20&search=test')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<TodosPage />)
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Todos')
    })

    it('should have proper button roles', () => {
      render(<TodosPage />)
      
      expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
    })

    it('should have proper form labels', () => {
      render(<TodosPage />)
      
      const searchInput = screen.getByPlaceholderText('Search todos...')
      expect(searchInput).toBeInTheDocument()
    })
  })
}) 