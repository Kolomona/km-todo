'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  UserPlusIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import TodoModal from '@/components/todos/TodoModal';

interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
}

interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: string[];
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime?: number;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectMessage {
  id: string;
  projectId: string;
  userId: string;
  message: string;
  todoReferences: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateTodoData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime?: number;
  assignedTo?: string;
  projectIds: string[];
  recurringPattern?: {
    patternType: 'daily' | 'weekly' | 'monthly' | 'custom';
    patternData: {
      interval?: number;
      dayOfWeek?: number[];
      dayOfMonth?: number[];
      weekOfMonth?: number[];
      customRule?: string;
    };
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'todos' | 'members' | 'messages'>('overview');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  
  // New state for CRUD actions
  const [showEditTodo, setShowEditTodo] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showDeleteTodoConfirm, setShowDeleteTodoConfirm] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [showDeleteMemberConfirm, setShowDeleteMemberConfirm] = useState(false);
  const [showEditMessage, setShowEditMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ProjectMessage | null>(null);
  const [showDeleteMessageConfirm, setShowDeleteMessageConfirm] = useState(false);
  
  // New state for Add Todo modal
  const [showAddTodo, setShowAddTodo] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        if (response.status === 403) {
          throw new Error('You do not have access to this project');
        }
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      setProject(data.project);
      setTodos(data.todos || []);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, fetchProjectData]);

  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      router.push('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // New handlers for CRUD actions
  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowEditTodo(true);
  };

  const handleDeleteTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowDeleteTodoConfirm(true);
  };

  const handleConfirmDeleteTodo = async () => {
    if (!selectedTodo) return;
    
    try {
      const response = await fetch(`/api/todos/${selectedTodo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(todos.filter(t => t.id !== selectedTodo.id));
      setShowDeleteTodoConfirm(false);
      setSelectedTodo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  // New handler for Add Todo
  const handleAddTodo = () => {
    setShowAddTodo(true);
  };

  const handleAddTodoSubmit = async (data: CreateTodoData) => {
    try {
      // Pre-fill the project context
      const todoData = {
        ...data,
        projectIds: [projectId] // Automatically assign to current project
      };

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create todo');
      }

      const result = await response.json();
      
      // Add the new todo to the list
      setTodos(prev => [...prev, result.todo]);
      setShowAddTodo(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  const handleEditMember = (member: ProjectMember) => {
    setSelectedMember(member);
    setShowEditMember(true);
  };

  const handleDeleteMember = (member: ProjectMember) => {
    setSelectedMember(member);
    setShowDeleteMemberConfirm(true);
  };

  const handleConfirmDeleteMember = async () => {
    if (!selectedMember) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${selectedMember.userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      setProject(prev => prev ? {
        ...prev,
        members: prev.members.filter(m => m.id !== selectedMember.id)
      } : null);
      setShowDeleteMemberConfirm(false);
      setSelectedMember(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleEditMessage = (message: ProjectMessage) => {
    setSelectedMessage(message);
    setShowEditMessage(true);
  };

  const handleDeleteMessage = (message: ProjectMessage) => {
    setSelectedMessage(message);
    setShowDeleteMessageConfirm(true);
  };

  const handleConfirmDeleteMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/messages/${selectedMessage.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter(m => m.id !== selectedMessage.id));
      setShowDeleteMessageConfirm(false);
      setSelectedMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">
              Error loading project
            </div>
            <div className="text-gray-600 mb-6">{error}</div>
            <button
              onClick={() => router.push('/projects')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <AuthenticatedLayout title={project.name}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                {project.description && (
                  <p className="mt-2 text-gray-600">{project.description}</p>
                )}
                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span>{project.members.length} members</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
                { id: 'todos', name: 'Todos', icon: DocumentTextIcon },
                { id: 'members', name: 'Members', icon: UsersIcon },
                { id: 'messages', name: 'Messages', icon: ChatBubbleLeftRightIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'todos' | 'members' | 'messages')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Project Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">Total Todos</h3>
                    <p className="text-2xl font-bold text-blue-900">{todos.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">Completed</h3>
                    <p className="text-2xl font-bold text-green-900">
                      {todos.filter(todo => todo.status === 'completed').length}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-800">In Progress</h3>
                    <p className="text-2xl font-bold text-yellow-900">
                      {todos.filter(todo => todo.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'todos' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Todos</h2>
                  <button 
                    onClick={handleAddTodo}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Todo
                  </button>
                </div>
                {todos.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No todos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first todo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todos.map((todo) => (
                      <div key={todo.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{todo.title}</h3>
                            {todo.description && (
                              <p className="mt-1 text-sm text-gray-600">{todo.description}</p>
                            )}
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              {todo.dueDate && (
                                <span>Due: {formatDate(todo.dueDate)}</span>
                              )}
                              {todo.estimatedTime && (
                                <span>Est: {todo.estimatedTime} min</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                              {todo.priority}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                              {todo.status.replace('_', ' ')}
                            </span>
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={() => handleEditTodo(todo)}
                                className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                                title="Edit todo"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTodo(todo)}
                                className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                title="Delete todo"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Add Member
                  </button>
                </div>
                <div className="space-y-4">
                  {project.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">{member.user.name}</h3>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'admin' ? 'bg-red-100 text-red-800' :
                          member.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          Joined {formatDate(member.joinedAt)}
                        </span>
                        {member.role !== 'owner' && (
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                              title="Edit member role"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member)}
                              className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                              title="Remove member"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Project Messages</h2>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start a conversation with your team.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {message.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900">{message.user.name}</h3>
                              <span className="text-sm text-gray-500">{formatDate(message.createdAt)}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{message.message}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEditMessage(message)}
                              className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                              title="Edit message"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message)}
                              className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                              title="Delete message"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Project Modal */}
        {showEditForm && (
          <EditProjectModal
            project={project}
            onClose={() => setShowEditForm(false)}
            onSuccess={(updatedProject) => {
              setProject(updatedProject);
              setShowEditForm(false);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            title="Delete Project"
            message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDeleteProject}
          />
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <AddMemberModal
            projectId={project.id}
            onClose={() => setShowAddMember(false)}
            onSuccess={() => {
              fetchProjectData();
              setShowAddMember(false);
            }}
          />
        )}

        {/* New modals for CRUD actions */}
        {showEditTodo && selectedTodo && (
          <EditTodoModal
            todo={selectedTodo}
            onClose={() => {
              setShowEditTodo(false);
              setSelectedTodo(null);
            }}
            onSuccess={(updatedTodo) => {
              setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
              setShowEditTodo(false);
              setSelectedTodo(null);
            }}
          />
        )}

        {showDeleteTodoConfirm && selectedTodo && (
          <DeleteConfirmModal
            title="Delete Todo"
            message={`Are you sure you want to delete "${selectedTodo.title}"? This action cannot be undone.`}
            onClose={() => {
              setShowDeleteTodoConfirm(false);
              setSelectedTodo(null);
            }}
            onConfirm={handleConfirmDeleteTodo}
          />
        )}

        {showEditMember && selectedMember && (
          <EditMemberModal
            member={selectedMember}
            onClose={() => {
              setShowEditMember(false);
              setSelectedMember(null);
            }}
            onSuccess={(updatedMember) => {
              setProject(prev => prev ? {
                ...prev,
                members: prev.members.map(m => m.id === updatedMember.id ? updatedMember : m)
              } : null);
              setShowEditMember(false);
              setSelectedMember(null);
            }}
          />
        )}

        {showDeleteMemberConfirm && selectedMember && (
          <DeleteConfirmModal
            title="Remove Member"
            message={`Are you sure you want to remove ${selectedMember.user.name} from this project?`}
            onClose={() => {
              setShowDeleteMemberConfirm(false);
              setSelectedMember(null);
            }}
            onConfirm={handleConfirmDeleteMember}
          />
        )}

        {showEditMessage && selectedMessage && (
          <EditMessageModal
            message={selectedMessage}
            onClose={() => {
              setShowEditMessage(false);
              setSelectedMessage(null);
            }}
            onSuccess={(updatedMessage) => {
              setMessages(messages.map(m => m.id === updatedMessage.id ? updatedMessage : m));
              setShowEditMessage(false);
              setSelectedMessage(null);
            }}
          />
        )}

        {showDeleteMessageConfirm && selectedMessage && (
          <DeleteConfirmModal
            title="Delete Message"
            message="Are you sure you want to delete this message? This action cannot be undone."
            onClose={() => {
              setShowDeleteMessageConfirm(false);
              setSelectedMessage(null);
            }}
            onConfirm={handleConfirmDeleteMessage}
          />
        )}

        {/* Add Todo Modal */}
        {showAddTodo && (
          <TodoModal
            isOpen={showAddTodo}
            onClose={() => setShowAddTodo(false)}
            onSubmit={handleAddTodoSubmit}
            todo={null}
            title="Add New Todo"
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}

// Edit Project Modal Component
interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update project');
      }

      const data = await response.json();
      onSuccess(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Project</h3>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter project name"
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter project description (optional)"
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({ title, message, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Member Modal Component
interface AddMemberModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddMemberModal({ projectId, onClose, onSuccess }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to add member');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter email address"
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// New modal components for CRUD actions
interface EditTodoModalProps {
  todo: Todo;
  onClose: () => void;
  onSuccess: (todo: Todo) => void;
}

function EditTodoModal({ todo, onClose, onSuccess }: EditTodoModalProps) {
  const [formData, setFormData] = useState({
    title: todo.title,
    description: todo.description || '',
    dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
    priority: todo.priority,
    status: todo.status,
    estimatedTime: todo.estimatedTime?.toString() || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Todo title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          dueDate: formData.dueDate || undefined,
          priority: formData.priority,
          status: formData.status,
          estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update todo');
      }

      const data = await response.json();
      onSuccess(data.todo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Todo</h3>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter todo title"
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter description (optional)"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                id="estimatedTime"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter estimated time"
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Todo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface EditMemberModalProps {
  member: ProjectMember;
  onClose: () => void;
  onSuccess: (member: ProjectMember) => void;
}

function EditMemberModal({ member, onClose, onSuccess }: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    role: member.role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${member.projectId}/members/${member.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: formData.role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update member role');
      }

      const data = await response.json();
      onSuccess(data.member);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Member Role</h3>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member
              </label>
              <p className="text-sm text-gray-900">{member.user.name} ({member.user.email})</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface EditMessageModalProps {
  message: ProjectMessage;
  onClose: () => void;
  onSuccess: (message: ProjectMessage) => void;
}

function EditMessageModal({ message, onClose, onSuccess }: EditMessageModalProps) {
  const [formData, setFormData] = useState({
    message: message.message
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setError('Message content is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${message.projectId}/messages/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: formData.message.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update message');
      }

      const data = await response.json();
      onSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Message</h3>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your message"
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 