import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import TodoFilters from '../TodoFilters'

const defaultProps = {
  filters: {},
  onFilterChange: vi.fn()
}

describe('TodoFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Filter Fields', () => {
    it('should render all filter fields', () => {
      render(<TodoFilters {...defaultProps} />)
      
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Priority')).toBeInTheDocument()
      expect(screen.getByLabelText('Assigned To')).toBeInTheDocument()
      expect(screen.getByLabelText('Due Date From')).toBeInTheDocument()
      expect(screen.getByLabelText('Due Date To')).toBeInTheDocument()
    })

    it('should have correct default values', () => {
      render(<TodoFilters {...defaultProps} />)
      
      expect(screen.getByLabelText('Status')).toHaveValue('')
      expect(screen.getByLabelText('Priority')).toHaveValue('')
      expect(screen.getByLabelText('Assigned To')).toHaveValue('')
      expect(screen.getByLabelText('Due Date From')).toHaveValue('')
      expect(screen.getByLabelText('Due Date To')).toHaveValue('')
    })

    it('should populate fields with existing filter values', () => {
      const filters = {
        status: 'pending',
        priority: 'high',
        assignedTo: 'user1',
        dueDateFrom: '2024-12-01',
        dueDateTo: '2024-12-31'
      }
      
      render(<TodoFilters {...defaultProps} filters={filters} />)
      
      expect(screen.getByLabelText('Status')).toHaveValue('pending')
      expect(screen.getByLabelText('Priority')).toHaveValue('high')
      expect(screen.getByLabelText('Assigned To')).toHaveValue('user1')
      expect(screen.getByLabelText('Due Date From')).toHaveValue('2024-12-01')
      expect(screen.getByLabelText('Due Date To')).toHaveValue('2024-12-31')
    })
  })

  describe('Status Filter', () => {
    it('should have all status options', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const statusSelect = screen.getByLabelText('Status')
      const options = Array.from(statusSelect.querySelectorAll('option'))
      
      expect(options).toHaveLength(5) // All statuses + empty option
      expect(options[0]).toHaveValue('')
      expect(options[1]).toHaveValue('pending')
      expect(options[2]).toHaveValue('in_progress')
      expect(options[3]).toHaveValue('completed')
      expect(options[4]).toHaveValue('cancelled')
    })

    it('should update local state when status is changed', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const statusSelect = screen.getByLabelText('Status')
      fireEvent.change(statusSelect, { target: { value: 'completed' } })
      
      expect(statusSelect).toHaveValue('completed')
    })
  })

  describe('Priority Filter', () => {
    it('should have all priority options', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const prioritySelect = screen.getByLabelText('Priority')
      const options = Array.from(prioritySelect.querySelectorAll('option'))
      
      expect(options).toHaveLength(5) // All priorities + empty option
      expect(options[0]).toHaveValue('')
      expect(options[1]).toHaveValue('low')
      expect(options[2]).toHaveValue('medium')
      expect(options[3]).toHaveValue('high')
      expect(options[4]).toHaveValue('urgent')
    })

    it('should update local state when priority is changed', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const prioritySelect = screen.getByLabelText('Priority')
      fireEvent.change(prioritySelect, { target: { value: 'urgent' } })
      
      expect(prioritySelect).toHaveValue('urgent')
    })
  })

  describe('Assigned To Filter', () => {
    it('should update local state when assigned to is changed', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const assignedToInput = screen.getByLabelText('Assigned To')
      fireEvent.change(assignedToInput, { target: { value: 'user123' } })
      
      expect(assignedToInput).toHaveValue('user123')
    })
  })

  describe('Due Date Filters', () => {
    it('should update local state when due date from is changed', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const dueDateFromInput = screen.getByLabelText('Due Date From')
      fireEvent.change(dueDateFromInput, { target: { value: '2024-12-01' } })
      
      expect(dueDateFromInput).toHaveValue('2024-12-01')
    })

    it('should update local state when due date to is changed', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const dueDateToInput = screen.getByLabelText('Due Date To')
      fireEvent.change(dueDateToInput, { target: { value: '2024-12-31' } })
      
      expect(dueDateToInput).toHaveValue('2024-12-31')
    })
  })

  describe('Apply Filters', () => {
    it('should call onFilterChange with current filter values when Apply Filters is clicked', () => {
      render(<TodoFilters {...defaultProps} />)
      
      // Set some filter values
      const statusSelect = screen.getByLabelText('Status')
      const prioritySelect = screen.getByLabelText('Priority')
      const assignedToInput = screen.getByLabelText('Assigned To')
      
      fireEvent.change(statusSelect, { target: { value: 'pending' } })
      fireEvent.change(prioritySelect, { target: { value: 'high' } })
      fireEvent.change(assignedToInput, { target: { value: 'user1' } })
      
      const applyButton = screen.getByText('Apply Filters')
      fireEvent.click(applyButton)
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
        status: 'pending',
        priority: 'high',
        assignedTo: 'user1',
        dueDateFrom: undefined,
        dueDateTo: undefined
      })
    })

    it('should not include empty values in filter object', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const applyButton = screen.getByText('Apply Filters')
      fireEvent.click(applyButton)
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith({})
    })
  })

  describe('Clear All Filters', () => {
    it('should show clear all button when there are active filters', () => {
      const filters = {
        status: 'pending',
        priority: 'high'
      }
      
      render(<TodoFilters {...defaultProps} filters={filters} />)
      
      expect(screen.getByText('Clear all')).toBeInTheDocument()
    })

    it('should not show clear all button when there are no active filters', () => {
      render(<TodoFilters {...defaultProps} />)
      
      expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
    })

    it('should clear all filters when clear all button is clicked', () => {
      const filters = {
        status: 'pending',
        priority: 'high'
      }
      
      render(<TodoFilters {...defaultProps} filters={filters} />)
      
      const clearAllButton = screen.getByText('Clear all')
      fireEvent.click(clearAllButton)
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith({})
    })
  })

  describe('Active Filters Display', () => {
    it('should display active filters as badges', () => {
      const filters = {
        status: 'pending',
        priority: 'high',
        assignedTo: 'user1',
        dueDateFrom: '2024-12-01',
        dueDateTo: '2024-12-31',
        search: 'test'
      }
      
      render(<TodoFilters {...defaultProps} filters={filters} />)
      
      expect(screen.getByText('Status: pending')).toBeInTheDocument()
      expect(screen.getByText('Priority: high')).toBeInTheDocument()
      expect(screen.getByText('Assigned: user1')).toBeInTheDocument()
      expect(screen.getByText('From: 2024-12-01')).toBeInTheDocument()
      expect(screen.getByText('To: 2024-12-31')).toBeInTheDocument()
      expect(screen.getByText('Search: test')).toBeInTheDocument()
    })

    it('should allow removing individual filters by clicking X on badges', () => {
      const filters = {
        status: 'pending',
        priority: 'high'
      }
      
      render(<TodoFilters {...defaultProps} filters={filters} />)
      
      const statusBadge = screen.getByText('Status: pending')
      const removeButton = statusBadge.parentElement?.querySelector('button')
      
      if (removeButton) {
        fireEvent.click(removeButton)
      }
      
      // Should call onFilterChange with status removed
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
        priority: 'high'
      })
    })

    it('should have correct badge colors for different filter types', () => {
      const filters = {
        status: 'pending',
        priority: 'high',
        assignedTo: 'user1',
        dueDateFrom: '2024-12-01',
        search: 'test'
      }
      
      render(<TodoFilters {...defaultProps} filters={filters} />)
      
      const statusBadge = screen.getByText('Status: pending').closest('span')
      const priorityBadge = screen.getByText('Priority: high').closest('span')
      const assignedBadge = screen.getByText('Assigned: user1').closest('span')
      const dateBadge = screen.getByText('From: 2024-12-01').closest('span')
      const searchBadge = screen.getByText('Search: test').closest('span')
      
      expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800')
      expect(priorityBadge).toHaveClass('bg-green-100', 'text-green-800')
      expect(assignedBadge).toHaveClass('bg-purple-100', 'text-purple-800')
      expect(dateBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
      expect(searchBadge).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Local State Management', () => {
    it('should maintain local state separate from props', () => {
      const filters = {
        status: 'pending'
      }
      
      render(<TodoFilters {...defaultProps} filters={filters} />)
      
      const statusSelect = screen.getByLabelText('Status')
      fireEvent.change(statusSelect, { target: { value: 'completed' } })
      
      // Local state should change but props should remain the same
      expect(statusSelect).toHaveValue('completed')
      expect(screen.getByText('Status: pending')).toBeInTheDocument() // Still shows original filter
    })

    it('should apply local changes when Apply Filters is clicked', () => {
      const filters = {
        status: 'pending'
      }
      
      render(<TodoFilters {...defaultProps} filters={filters} />)
      
      const statusSelect = screen.getByLabelText('Status')
      fireEvent.change(statusSelect, { target: { value: 'completed' } })
      
      const applyButton = screen.getByText('Apply Filters')
      fireEvent.click(applyButton)
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
        status: 'completed'
      })
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const filterGrid = screen.getByText('Status').closest('div')?.parentElement
      expect(filterGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<TodoFilters {...defaultProps} />)
      
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Priority')).toBeInTheDocument()
      expect(screen.getByLabelText('Assigned To')).toBeInTheDocument()
      expect(screen.getByLabelText('Due Date From')).toBeInTheDocument()
      expect(screen.getByLabelText('Due Date To')).toBeInTheDocument()
    })

    it('should have proper button roles', () => {
      render(<TodoFilters {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      render(<TodoFilters {...defaultProps} />)
      
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Filters')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string values as undefined', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const statusSelect = screen.getByLabelText('Status')
      fireEvent.change(statusSelect, { target: { value: '' } })
      
      const applyButton = screen.getByText('Apply Filters')
      fireEvent.click(applyButton)
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith({})
    })

    it('should handle multiple filter changes before applying', () => {
      render(<TodoFilters {...defaultProps} />)
      
      const statusSelect = screen.getByLabelText('Status')
      const prioritySelect = screen.getByLabelText('Priority')
      
      fireEvent.change(statusSelect, { target: { value: 'pending' } })
      fireEvent.change(prioritySelect, { target: { value: 'high' } })
      fireEvent.change(statusSelect, { target: { value: 'completed' } })
      
      const applyButton = screen.getByText('Apply Filters')
      fireEvent.click(applyButton)
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
        status: 'completed',
        priority: 'high'
      })
    })
  })
}) 