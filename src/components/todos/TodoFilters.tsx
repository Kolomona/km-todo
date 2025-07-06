'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface TodoFilters {
  status?: string
  priority?: string
  assignedTo?: string
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
}

interface TodoFiltersProps {
  filters: TodoFilters
  onFilterChange: (filters: TodoFilters) => void
}

export default function TodoFilters({ filters, onFilterChange }: TodoFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TodoFilters>(filters)

  const handleFilterChange = (field: keyof TodoFilters, value: string) => {
    const newFilters = {
      ...localFilters,
      [field]: value || undefined
    }
    setLocalFilters(newFilters)
    
    // If this is a removal (value is empty), immediately apply the change
    if (!value) {
      onFilterChange(newFilters)
    }
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: TodoFilters = {}
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '')

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={localFilters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Assigned To Filter */}
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <input
            type="text"
            id="assignedTo"
            value={localFilters.assignedTo || ''}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="User ID"
          />
        </div>

        {/* Due Date From */}
        <div>
          <label htmlFor="dueDateFrom" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date From
          </label>
          <input
            type="date"
            id="dueDateFrom"
            value={localFilters.dueDateFrom || ''}
            onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Due Date To */}
        <div>
          <label htmlFor="dueDateTo" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date To
          </label>
          <input
            type="date"
            id="dueDateTo"
            value={localFilters.dueDateTo || ''}
            onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Priority: {filters.priority}
                <button
                  onClick={() => handleFilterChange('priority', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.assignedTo && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Assigned: {filters.assignedTo}
                <button
                  onClick={() => handleFilterChange('assignedTo', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.dueDateFrom && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                From: {filters.dueDateFrom}
                <button
                  onClick={() => handleFilterChange('dueDateFrom', '')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.dueDateTo && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                To: {filters.dueDateTo}
                <button
                  onClick={() => handleFilterChange('dueDateTo', '')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Search: {filters.search}
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter Actions */}
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={handleApplyFilters}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
} 