import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import TodoList from '../TodoList'

// Mock the todo data
const mockTodos = [
  {
    id: '1',
    title: 'Test Todo 1',
    description: 'This is a test todo description',
    dueDate: '2024-12-25T00:00:00Z',
    priority: 'high' as const,
    status: 'pending' as const,
    estimatedTime: 60,
    createdBy: 'user1',
    assignedTo: 'user2',
    createdAt: '2024-12-19T00:00:00Z',
    updatedAt: '2024-12-19T00:00:00Z',
    projects: [
      {
        id: 'tp1',
        todoId: '1',
        projectId: 'project1',
        project: {
          id: 'project1',
          name: 'Test Project',
          description: 'A test project'
        }
      }
    ],
    timeLogs: [
      {
        id: 'tl1',
        todoId: '1',
        userId: 'user1',
        timeSpent: 30,
        date: '2024-12-19T00:00:00Z',
        notes: 'Worked on this todo',
        createdAt: '2024-12-19T00:00:00Z'
      }
    ],
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
    recurringPattern: {
      id: 'rp1',
      todoId: '2',
      patternType: 'daily' as const,
      patternData: { interval: 1 },
      nextDueDate: '2024-12-26T00:00:00Z',
      isActive: true
    }
  }
]

const defaultProps = {
  todos: mockTodos,
  loading: false,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onStatusToggle: vi.fn(),
  currentPage: 1,
  totalPages: 1,
  totalCount: 2,
  onPageChange: vi.fn()
}

