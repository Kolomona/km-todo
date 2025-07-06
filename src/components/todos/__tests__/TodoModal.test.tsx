import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import TodoModal from '../TodoModal'

// Mock fetch
global.fetch = vi.fn()

const mockProjects = [
  {
    id: 'project1',
    name: 'Test Project 1',
    description: 'A test project'
  },
  {
    id: 'project2',
    name: 'Test Project 2',
    description: 'Another test project'
  }
]

const mockTodo = {
  id: '1',
  title: 'Test Todo',
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
        name: 'Test Project 1',
        description: 'A test project'
      }
    }
  ],
  timeLogs: [],
  recurringPattern: {
    id: 'rp1',
    todoId: '1',
    patternType: 'daily' as const,
    patternData: { interval: 1 },
    nextDueDate: '2024-12-26T00:00:00Z',
    isActive: true
  }
}

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  title: 'Create New Todo'
}

describe('TodoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ projects: mockProjects })
    })
  })

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<TodoModal {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByText('Create New Todo')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(<TodoModal {...defaultProps} />)
      
      expect(screen.getByText('Create New Todo')).toBeInTheDocument()
    })
  })

  describe('Form Fields', () => {
    it('should render all required form fields', () => {
      render(<TodoModal {...defaultProps} />)
      
      expect(screen.getByLabelText('Title *')).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Priority')).toBeInTheDocument()
      expect(screen.getByLabelText('Estimated Time (minutes)')).toBeInTheDocument()
      expect(screen.getByLabelText('Assign To')).toBeInTheDocument()
    })

    it('should have correct default values for new todo', () => {
      render(<TodoModal {...defaultProps} />)
      
      expect(screen.getByLabelText('Title *')).toHaveValue('')
      expect(screen.getByLabelText('Description')).toHaveValue('')
      expect(screen.getByLabelText('Due Date')).toHaveValue('')
      expect(screen.getByLabelText('Priority')).toHaveValue('medium')
      expect(screen.getByLabelText('Estimated Time (minutes)')).toHaveValue('')
      expect(screen.getByLabelText('Assign To')).toHaveValue('')
    })
  })

  describe('Edit Mode', () => {
    it('should populate form with todo data when editing', async () => {
      render(<TodoModal {...defaultProps} todo={mockTodo} title="Edit Todo" />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Title *')).toHaveValue('Test Todo')
        expect(screen.getByLabelText('Description')).toHaveValue('This is a test todo description')
        expect(screen.getByLabelText('Due Date')).toHaveValue('2024-12-25')
        expect(screen.getByLabelText('Priority')).toHaveValue('high')
        expect(screen.getByLabelText('Estimated Time (minutes)')).toHaveValue('60')
        expect(screen.getByLabelText('Assign To')).toHaveValue('user2')
      })
    })

    it('should show correct title when editing', () => {
      render(<TodoModal {...defaultProps} todo={mockTodo} title="Edit Todo" />)
      
      expect(screen.getByText('Edit Todo')).toBeInTheDocument()
    })

    it('should show correct submit button text when editing', () => {
      render(<TodoModal {...defaultProps} todo={mockTodo} title="Edit Todo" />)
      
      expect(screen.getByText('Update Todo')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      render(<TodoModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
    })

    it('should show error when estimated time is not a positive integer', async () => {
      render(<TodoModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText('Title *')
      const estimatedTimeInput = screen.getByLabelText('Estimated Time (minutes)')
      
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } })
      fireEvent.change(estimatedTimeInput, { target: { value: '-5' } })
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText('Estimated time must be a positive integer')).toBeInTheDocument()
      })
      // Now try a decimal
      fireEvent.change(estimatedTimeInput, { target: { value: '2.5' } })
      fireEvent.click(submitButton)
      await waitFor(() => {
        expect(screen.getByText('Estimated time must be a positive integer')).toBeInTheDocument()
      })
    })

    it('should show error when due date is in the past', async () => {
      render(<TodoModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText('Title *')
      const dueDateInput = screen.getByLabelText('Due Date')
      
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } })
      fireEvent.change(dueDateInput, { target: { value: '2000-01-01' } })
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Due date cannot be in the past'))).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      render(<TodoModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText('Title *')
      const descriptionInput = screen.getByLabelText('Description')
      const dueDateInput = screen.getByLabelText('Due Date')
      const prioritySelect = screen.getByLabelText('Priority')
      const estimatedTimeInput = screen.getByLabelText('Estimated Time (minutes)')
      const assignedToInput = screen.getByLabelText('Assign To')
      
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
      fireEvent.change(dueDateInput, { target: { value: '2099-12-25' } })
      fireEvent.change(prioritySelect, { target: { value: 'high' } })
      fireEvent.change(estimatedTimeInput, { target: { value: '60' } })
      fireEvent.change(assignedToInput, { target: { value: 'user1' } })
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
          title: 'Test Todo',
          description: 'Test description',
          dueDate: '2099-12-25',
          priority: 'high',
          estimatedTime: 60,
          assignedTo: 'user1',
          projectIds: []
        })
      })
    })

    it('should not call onSubmit when form is invalid', async () => {
      render(<TodoModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('Project Selection', () => {
    it('should fetch and display projects', async () => {
      render(<TodoModal {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Project 1')).toBeInTheDocument()
        expect(screen.getByText('Test Project 2')).toBeInTheDocument()
      })
    })

    it('should allow selecting projects', async () => {
      render(<TodoModal {...defaultProps} />)
      
      await waitFor(() => {
        const projectCheckbox = screen.getByLabelText('Test Project 1')
        fireEvent.click(projectCheckbox)
      })
      
      const titleInput = screen.getByLabelText('Title *')
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } })
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            projectIds: ['project1']
          })
        )
      })
    })
  })

  describe('Recurring Pattern', () => {
    it('should show recurring pattern section when checkbox is checked', () => {
      render(<TodoModal {...defaultProps} />)
      
      const recurringCheckbox = screen.getByLabelText('Make this todo recurring')
      fireEvent.click(recurringCheckbox)
      
      expect(screen.getByText('Pattern Type')).toBeInTheDocument()
      expect(screen.getByLabelText('Pattern Type')).toHaveValue('daily')
    })

    it('should include recurring pattern in submission when enabled', async () => {
      render(<TodoModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText('Title *')
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } })
      
      const recurringCheckbox = screen.getByLabelText('Make this todo recurring')
      fireEvent.click(recurringCheckbox)
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            recurringPattern: {
              patternType: 'daily',
              patternData: {
                interval: 1,
                dayOfWeek: [],
                dayOfMonth: [],
                weekOfMonth: [],
                customRule: ''
              }
            }
          })
        )
      })
    })

    it('should show custom rule field when custom pattern is selected', () => {
      render(<TodoModal {...defaultProps} />)
      
      const recurringCheckbox = screen.getByLabelText('Make this todo recurring')
      fireEvent.click(recurringCheckbox)
      
      const patternTypeSelect = screen.getByLabelText('Pattern Type')
      fireEvent.change(patternTypeSelect, { target: { value: 'custom' } })
      
      expect(screen.getByLabelText('Custom Rule *')).toBeInTheDocument()
    })

    it('should validate custom rule when custom pattern is selected', async () => {
      render(<TodoModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText('Title *')
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } })
      
      const recurringCheckbox = screen.getByLabelText('Make this todo recurring')
      fireEvent.click(recurringCheckbox)
      
      const patternTypeSelect = screen.getByLabelText('Pattern Type')
      fireEvent.change(patternTypeSelect, { target: { value: 'custom' } })
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Custom rule is required for custom recurring pattern')).toBeInTheDocument()
      })
    })
  })

  describe('Modal Actions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<TodoModal {...defaultProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onClose when close button (X) is clicked', () => {
      render(<TodoModal {...defaultProps} />)
      
      const closeButton = screen.getByRole('button', { name: /close modal/i })
      fireEvent.click(closeButton)
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onClose when backdrop is clicked', () => {
      render(<TodoModal {...defaultProps} />)
      
      const backdrop = screen.getByRole('presentation')
      fireEvent.click(backdrop)
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should show loading state during submission', async () => {
      defaultProps.onSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<TodoModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText('Title *')
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } })
      
      const submitButton = screen.getByText('Create Todo')
      fireEvent.click(submitButton)
      
      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(screen.getByText('Saving...')).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch error for projects', async () => {
      ;(fetch as any).mockRejectedValue(new Error('Failed to fetch'))
      
      render(<TodoModal {...defaultProps} />)
      
      // Should not crash and should still render the form
      expect(screen.getByLabelText('Title *')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<TodoModal {...defaultProps} />)
      
      expect(screen.getByLabelText('Title *')).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Priority')).toBeInTheDocument()
      expect(screen.getByLabelText('Estimated Time (minutes)')).toBeInTheDocument()
      expect(screen.getByLabelText('Assign To')).toBeInTheDocument()
    })

    it('should have proper button roles', () => {
      render(<TodoModal {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create todo/i })).toBeInTheDocument()
    })
  })
}) 