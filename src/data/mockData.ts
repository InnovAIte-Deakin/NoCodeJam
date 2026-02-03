import { Challenge, Submission } from '@/types';

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Build a Todo App',
    description: 'Create a fully functional todo application using any no-code platform. The app should allow users to add, edit, delete, and mark tasks as complete.',
    difficulty: 'Beginner',
    xpReward: 200,
    imageUrl: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800',
    requirements: [
      'User can add new tasks',
      'User can mark tasks as complete',
      'User can delete tasks',
      'Tasks persist between sessions'
    ],
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin'
  },
  {
    id: '2',
    title: 'E-commerce Landing Page',
    description: 'Design and build a modern e-commerce landing page with product showcase, shopping cart functionality, and responsive design.',
    difficulty: 'Intermediate',
    xpReward: 350,
    imageUrl: 'https://images.pexels.com/photos/3584994/pexels-photo-3584994.jpeg?auto=compress&cs=tinysrgb&w=800',
    requirements: [
      'Product grid layout',
      'Shopping cart functionality',
      'Responsive design',
      'Contact form integration'
    ],
    createdAt: new Date('2024-01-05'),
    createdBy: 'admin'
  },
  {
    id: '3',
    title: 'CRM Dashboard',
    description: 'Build a comprehensive CRM dashboard with customer management, analytics, and reporting features using no-code tools.',
    difficulty: 'Expert',
    xpReward: 500,
    imageUrl: 'https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=800',
    requirements: [
      'Customer database management',
      'Analytics dashboard',
      'Export functionality',
      'User authentication',
      'Role-based permissions'
    ],
    createdAt: new Date('2024-01-10'),
    createdBy: 'admin'
  },
  {
    id: '4',
    title: 'Blog Platform',
    description: 'Create a complete blog platform with content management, commenting system, and SEO optimization.',
    difficulty: 'Intermediate',
    xpReward: 300,
    imageUrl: 'https://images.pexels.com/photos/3585047/pexels-photo-3585047.jpeg?auto=compress&cs=tinysrgb&w=800',
    requirements: [
      'Article creation and editing',
      'Comment system',
      'Categories and tags',
      'SEO optimization'
    ],
    createdAt: new Date('2024-01-15'),
    createdBy: 'admin'
  },
  {
    id: '5',
    title: 'Portfolio Website',
    description: 'Create a professional portfolio website showcasing your projects, skills, and experience with modern design principles.',
    difficulty: 'Beginner',
    xpReward: 250,
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    requirements: [
      'About section',
      'Projects showcase',
      'Contact form',
      'Responsive design',
      'Professional styling'
    ],
    createdAt: new Date('2024-01-20'),
    createdBy: 'admin'
  },
  {
    id: '6',
    title: 'Event Management System',
    description: 'Build a comprehensive event management system with registration, ticketing, and attendee management features.',
    difficulty: 'Expert',
    xpReward: 600,
    imageUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
    requirements: [
      'Event creation and management',
      'Registration system',
      'Payment integration',
      'Attendee tracking',
      'Email notifications',
      'Analytics dashboard'
    ],
    createdAt: new Date('2024-01-25'),
    createdBy: 'admin'
  }
];

export const mockSubmissions: Submission[] = [
  {
    id: '1',
    challengeId: '1',
    userId: '1',
    solutionUrl: 'https://example.com/todo-app',
    status: 'approved',
    feedback: 'Great implementation! Clean design and all requirements met.',
    submittedAt: new Date('2024-01-20'),
    reviewedAt: new Date('2024-01-21'),
    reviewedBy: '2'
  },
  {
    id: '2',
    challengeId: '2',
    userId: '1',
    solutionUrl: 'https://example.com/ecommerce-landing',
    status: 'pending',
    submittedAt: new Date('2024-01-25')
  },
  {
    id: '3',
    challengeId: '3',
    userId: '2',
    solutionUrl: 'https://example.com/crm-dashboard',
    status: 'pending',
    submittedAt: new Date('2024-01-28')
  },
  {
    id: '4',
    challengeId: '4',
    userId: '3',
    solutionUrl: 'https://example.com/blog-platform',
    status: 'approved',
    feedback: 'Excellent blog platform with all required features implemented.',
    submittedAt: new Date('2024-01-22'),
    reviewedAt: new Date('2024-01-23'),
    reviewedBy: '1'
  },
  {
    id: '5',
    challengeId: '5',
    userId: '4',
    solutionUrl: 'https://example.com/portfolio-website',
    status: 'pending',
    submittedAt: new Date('2024-01-30')
  }
];

export const mockUsers = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user' as const,
    total_xp: 850
  },
  {
    id: '2',
    username: 'admin_user',
    email: 'admin@example.com',
    role: 'admin' as const,
    total_xp: 1200
  },
  {
    id: '3',
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'user' as const,
    total_xp: 650
  },
  {
    id: '4',
    username: 'mike_wilson',
    email: 'mike@example.com',
    role: 'user' as const,
    total_xp: 450
  },
  {
    id: '5',
    username: 'sarah_jones',
    email: 'sarah@example.com',
    role: 'user' as const,
    total_xp: 300
  }
];