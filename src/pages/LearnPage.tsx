import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ExternalLink, Play, BookOpen, Code, Zap, Palette, Database, Globe } from 'lucide-react';
import lovableLogo from '@/images/logoblack.svg';
import boltLogo from '@/images/Bolt Logo.svg';
import windsurfLogo from '@/images/windsurf Logo.png';
import cursorLogo from '@/images/Cursor.jfif';
import replitLogo from '@/images/Replit Logo.png';
import githubCopilotLogo from '@/images/Github Copilot Logo.webp';
import claudeCodeLogo from '@/images/Claude Code Logo.webp';
import geminiLogo from '@/images/Gemini Logo.png';

interface Platform {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  features: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Visual Builder' | 'AI-Powered' | 'Database' | 'Web Development';
  tutorials: Tutorial[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  url: string;
}

const platforms: Platform[] = [
  {
    id: 'lovable',
    name: 'Lovable',
    description: 'Lovable is a visual development platform that allows you to build web applications using a drag-and-drop interface. Perfect for creating beautiful, responsive websites and web apps without writing code.',
    logo: lovableLogo,
    website: 'https://lovable.dev',
    features: ['Visual Builder', 'Drag & Drop', 'Responsive Design', 'Real-time Preview'],
    difficulty: 'Beginner',
    category: 'Visual Builder',
    tutorials: [
      {
        id: 'lovable-1',
        title: 'Getting Started with Lovable',
        description: 'Learn the basics of Lovable and create your first web application',
        duration: '15 min',
        difficulty: 'Beginner',
        url: 'https://lovable.dev/docs/getting-started'
      },
      {
        id: 'lovable-2',
        title: 'Building Responsive Layouts',
        description: 'Master responsive design principles in Lovable',
        duration: '25 min',
        difficulty: 'Intermediate',
        url: 'https://lovable.dev/docs/responsive-design'
      },
      {
        id: 'lovable-3',
        title: 'Advanced Components',
        description: 'Explore advanced components and custom styling',
        duration: '35 min',
        difficulty: 'Advanced',
        url: 'https://lovable.dev/docs/advanced-components'
      }
    ]
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    description: 'Windsurf is an AI-powered no-code platform that helps you build applications using natural language. Simply describe what you want to build, and Windsurf creates it for you.',
    logo: windsurfLogo,
    website: 'https://windsurf.dev',
    features: ['AI-Powered', 'Natural Language', 'Auto-Generation', 'Smart Suggestions'],
    difficulty: 'Beginner',
    category: 'AI-Powered',
    tutorials: [
      {
        id: 'windsurf-1',
        title: 'AI-Powered Development',
        description: 'Learn how to use natural language to build applications',
        duration: '10 min',
        difficulty: 'Beginner',
        url: 'https://windsurf.dev/docs/ai-development'
      },
      {
        id: 'windsurf-2',
        title: 'Optimizing AI Prompts',
        description: 'Master the art of writing effective prompts for better results',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://windsurf.dev/docs/optimizing-prompts'
      },
      {
        id: 'windsurf-3',
        title: 'Custom AI Workflows',
        description: 'Create custom AI workflows and automation',
        duration: '30 min',
        difficulty: 'Advanced',
        url: 'https://windsurf.dev/docs/custom-workflows'
      }
    ]
  },
  {
    id: 'replit',
    name: 'Replit',
    description: 'Replit is a powerful online IDE that allows you to write, run, and share code with others. It\'s perfect for beginners and experienced developers alike, offering a seamless development experience.',
    logo: replitLogo,
    website: 'https://replit.com',
    features: ['Online IDE', 'Real-time Collaboration', 'Version Control', 'Community'],
    difficulty: 'Beginner',
    category: 'Web Development',
    tutorials: [
      {
        id: 'replit-1',
        title: 'Getting Started with Replit',
        description: 'Learn how to create your first Replit project and navigate the interface',
        duration: '10 min',
        difficulty: 'Beginner',
        url: 'https://replit.com/learn'
      },
      {
        id: 'replit-2',
        title: 'Collaborating on Projects',
        description: 'Practice real-time collaboration with your team',
        duration: '15 min',
        difficulty: 'Intermediate',
        url: 'https://replit.com/learn/collaboration'
      },
      {
        id: 'replit-3',
        title: 'Advanced Features',
        description: 'Explore advanced features like version control and community',
        duration: '20 min',
        difficulty: 'Advanced',
        url: 'https://replit.com/learn/advanced'
      }
    ]
  },
  {
    id: 'bolt',
    name: 'Bolt',
    description: 'Bolt is a powerful no-code platform focused on building database-driven applications. Create complex business applications with ease using its intuitive interface and robust data management tools.',
    logo: boltLogo,
    website: 'https://bolt.com',
    features: ['Database Management', 'Business Logic', 'API Integration', 'User Management'],
    difficulty: 'Intermediate',
    category: 'Database',
    tutorials: [
      {
        id: 'bolt-1',
        title: 'Database Design Fundamentals',
        description: 'Learn how to design and structure your database in Bolt',
        duration: '20 min',
        difficulty: 'Beginner',
        url: 'https://bolt.com/docs/database-design'
      },
      {
        id: 'bolt-2',
        title: 'Building Business Logic',
        description: 'Create complex workflows and business rules',
        duration: '30 min',
        difficulty: 'Intermediate',
        url: 'https://bolt.com/docs/business-logic'
      },
      {
        id: 'bolt-3',
        title: 'API Integration',
        description: 'Connect your Bolt app with external services',
        duration: '40 min',
        difficulty: 'Advanced',
        url: 'https://bolt.com/docs/api-integration'
      }
    ]
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'GitHub Copilot is an AI pair programmer that helps you write code faster and more accurately. It integrates with your existing workflow and provides intelligent suggestions.',
    logo: githubCopilotLogo,
    website: 'https://github.com/features/copilot',
    features: ['AI Pair Programming', 'Intelligent Suggestions', 'Code Generation', 'Integration'],
    difficulty: 'Intermediate',
    category: 'Web Development',
    tutorials: [
      {
        id: 'github-copilot-1',
        title: 'Introduction to GitHub Copilot',
        description: 'Learn how to get started with GitHub Copilot and its features',
        duration: '10 min',
        difficulty: 'Beginner',
        url: 'https://docs.github.com/en/copilot/overview'
      },
      {
        id: 'github-copilot-2',
        title: 'Using Copilot for Development',
        description: 'Practice using GitHub Copilot for your daily development tasks',
        duration: '15 min',
        difficulty: 'Intermediate',
        url: 'https://docs.github.com/en/copilot/overview'
      },
      {
        id: 'github-copilot-3',
        title: 'Advanced Copilot Features',
        description: 'Explore advanced features and customizations',
        duration: '20 min',
        difficulty: 'Advanced',
        url: 'https://docs.github.com/en/copilot/overview'
      }
    ]
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'Cursor is an AI-first code editor that helps you write, edit, and debug code faster. While not strictly no-code, it makes coding accessible to everyone with AI assistance.',
    logo: cursorLogo,
    website: 'https://cursor.sh',
    features: ['AI Code Assistant', 'Code Generation', 'Debugging', 'Multi-language Support'],
    difficulty: 'Advanced',
    category: 'Web Development',
    tutorials: [
      {
        id: 'cursor-1',
        title: 'Introduction to Cursor',
        description: 'Get started with Cursor and its AI features',
        duration: '15 min',
        difficulty: 'Beginner',
        url: 'https://cursor.sh/docs/getting-started'
      },
      {
        id: 'cursor-2',
        title: 'AI Code Generation',
        description: 'Learn how to generate code using AI prompts',
        duration: '25 min',
        difficulty: 'Intermediate',
        url: 'https://cursor.sh/docs/ai-generation'
      },
      {
        id: 'cursor-3',
        title: 'Advanced AI Features',
        description: 'Explore advanced AI features and customizations',
        duration: '35 min',
        difficulty: 'Advanced',
        url: 'https://cursor.sh/docs/advanced-features'
      }
    ]
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Claude Code is an AI-powered code assistant that helps you write, debug, and optimize code. It\'s designed to be your personal assistant for all your coding needs.',
    logo: claudeCodeLogo,
    website: 'https://claude.com/code',
    features: ['AI Code Assistant', 'Code Generation', 'Debugging', 'Multi-language Support'],
    difficulty: 'Advanced',
    category: 'Web Development',
    tutorials: [
      {
        id: 'claude-code-1',
        title: 'Introduction to Claude Code',
        description: 'Get started with Claude Code and its AI features',
        duration: '10 min',
        difficulty: 'Beginner',
        url: 'https://docs.claude.com/code/getting-started'
      },
      {
        id: 'claude-code-2',
        title: 'AI Code Generation',
        description: 'Learn how to generate code using Claude Code',
        duration: '15 min',
        difficulty: 'Intermediate',
        url: 'https://docs.claude.com/code/ai-generation'
      },
      {
        id: 'claude-code-3',
        title: 'Advanced Claude Code Features',
        description: 'Explore advanced AI features and customizations',
        duration: '20 min',
        difficulty: 'Advanced',
        url: 'https://docs.claude.com/code/advanced-features'
      }
    ]
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    description: 'Gemini CLI is an open-source AI agent that brings the power of Gemini directly into your terminal. It can query and edit large codebases, generate apps from PDFs or sketches, and automate operational tasks.',
    logo: geminiLogo,
    website: 'https://github.com/google-gemini/gemini-cli',
    features: ['Terminal AI Agent', 'Code Analysis', 'Multimodal Generation', 'Tool Integration'],
    difficulty: 'Advanced',
    category: 'Web Development',
    tutorials: [
      {
        id: 'gemini-cli-1',
        title: 'Getting Started with Gemini CLI',
        description: 'Install and configure Gemini CLI for your development workflow',
        duration: '15 min',
        difficulty: 'Beginner',
        url: 'https://cloud.google.com/gemini/docs/codeassist/gemini-cli'
      },
      {
        id: 'gemini-cli-2',
        title: 'Exploring Codebases',
        description: 'Learn how to analyze and understand large codebases with Gemini CLI',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://cloud.google.com/gemini/docs/codeassist/gemini-cli'
      },
      {
        id: 'gemini-cli-3',
        title: 'Advanced Automation',
        description: 'Automate complex workflows and integrate with external tools',
        duration: '25 min',
        difficulty: 'Advanced',
        url: 'https://cloud.google.com/gemini/docs/codeassist/gemini-cli'
      }
    ]
  }
];

export function LearnPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('lovable');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Visual Builder': return <Palette className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'AI-Powered': return <Zap className="w-4 h-4" />;
      case 'Web Development': return <Code className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎓 No-Code Platform Learning</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the best no-code platforms and learn how to build amazing applications without writing a single line of code.
          </p>
        </div>

