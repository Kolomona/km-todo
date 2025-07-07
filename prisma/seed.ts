import { PrismaClient, ProjectRole, TodoPriority, TodoStatus, RecurringPatternType } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Check if setup is already complete
  const setupConfig = await prisma.systemConfig.findUnique({
    where: { key: 'setup_complete' }
  })

  const userCount = await prisma.user.count()
  const isSetupComplete = userCount > 0 && setupConfig && setupConfig.value === 'true'

  if (!isSetupComplete) {
    console.log('⚠️ Setup is not complete. Skipping sample data creation.')
    console.log('💡 Please run the setup process first using /api/setup/initialize')
    console.log('💡 Then run this seed script to create sample data.')
    return
  }

  // Get the first user (admin) for sample data creation
  const adminUser = await prisma.user.findFirst()
  if (!adminUser) {
    console.log('⚠️ No users found. Please complete setup first.')
    return
  }

  console.log(`✅ Setup complete. Creating sample data for user: ${adminUser.email}`)

  // Check if sample data already exists
  const existingProjects = await prisma.project.count()
  if (existingProjects > 0) {
    console.log('⚠️ Sample data already exists. Skipping creation.')
    console.log('💡 To recreate sample data, clear the database first.')
    return
  }

  // Create sample projects
  console.log('📁 Creating sample projects...')
  
  const personalProject = await prisma.project.create({
    data: {
      name: 'Personal Tasks',
      description: 'Personal projects and daily tasks',
      ownerId: adminUser.id,
    },
  })

  const workProject = await prisma.project.create({
    data: {
      name: 'Work Projects',
      description: 'Professional work and team collaboration',
      ownerId: adminUser.id,
    },
  })

  const teamProject = await prisma.project.create({
    data: {
      name: 'Team Collaboration',
      description: 'Cross-functional team projects and initiatives',
      ownerId: adminUser.id,
    },
  })

  console.log(`✅ Created 3 projects: ${personalProject.name}, ${workProject.name}, ${teamProject.name}`)

  // Add admin as owner to all projects (this happens automatically, but let's be explicit)
  console.log('👥 Setting up project memberships...')
  
  await prisma.projectMember.createMany({
    data: [
      {
        projectId: personalProject.id,
        userId: adminUser.id,
        role: ProjectRole.owner,
        permissions: ['read', 'write', 'delete', 'manage_members'],
      },
      {
        projectId: workProject.id,
        userId: adminUser.id,
        role: ProjectRole.owner,
        permissions: ['read', 'write', 'delete', 'manage_members'],
      },
      {
        projectId: teamProject.id,
        userId: adminUser.id,
        role: ProjectRole.owner,
        permissions: ['read', 'write', 'delete', 'manage_members'],
      },
    ],
  })

  console.log('✅ Project memberships created')

  // Create sample todos
  console.log('📝 Creating sample todos...')
  
  const todos = [
    // Personal project todos
    {
      title: 'Plan weekend activities',
      description: 'Research local events and plan weekend activities for family',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      priority: TodoPriority.medium,
      status: TodoStatus.pending,
      estimatedTime: 60, // 1 hour
      projectId: personalProject.id,
    },
    {
      title: 'Organize home office',
      description: 'Clean desk, organize files, and set up better workspace',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      priority: TodoPriority.low,
      status: TodoStatus.in_progress,
      estimatedTime: 120, // 2 hours
      projectId: personalProject.id,
    },
    {
      title: 'Review monthly budget',
      description: 'Analyze spending patterns and adjust budget categories',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      priority: TodoPriority.high,
      status: TodoStatus.pending,
      estimatedTime: 90, // 1.5 hours
      projectId: personalProject.id,
    },

    // Work project todos
    {
      title: 'Complete quarterly report',
      description: 'Finalize Q4 performance metrics and prepare presentation',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      priority: TodoPriority.urgent,
      status: TodoStatus.in_progress,
      estimatedTime: 240, // 4 hours
      projectId: workProject.id,
    },
    {
      title: 'Schedule team meeting',
      description: 'Coordinate with team members for weekly sync meeting',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      priority: TodoPriority.high,
      status: TodoStatus.completed,
      estimatedTime: 30, // 30 minutes
      projectId: workProject.id,
    },
    {
      title: 'Update project documentation',
      description: 'Review and update technical documentation for current projects',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      priority: TodoPriority.medium,
      status: TodoStatus.pending,
      estimatedTime: 180, // 3 hours
      projectId: workProject.id,
    },

    // Team project todos
    {
      title: 'Prepare sprint planning',
      description: 'Gather requirements and prepare sprint planning session',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      priority: TodoPriority.high,
      status: TodoStatus.pending,
      estimatedTime: 120, // 2 hours
      projectId: teamProject.id,
    },
    {
      title: 'Code review for feature branch',
      description: 'Review pull request for new authentication feature',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      priority: TodoPriority.medium,
      status: TodoStatus.in_progress,
      estimatedTime: 60, // 1 hour
      projectId: teamProject.id,
    },
    {
      title: 'Update deployment pipeline',
      description: 'Optimize CI/CD pipeline for faster deployments',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      priority: TodoPriority.low,
      status: TodoStatus.pending,
      estimatedTime: 300, // 5 hours
      projectId: teamProject.id,
    },
    {
      title: 'Security audit review',
      description: 'Review security audit findings and plan remediation',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      priority: TodoPriority.urgent,
      status: TodoStatus.pending,
      estimatedTime: 150, // 2.5 hours
      projectId: teamProject.id,
    },
  ]

  const createdTodos = []
  for (const todoData of todos) {
    const { projectId, ...todoFields } = todoData
    
    const todo = await prisma.todo.create({
      data: {
        ...todoFields,
        createdBy: adminUser.id,
        assignedTo: adminUser.id,
      },
    })

    // Create todo-project relationship
    await prisma.todoProject.create({
      data: {
        todoId: todo.id,
        projectId: projectId,
      },
    })

    createdTodos.push(todo)
  }

  console.log(`✅ Created ${createdTodos.length} todos across all projects`)

  // Create sample time logs for some todos
  console.log('⏱️ Creating sample time logs...')
  
  const timeLogs = [
    {
      todoId: createdTodos[3].id, // Quarterly report
      timeSpent: 120, // 2 hours
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      notes: 'Started data collection and analysis',
    },
    {
      todoId: createdTodos[4].id, // Schedule team meeting
      timeSpent: 25, // 25 minutes
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notes: 'Sent calendar invites and confirmed attendance',
    },
    {
      todoId: createdTodos[7].id, // Code review
      timeSpent: 45, // 45 minutes
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      notes: 'Reviewed authentication logic and security considerations',
    },
  ]

  for (const timeLogData of timeLogs) {
    await prisma.todoTime.create({
      data: {
        ...timeLogData,
        userId: adminUser.id,
      },
    })
  }

  console.log(`✅ Created ${timeLogs.length} time logs`)

  // Create a recurring todo pattern
  console.log('🔄 Creating recurring todo pattern...')
  
  const recurringTodo = await prisma.todo.create({
    data: {
      title: 'Weekly team standup',
      description: 'Daily standup meeting with development team',
      priority: TodoPriority.medium,
      status: TodoStatus.pending,
      estimatedTime: 15, // 15 minutes
      createdBy: adminUser.id,
      assignedTo: adminUser.id,
    },
  })

  await prisma.todoProject.create({
    data: {
      todoId: recurringTodo.id,
      projectId: teamProject.id,
    },
  })

  await prisma.recurringPattern.create({
    data: {
      todoId: recurringTodo.id,
      patternType: RecurringPatternType.weekly,
      patternData: {
        interval: 1,
        dayOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      },
      nextDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      isActive: true,
    },
  })

  console.log('✅ Created recurring todo pattern')

  // Create sample project messages
  console.log('💬 Creating sample project messages...')
  
  const messages = [
    {
      projectId: workProject.id,
      message: 'Great work on the quarterly report! The metrics look promising. Let\'s discuss the key insights in our next team meeting.',
      todoReferences: [createdTodos[3].id], // Quarterly report
    },
    {
      projectId: teamProject.id,
      message: 'The authentication feature is ready for review. Please check the pull request and provide feedback by EOD.',
      todoReferences: [createdTodos[7].id], // Code review
    },
    {
      projectId: personalProject.id,
      message: 'Don\'t forget to review the monthly budget this week. We need to track our spending patterns.',
      todoReferences: [createdTodos[2].id], // Monthly budget
    },
  ]

  for (const messageData of messages) {
    await prisma.projectMessage.create({
      data: {
        ...messageData,
        userId: adminUser.id,
      },
    })
  }

  console.log(`✅ Created ${messages.length} project messages`)

  console.log('\n🎉 Sample data creation completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`   👤 Using existing user: ${adminUser.email}`)
  console.log(`   📁 Projects: ${personalProject.name}, ${workProject.name}, ${teamProject.name}`)
  console.log(`   📝 Todos: ${createdTodos.length} todos with various priorities and statuses`)
  console.log(`   ⏱️ Time logs: ${timeLogs.length} time tracking entries`)
  console.log(`   🔄 Recurring patterns: 1 weekly recurring todo`)
  console.log(`   💬 Messages: ${messages.length} project messages`)
  console.log('\n🚀 You can now explore the application with sample data!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 