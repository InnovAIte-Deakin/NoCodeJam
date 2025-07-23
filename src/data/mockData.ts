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
  }
];