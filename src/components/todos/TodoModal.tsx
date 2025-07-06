'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Todo {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimatedTime?: number
  createdBy: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  projects: Array<{
    id: string
    todoId: string
    projectId: string
    project: {
      id: string
      name: string
      description?: string
    }
  }>
  timeLogs: Array<{
    id: string
    todoId: string
    userId: string
    timeSpent: number
    date: string
    notes?: string
    createdAt: string
  }>
  recurringPattern?: {
    id: string
    todoId: string
    patternType: 'daily' | 'weekly' | 'monthly' | 'custom'
    patternData: any
    nextDueDate: string
    isActive: boolean
  }
}

interface Project {
  id: string
  name: string
  description?: string
}

interface TodoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  todo?: Todo | null
  title: string
}

export default function TodoModal({
  isOpen,
  onClose,
  onSubmit,
  todo,
  title
}: TodoModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedTime: '',
    assignedTo: '',
    projectIds: [] as string[],
    recurringPattern: {
      patternType: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
      patternData: {
        interval: 1,
        dayOfWeek: [] as number[],
        dayOfMonth: [] as number[],
        weekOfMonth: [] as number[],
        customRule: ''
      }
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [showRecurring, setShowRecurring] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
      if (todo) {
        setFormData({
          title: todo.title,
          description: todo.description || '',
          dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
          priority: todo.priority,
          estimatedTime: todo.estimatedTime?.toString() || '',
          assignedTo: todo.assignedTo || '',
          projectIds: todo.projects.map(tp => tp.projectId),
          recurringPattern: todo.recurringPattern ? {
            patternType: todo.recurringPattern.patternType,
            patternData: todo.recurringPattern.patternData
          } : {
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
        setShowRecurring(!!todo.recurringPattern)
      } else {
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          estimatedTime: '',
          assignedTo: '',
          projectIds: [],
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
        setShowRecurring(false)
      }
      setErrors({})
    }
  }, [isOpen, todo])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.estimatedTime && formData.estimatedTime.trim() !== '') {
      const num = Number(formData.estimatedTime)
      if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        newErrors.estimatedTime = 'Estimated time must be a positive integer'
      }
    }

    if (formData.dueDate && formData.dueDate.trim() !== '') {
      const dueDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }

    if (showRecurring && formData.recurringPattern.patternType === 'custom' && !formData.recurringPattern.patternData.customRule) {
      newErrors.recurringRule = 'Custom rule is required for custom recurring pattern'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        assignedTo: formData.assignedTo || undefined,
        projectIds: formData.projectIds,
        ...(showRecurring && {
          recurringPattern: {
            patternType: formData.recurringPattern.patternType,
            patternData: formData.recurringPattern.patternData
          }
        })
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Failed to submit todo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleRecurringPatternChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurringPattern: {
        ...prev.recurringPattern,
        [field]: value
      }
    }))
  }

  const handleRecurringDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurringPattern: {
        ...prev.recurringPattern,
        patternData: {
          ...prev.recurringPattern.patternData,
          [field]: value
        }
      }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} role="presentation"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6" data-testid="todo-modal">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {title}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.title ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter todo title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter todo description (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Due Date */}
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="date"
                        id="dueDate"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          errors.dueDate ? 'border-red-300' : ''
                        }`}
                      />
                      <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Estimated Time */}
                  <div>
                    <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
                      Estimated Time (minutes)
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        id="estimatedTime"
                        value={formData.estimatedTime}
                        onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                        className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          errors.estimatedTime ? 'border-red-300' : ''
                        }`}
                        placeholder="e.g., 30"
                        min="0"
                      />
                      <ClockIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.estimatedTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.estimatedTime}</p>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                      Assign To
                    </label>
                    <input
                      type="text"
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="User ID (optional)"
                    />
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projects
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {projects.map((project) => (
                      <label key={project.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.projectIds.includes(project.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('projectIds', [...formData.projectIds, project.id])
                            } else {
                              handleInputChange('projectIds', formData.projectIds.filter(id => id !== project.id))
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{project.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Recurring Pattern */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showRecurring}
                      onChange={(e) => setShowRecurring(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Make this todo recurring</span>
                  </label>

                  {showRecurring && (
                    <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
                      <div>
                        <label htmlFor="patternType" className="block text-sm font-medium text-gray-700">
                          Pattern Type
                        </label>
                        <select
                          id="patternType"
                          value={formData.recurringPattern.patternType}
                          onChange={(e) => handleRecurringPatternChange('patternType', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      {formData.recurringPattern.patternType === 'custom' && (
                        <div>
                          <label htmlFor="customRule" className="block text-sm font-medium text-gray-700">
                            Custom Rule *
                          </label>
                          <input
                            type="text"
                            id="customRule"
                            value={formData.recurringPattern.patternData.customRule}
                            onChange={(e) => handleRecurringDataChange('customRule', e.target.value)}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                              errors.recurringRule ? 'border-red-300' : ''
                            }`}
                            placeholder="e.g., every 2nd Thursday"
                          />
                          {errors.recurringRule && (
                            <p className="mt-1 text-sm text-red-600">{errors.recurringRule}</p>
                          )}
                        </div>
                      )}

                      {formData.recurringPattern.patternType !== 'custom' && (
                        <div>
                          <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                            Interval
                          </label>
                          <input
                            type="number"
                            id="interval"
                            value={formData.recurringPattern.patternData.interval}
                            onChange={(e) => handleRecurringDataChange('interval', parseInt(e.target.value))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            min="1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    data-testid="todo-modal-submit"
                    disabled={loading}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Always visible, accessible submit button */}
                    {loading ? 'Saving...' : (todo ? 'Update Todo' : 'Create Todo')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 