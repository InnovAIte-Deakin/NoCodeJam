import { useState, useRef } from 'react';
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
import innovAIteLogo from '@/images/InnovAIte DarkMode Logo.png';

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
        url: 'https://docs.lovable.dev/introduction/getting-started'
      },
      {
        id: 'lovable-2',
        title: 'Mastering Lovable',
        description: 'Video Tutorial by Darrel Wilson on Lovable',
        duration: '20 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=mOak_imYmqU'
      },
      {
        id: 'lovable-3',
        title: 'Deep Dive',
        description: 'Video Tutorial deep dive into Lovable',
        duration: '15 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=N8JWiuVLi9E&t'
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
        title: 'Windsurf Basics',
        description: 'Video Tutorial by Tech With Tim on Windsurf',
        duration: '20 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=8TcWGk1DJVs'
      },
      {
        id: 'windsurf-2',
        title: 'Deep Dive',
        description: 'Video Tutorial deep dive into Windsurf',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=qVuWRQh4Buo&t'
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
        url: 'https://www.youtube.com/watch?v=St95nPOwsa8'
      },
      {
        id: 'replit-2',
        title: 'Deep Dive',
        description: 'Video Tutorial deep dive into Replit',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=KH63ojH6tQI&t'
      },
      {
        id: 'replit-3',
        title: 'Replit AI Agent',
        description: 'Video Tutorial full Replit course',
        duration: '2 hours',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=DaXQ5L7r7Lg'
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
        title: 'Bolt Basics',
        description: 'Video Tutorial by No Code MBA on building apps with Bolt',
        duration: '30 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=0_Ij8FEvY4U'
      },
      {
        id: 'bolt-2',
        title: 'Deep Dive',
        description: 'Video Tutorial deep dive into Bolt',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=JMBqw2SkuRw&t'
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
        title: 'Getting Started With GitHub Copilot',
        description: 'Video Tutorial learn how to get started with GitHub Copilot and its features',
        duration: '10 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=n0NlxUyA7FI '
      },
      {
        id: 'github-copilot-2',
        title: 'Essential Features',
        description: 'Video Tutorial essential features of GitHub Copilot',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=b5xcWdzAB5c'
      },
      {
        id: 'github-copilot-3',
        title: 'Building a Web App',
        description: 'Video Tutorial building a web app with GitHub Copilot',
        duration: '20 min',
        difficulty: 'Advanced',
        url: 'https://www.youtube.com/watch?v=Nw4y5XQyugc&list=PL0lo9MOBetEFcp4SCWinBdpml9B2U25-f&index=3'
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
        title: 'Installation',
        description: 'Get Cursor installed on your computer in just a few minutes',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://docs.cursor.com/en/get-started/installation'
      },
      {
        id: 'cursor-2',
        title: 'Introduction to Cursor',
        description: 'Video Tutorial by Volo Builds on Cursor basics',
        duration: '30 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=3289vhOUdKA'
      },
      {
        id: 'cursor-3',
        title: 'Advanced Cursor Rules',
        description: 'Video Tutorial by Neel about how to setup advanced Cursor rules',
        duration: '25 min',
        difficulty: 'Advanced',
        url: 'https://www.youtube.com/watch?v=TrcyAWGC1k4'
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
        title: 'Setup',
        description: 'Guide to setup Claude Code',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://docs.anthropic.com/en/docs/claude-code/setup'
      },
      {
        id: 'claude-code-2',
        title: 'Claude Code Basics',
        description: 'Video Tutorial by Tyler AI on Claude Code basics',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=P_pTypZZL4c'
      },
      {
        id: 'claude-code-3',
        title: 'Build a Full Stack Web App',
        description: 'Video Tutorial by Rob Shocks on how to build a full stack web app with Claude Code',
        duration: '30 min',
        difficulty: 'Advanced',
        url: 'https://www.youtube.com/watch?v=cYIxhL6pxL4'
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
        title: 'Installation',
        description: 'Video Tutorial on installing and configuring Gemini CLI for your development workflow',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=we2HwLyKYEg'
      },
      {
        id: 'gemini-cli-2',
        title: 'Crash Course',
        description: 'Video Tutorial by Sam Witteveen on how to use Gemini CLI',
        duration: '15 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=KUCZe1xBKFM'
      }
    ]
  }
];

export function LearnPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('lovable');
  const platformRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setTimeout(() => {
      const element = platformRefs.current[platformId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

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
    <div className="min-h-screen bg-gray-900">
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
              onClick={() => scrollToPlatform(platform.id)}
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
            <div 
              key={platform.id} 
              className={`space-y-6 ${selectedPlatform === platform.id ? 'block' : 'hidden'}`}
            >
                            <Card>
                <CardHeader ref={(el) => (platformRefs.current[platform.id] = el)}>
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

        {/* InnovAIte Section */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <img src={innovAIteLogo} alt="InnovAIte Logo" className="w-8 h-8" />
              <span>About InnovAIte</span>
            </CardTitle>
            <CardDescription className="text-lg">
              Meet the team behind NoCodeJam and learn about our mission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                <strong>InnovAIte</strong> is focused on testing and validating two key programs that will make up SPARK when it launches in 2026 - the AI Generalist Program and the AI Prototyping Lab.
              </p>
              
              <p className="text-gray-700 mb-4">
                Our mission is to understand how AI tools and platforms can dramatically compress startup development cycles from months to days, making entrepreneurship more accessible to everyone regardless of technical background.
              </p>

              <div className="bg-white p-4 rounded-lg border border-purple-200 mb-4">
                <h4 className="font-semibold text-purple-800 mb-2">Our Structure</h4>
                <p className="text-gray-700 mb-3">
                  At InnovAIte, we operate with a collaborative structure that encourages team leadership and contributions. While Jesse McMeikan serves as our Product Owner, Dr Leon Yang as the Acting Academic Company Director, and Scott West as our Industry Mentor, we focus on contributions made by students to our validation projects.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Our Operations: "The Three C's"</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-white">Code</h5>
                    <p className="text-gray-700 text-sm">
                      We use GitLab as our code repository with Code Integration Leads who help manage AI coding tools, establish best practices, and manage the handoff between AI-generated code and human refinement.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-white">Communication</h5>
                    <p className="text-gray-700 text-sm">
                      We use MS Teams for direct communication with students and for updates about events, managed by Comms Leads who also make Company-wide OnTrack submissions.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-white">Coordination</h5>
                    <p className="text-gray-700 text-sm">
                      We use Microsoft Planner as our main source of truth for all activities. Sprint Leads manage the challenge of adapting traditional agile frameworks to AI-accelerated development cycles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Company Handover Video
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Watch our Trimester 1 handover presentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary" 
                    className="bg-white text-purple-600 hover:bg-gray-100"
                    onClick={() => window.open('https://www.youtube.com/watch?v=WPt6f4-sM4s', '_blank')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    YouTube Channel
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Subscribe to our channel for the latest tutorials and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary" 
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    onClick={() => window.open('https://www.youtube.com/@innovAIteDeakin', '_blank')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Visit Channel
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Get Involved</h4>
              <p className="text-gray-700 mb-3">
                Deakin students can access our GitLab repository and contribute to our validation projects. Look for the SSO sign-in button.
              </p>
              <Button 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => window.open('https://gitlab.deakin.edu.au/innovaite-lab', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit GitLab Repository
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
