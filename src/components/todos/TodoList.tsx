'use client'

import { useState } from 'react'
import { 
  PencilIcon, 
  TrashIcon, 
  ClockIcon, 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

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

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  onEdit: (todo: Todo) => void
  onDelete: (todoId: string) => void
  onStatusToggle: (todoId: string, newStatus: string) => void
  currentPage: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}

export default function TodoList({
  todos,
  loading,
  onEdit,
  onDelete,
  onStatusToggle,
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}: TodoListProps) {
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'medium':
        return <InformationCircleIcon className="h-4 w-4" />
      case 'low':
        return <InformationCircleIcon className="h-4 w-4" />
      default:
        return <InformationCircleIcon className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleSolidIcon className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-600" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'in_progress'
      case 'in_progress':
        return 'completed'
      case 'completed':
        return 'pending'
      case 'cancelled':
        return 'pending'
      default:
        return 'pending'
    }
  }

  const getTotalTimeSpent = (timeLogs: Todo['timeLogs']) => {
    return timeLogs.reduce((total, log) => total + log.timeSpent, 0)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse" data-testid="loading-skeleton">
            <div className="bg-gray-200 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <CheckCircleIcon className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No todos found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first todo.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onStatusToggle(todo.id, getNextStatus(todo.status))}
                      className="flex-shrink-0"
                      title={`Mark as ${getNextStatus(todo.status)}`}
                    >
                      {getStatusIcon(todo.status)}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {todo.title}
                      </h3>
                      
                      {todo.description && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {todo.dueDate && (
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due: {formatDate(todo.dueDate)}</span>
                      </div>
                    )}
                    
                    {todo.estimatedTime && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Est: {formatTime(todo.estimatedTime)}</span>
                      </div>
                    )}

                    {todo.timeLogs.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Spent: {formatTime(getTotalTimeSpent(todo.timeLogs))}</span>
                      </div>
                    )}

                    {todo.recurringPattern && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Recurring
                        </span>
                      </div>
                    )}
                  </div>

                  {todo.projects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {todo.projects.map((tp) => (
                        <span
                          key={tp.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tp.project.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                    {getPriorityIcon(todo.priority)}
                    <span className="ml-1">{todo.priority}</span>
                  </span>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                    {todo.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedTodo(expandedTodo === todo.id ? null : todo.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {expandedTodo === todo.id ? 'Hide details' : 'Show details'}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(todo)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PencilIcon className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => onDelete(todo.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {expandedTodo === todo.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Time Tracking</h4>
                      {todo.timeLogs.length > 0 ? (
                        <div className="space-y-2">
                          {todo.timeLogs.slice(0, 3).map((log) => (
                            <div key={log.id} className="flex justify-between items-center">
                              <span>{formatDate(log.date)}</span>
                              <span className="font-medium">{formatTime(log.timeSpent)}</span>
                            </div>
                          ))}
                          {todo.timeLogs.length > 3 && (
                            <div className="text-gray-500 text-xs">
                              +{todo.timeLogs.length - 3} more entries
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">No time logged yet</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                      <div className="space-y-1 text-gray-600">
                        <div>Created: {formatDate(todo.createdAt)}</div>
                        <div>Updated: {formatDate(todo.updatedAt)}</div>
                        {todo.recurringPattern && (
                          <div>Next due: {formatDate(todo.recurringPattern.nextDueDate)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages} ({totalCount} total todos)
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 