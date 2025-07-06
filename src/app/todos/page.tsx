'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import TodoList from '@/components/todos/TodoList'
import TodoModal from '@/components/todos/TodoModal'
import TodoFilters from '@/components/todos/TodoFilters'

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

interface TodoFilters {
  status?: string
  priority?: string
  assignedTo?: string
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TodoFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchTodos = async (page = 1, filterParams: TodoFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filterParams
      })

      const response = await fetch(`/api/todos?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch todos')
      }

      const data = await response.json()
      setTodos(data.todos)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)
      setCurrentPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos(1, filters)
  }, [filters])

  const handleCreateTodo = async (todoData: any) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create todo')
      }

      setShowCreateModal(false)
      fetchTodos(currentPage, filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
    }
  }

  const handleUpdateTodo = async (todoId: string, todoData: any) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update todo')
      }

      setEditingTodo(null)
      fetchTodos(currentPage, filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return
    }

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to delete todo')
      }

      fetchTodos(currentPage, filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
    }
  }

  const handleStatusToggle = async (todoId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update todo status')
      }

      fetchTodos(currentPage, filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo status')
    }
  }

  const handleFilterChange = (newFilters: TodoFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchTodos(page, filters)
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => fetchTodos(1, filters)}
                    className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Todos</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your tasks and track your progress
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Todo
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search todos..."
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filters
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4">
                  <TodoFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              )}

              <div className="mt-6">
                <TodoList
                  todos={todos}
                  loading={loading}
                  onEdit={setEditingTodo}
                  onDelete={handleDeleteTodo}
                  onStatusToggle={handleStatusToggle}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Create Todo Modal */}
        {showCreateModal && (
          <TodoModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateTodo}
            title="Create New Todo"
          />
        )}

        {/* Edit Todo Modal */}
        {editingTodo && (
          <TodoModal
            isOpen={!!editingTodo}
            onClose={() => setEditingTodo(null)}
            onSubmit={(data) => handleUpdateTodo(editingTodo.id, data)}
            todo={editingTodo}
            title="Edit Todo"
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
} 