        {/* Platform Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
          {platforms.map((platform) => (
            <Card 
              key={platform.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPlatform === platform.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedPlatform(platform.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-full h-16 mb-4 flex items-center justify-center p-2">
                  <img 
                    src={platform.logo} 
                    alt={platform.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">{platform.name}</h3>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {getCategoryIcon(platform.category)}
                  <Badge className={getDifficultyColor(platform.difficulty)}>
                    {platform.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {platform.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Platform Information */}
        <div className="space-y-6">
          {platforms.map((platform) => (
            <div key={platform.id} className={`space-y-6 ${selectedPlatform === platform.id ? 'block' : 'hidden'}`}>
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-12 p-1">
                      <img 
                        src={platform.logo} 
                        alt={platform.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{platform.name}</CardTitle>
                      <CardDescription className="text-base">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {platform.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="justify-center">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Platform Info */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Category: {platform.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Difficulty: {platform.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{platform.tutorials.length} Tutorials</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <a href={platform.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit {platform.name}
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <a href={
                        platform.id === 'windsurf' ? 'https://docs.windsurf.com/windsurf/getting-started' :
                        platform.id === 'bolt' ? 'https://support.bolt.new/' :
                        platform.id === 'lovable' ? 'https://docs.lovable.dev/introduction/welcome' :
                        platform.id === 'replit' ? 'https://docs.replit.com/' :
                        platform.id === 'github-copilot' ? 'https://docs.github.com/en/copilot' :
                        platform.id === 'claude-code' ? 'https://docs.anthropic.com/claude' :
                        platform.id === 'gemini-cli' ? 'https://cloud.google.com/gemini/docs/codeassist/gemini-cli' :
                        `${platform.website}/docs`
                      } target="_blank" rel="noopener noreferrer">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tutorials Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>Learning Path</span>
                  </CardTitle>
                  <CardDescription>
                    Follow these tutorials to master {platform.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platform.tutorials.map((tutorial) => (
                      <div key={tutorial.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{tutorial.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{tutorial.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className={getDifficultyColor(tutorial.difficulty)}>
                              {tutorial.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">{tutorial.duration}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={tutorial.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Start
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Getting Started Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Getting Started Guide</span>
            </CardTitle>
            <CardDescription>
              New to no-code development? Follow this step-by-step guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose Your Platform</h3>
                <p className="text-sm text-gray-600">
                  Start with Lovable for visual building or Windsurf for AI-powered development
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Follow Tutorials</h3>
                <p className="text-sm text-gray-600">
                  Complete the beginner tutorials to understand the platform basics
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Build & Practice</h3>
                <p className="text-sm text-gray-600">
                  Create your first project and practice with our challenges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 