describe('TodoList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      render(<TodoList {...defaultProps} loading={true} />)
      
      const skeletons = screen.getAllByTestId('loading-skeleton')
      expect(skeletons).toHaveLength(5)
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no todos are provided', () => {
      render(<TodoList {...defaultProps} todos={[]} />)
      
      expect(screen.getByText('No todos found')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first todo.')).toBeInTheDocument()
    })
  })

  describe('Todo Display', () => {
    it('should render todos with correct information', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument()
      expect(screen.getByText('This is a test todo description')).toBeInTheDocument()
      expect(screen.getByText('Another test todo')).toBeInTheDocument()
    })

    it('should display priority badges correctly', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.getByText('high')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
    })

    it('should display status badges correctly', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.getByText('pending')).toBeInTheDocument()
      expect(screen.getByText('completed')).toBeInTheDocument()
    })

    it('should display project tags', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    it('should display recurring pattern indicator', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.getByText('Recurring')).toBeInTheDocument()
    })

    it('should display time information correctly', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.getByText('Est: 1h 0m')).toBeInTheDocument()
      expect(screen.getByText('Est: 2h 0m')).toBeInTheDocument()
      expect(screen.getByText('Spent: 30m')).toBeInTheDocument()
    })

    it('should display due dates correctly', () => {
      render(<TodoList {...defaultProps} />)
      
      const dueDateElements = screen.getAllByText(/Due: Dec \d+, 2024/)
      expect(dueDateElements).toHaveLength(2)
    })
  })

  describe('Todo Actions', () => {
    it('should call onStatusToggle when status button is clicked', () => {
      render(<TodoList {...defaultProps} />)
      
      const statusButtons = screen.getAllByRole('button', { name: /mark as/i })
      fireEvent.click(statusButtons[0])
      
      expect(defaultProps.onStatusToggle).toHaveBeenCalledWith('1', 'in_progress')
    })

    it('should call onEdit when edit button is clicked', () => {
      render(<TodoList {...defaultProps} />)
      
      const editButtons = screen.getAllByText('Edit')
      fireEvent.click(editButtons[0])
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTodos[0])
    })

    it('should call onDelete when delete button is clicked', () => {
      render(<TodoList {...defaultProps} />)
      
      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0])
      
      expect(defaultProps.onDelete).toHaveBeenCalledWith('1')
    })
  })

  describe('Expandable Details', () => {
    it('should show "Show details" button by default', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.getAllByText('Show details')).toHaveLength(2)
    })

    it('should expand todo details when "Show details" is clicked', () => {
      render(<TodoList {...defaultProps} />)
      
      const showDetailsButtons = screen.getAllByText('Show details')
      fireEvent.click(showDetailsButtons[0])
      
      expect(screen.getByText('Hide details')).toBeInTheDocument()
      expect(screen.getByText('Time Tracking')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
    })

    it('should show time tracking information when expanded', () => {
      render(<TodoList {...defaultProps} />)
      
      const showDetailsButtons = screen.getAllByText('Show details')
      fireEvent.click(showDetailsButtons[0])
      
      // Check for time tracking section
      expect(screen.getByText('Time Tracking')).toBeInTheDocument()
      expect(screen.getByText('30m')).toBeInTheDocument()
    })

    it('should show creation and update dates when expanded', () => {
      render(<TodoList {...defaultProps} />)
      
      const showDetailsButtons = screen.getAllByText('Show details')
      fireEvent.click(showDetailsButtons[0])
      
      expect(screen.getByText(/Created: Dec \d+, 2024/)).toBeInTheDocument()
      expect(screen.getByText(/Updated: Dec \d+, 2024/)).toBeInTheDocument()
    })

    it('should show next due date for recurring todos when expanded', () => {
      render(<TodoList {...defaultProps} />)
      
      const showDetailsButtons = screen.getAllByText('Show details')
      fireEvent.click(showDetailsButtons[1]) // Second todo has recurring pattern
      
      expect(screen.getByText(/Next due: Dec \d+, 2024/)).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should not show pagination when totalPages is 1', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('should show pagination when totalPages is greater than 1', () => {
      render(<TodoList {...defaultProps} totalPages={3} />)
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    })

    it('should call onPageChange when pagination buttons are clicked', () => {
      render(<TodoList {...defaultProps} totalPages={3} />)
      
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)
    })

    it('should disable Previous button on first page', () => {
      render(<TodoList {...defaultProps} totalPages={3} currentPage={1} />)
      
      const prevButton = screen.getByText('Previous')
      expect(prevButton).toBeDisabled()
    })

    it('should disable Next button on last page', () => {
      render(<TodoList {...defaultProps} totalPages={3} currentPage={3} />)
      
      const nextButton = screen.getByText('Next')
      expect(nextButton).toBeDisabled()
    })

    it('should display correct pagination information', () => {
      render(<TodoList {...defaultProps} totalPages={3} totalCount={30} />)
      
      expect(screen.getByText('Showing page 1 of 3 (30 total todos)')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      render(<TodoList {...defaultProps} />)
      
      const statusButtons = screen.getAllByRole('button', { name: /mark as/i })
      expect(statusButtons[0]).toHaveAttribute('title', 'Mark as in_progress')
    })

    it('should have proper button roles', () => {
      render(<TodoList {...defaultProps} />)
      
      expect(screen.getAllByRole('button')).toHaveLength(8) // 2 status + 2 edit + 2 delete + 2 show details
    })
  })

  describe('Edge Cases', () => {
    it('should handle todos without description', () => {
      const todosWithoutDescription = [
        {
          ...mockTodos[0],
          description: undefined
        }
      ]
      
      render(<TodoList {...defaultProps} todos={todosWithoutDescription} />)
      
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.queryByText('This is a test todo description')).not.toBeInTheDocument()
    })

    it('should handle todos without due date', () => {
      const todosWithoutDueDate = [
        {
          ...mockTodos[0],
          dueDate: undefined
        }
      ]
      
      render(<TodoList {...defaultProps} todos={todosWithoutDueDate} />)
      
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.queryByText('Due: Dec 25, 2024')).not.toBeInTheDocument()
    })

    it('should handle todos without estimated time', () => {
      const todosWithoutEstimatedTime = [
        {
          ...mockTodos[0],
          estimatedTime: undefined
        }
      ]
      
      render(<TodoList {...defaultProps} todos={todosWithoutEstimatedTime} />)
      
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.queryByText('Est: 1h 0m')).not.toBeInTheDocument()
    })

    it('should handle todos without time logs', () => {
      const todosWithoutTimeLogs = [
        {
          ...mockTodos[0],
          timeLogs: []
        }
      ]
      
      render(<TodoList {...defaultProps} todos={todosWithoutTimeLogs} />)
      
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.queryByText('Spent: 30m')).not.toBeInTheDocument()
    })

    it('should handle todos without projects', () => {
      const todosWithoutProjects = [
        {
          ...mockTodos[0],
          projects: []
        }
      ]
      
      render(<TodoList {...defaultProps} todos={todosWithoutProjects} />)
      
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Project')).not.toBeInTheDocument()
    })
  })
}) 