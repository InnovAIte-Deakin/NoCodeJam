import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PricingPill from '@/components/PricingPill';
import { platformPricing } from '@/data/platformPricing';

import { ExternalLink, Play, BookOpen, Code, Zap, Palette, Database, Globe, Sparkles } from 'lucide-react';
import lovableLogo from '@/images/logoblack.svg';
import boltLogo from '@/images/Bolt Logo.svg';
import windsurfLogo from '@/images/windsurf Logo.png';
import cursorLogo from '@/images/Cursor.jfif';
import replitLogo from '@/images/Replit Logo.png';
import githubCopilotLogo from '@/images/Github Copilot Logo.webp';
import claudeCodeLogo from '@/images/Claude Code Logo.webp';
import geminiLogo from '@/images/Gemini Logo.png';
import innovAIteLogo from '@/images/InnovAIte DarkMode Logo.png';
import figmaLogo from '@/images/figma-logo.svg';
import base44Logo from '@/images/base44-logo.png';
import emergentLogo from '@/images/Emergent Logo.jpg';
import grokLogo from '@/images/grok-icon.png';
import v0Logo from '@/images/v0-icon.png';


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
  pricing?: PricingTier[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  url: string;
}

interface PricingTier {
  id: string;
  key: 'free' | 'freemium' | 'paid' | 'enterprise';
  name: string;            // e.g. "Free", "Professional"
  price?: string;          // e.g. "$0", "$12/mo", "Contact Sales"
  billing?: string;        // e.g. "per editor/month"
  features?: string[];     // short bullets shown in details
  ctaUrl?: string;         // link to provider pricing page
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
    id: 'base44',
    name: 'Base44',
    description: 'Base44 is an AI-powered platform that lets you turn any idea into a fully-functional custom app, without the need for any coding experience.',
    logo: base44Logo,
    website: 'https://base44.com/',
    features: ['Prompt-to-App', 'Fullstack Generation', 'All-in-One Infrastructure', 'Instant Deployment'],
    difficulty: 'Beginner',
    category: 'AI-Powered',
    tutorials: [
      {
        id: 'base44-1',
        title: 'Getting Started with Base44',
        description: 'Getting Started with Base44 with Meltics Media',
        duration: '39 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=FN9fyZ9IPWs'
      },
      {
        id: 'base44-2',
        title: 'Building with Base44',
        description: 'Step by Step to building with Base44 by Design with May',
        duration: '26 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=cbFudIg_zWA'
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
  },
  {
    id: 'abacus-ai',
    name: 'Abacus.AI',
    description:
      'Abacus.AI is a full-stack AI platform for teams and enterprises that makes it easy to ingest data, train and fine-tune models, evaluate them, and deploy AI into real-world applications without managing complex infrastructure.',
    logo: 'https://abacus.ai/help/img/abacus_logo.jpg',
    website: 'https://abacus.ai',
    features: [
      'Full-Stack AI Platform',
      'Data Ingestion & Management',
      'Model Training & Fine-Tuning',
      'Evaluation & Monitoring',
      'Production Deployment'
    ],
    difficulty: 'Intermediate',
    category: 'AI-Powered',
    tutorials: [
      {
        id: 'abacus-ai-1',
        title: 'Abacus.AI Platform Overview',
        description: 'Introductory video on using Abacus.AI as a full-stack AI platform for real-world applications.',
        duration: '15 min',
        difficulty: 'Intermediate',
        url: 'https://youtu.be/RSksIo_tDVo?si=uKcMd0bT-j24ambe'
      }
    ]
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'A collaborative interface design tool — learn UI fundamentals, prototyping, design systems, and handoff workflows.',
    logo: figmaLogo,
    website: 'https://www.figma.com',
    features: ['Design Systems', 'Prototyping', 'Collaboration', 'Plugins'],
    difficulty: 'Beginner',
    category: 'Visual Builder',
    tutorials: [
      {
        id: 'figma-basics-2025',
        title: 'Figma: Interface & Frames',
        description: 'Understand the workspace, frames, constraints, and basic layout principles.',
        duration: '15 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=FigmaBasicsExample'
      },
      {
        id: 'figma-components-variants',
        title: 'Components, Variants & Tokens',
        description: 'Create reusable components, use variants and design tokens for consistent systems.',
        duration: '25 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=FigmaComponentsExample'
      },
      {
        id: 'figma-proto-handoff',
        title: 'Prototyping & Handoff',
        description: 'Build interactive prototypes and prepare files for developer handoff.',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=FigmaProtoHandoffExample'
      },
      {
        id: 'figma-plugins-automation',
        title: 'Plugins & Automation for Designers',
        description: 'Use key plugins and automations that speed up design-to-no-code workflows.',
        duration: '18 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=FigmaPluginsExample'
      }
    ]
  },
  {
    id: 'gemini-3',
    name: 'Gemini 3',
    description: 'Gemini 3 is Google’s advanced multimodal AI model designed to understand and generate text, images, and code with improved speed, accuracy, and reasoning capabilities.',
    logo: geminiLogo,
    website: 'https://deepmind.google/models/gemini/',
    features: ['Multimodal Understanding', 'Advanced Reasoning', 'Large Context Window', 'Generative UI'],
    difficulty: 'Intermediate',
    category: 'AI-Powered',
    tutorials: [
      {
        id: 'gemini-3-1',
        title: 'Introduction',
        description: 'Introduction of Gemini 3 along with some use cases',
        duration: '18 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=sXXbySqIguA'
      },
      {
        id: 'gemini-3-2',
        title: 'Crash Course',
        description: 'Video Tutorial by Riley Brown on how to use Gemini 3',
        duration: '25 min',
        difficulty: 'Advanced',
        url: 'https://www.youtube.com/watch?v=dzFUOQUSiEI'
      }
    ]
  },
  {
    id: 'emergent',
    name: 'Emergent',
    description:
      'Emergent is an AI-assisted builder that helps you spin up working app prototypes quickly. This tutorial track links straight to concise YouTube videos so you can learn the workflow fast.',
    logo: emergentLogo,
    website: '#',
    features: ['AI-Assisted', 'Rapid Prototyping', 'Web App Scaffolding', 'Iteration Friendly'],
    difficulty: 'Beginner',
    category: 'AI-Powered',
    tutorials: [
      {
        id: 'emergent-1',
        title: 'Emergent AI Walkthrough',
        description: 'A quick tour of Emergent and what you can build with it.',
        duration: '15 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=ZplFP8Mo7_M'
      },
      {
        id: 'emergent-2',
        title: 'Build a full app with Emergent AI',
        description: 'Create a simple app from scratch and deploy it.',
        duration: '13 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=atnYF5wll74'
      },
      {
        id: 'emergent-3',
        title: 'Building a SaaS with No Coding Knowledge',
        description: 'Build an AI Sitcom Generator.',
        duration: '32 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=ZZZZZZZZZZZ'
      }
    ]
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'Grok is an AI-powered chatbot developed by xAI that provides real-time, context-aware responses with access to current information. It offers advanced reasoning capabilities and can assist with coding, problem-solving, and creative tasks.',
    logo: grokLogo,
    website: 'https://grok.com',
    features: ['AI Chatbot', 'Real-time Data', 'Code Generation', 'Advanced Reasoning'],
    difficulty: 'Beginner',
    category: 'AI-Powered',
    tutorials: [
      {
        id: 'grok-1',
        title: 'Getting Started with Grok',
        description: 'Learn the basics of using Grok AI chatbot and its key features',
        duration: '15 min',
        difficulty: 'Beginner',
        url: 'https://docs.x.ai/docs/overview'
      },
      {
        id: 'grok-2',
        title: 'Building App With Grok',
        description: 'How to use Grok for building apps by Alex Finn',
        duration: '13 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=vipfb9FnKtg'
      }
    ]
  },
  {
    id: 'v0',
    name: 'v0',
    description: 'v0 is Vercel’s AI-powered development platform that turns natural-language prompts into production-ready web apps and UI, generating React code styled with Tailwind',
    logo: v0Logo,
    website: 'https://v0.app',
    features: ['AI UI Generation', 'React Components', 'Tailwind CSS', 'Instant Prototyping'],
    difficulty: 'Beginner',
    category: 'AI-Powered',
    tutorials: [
      {
        id: 'v0-1',
        title: 'Introduction to v0',
        description: 'Introduction to v0 through the documents and guides',
        duration: '15 min',
        difficulty: 'Beginner',
        url: 'https://v0.dev/docs'
      },
      {
        id: 'v0-2',
        title: 'Building Fullstack with v0',
        description: 'Create complex React components and interfaces using v0',
        duration: '7 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=cyFVtaLy-bA'
      }
    ]
  }

];
// Attach pricing arrays from platformPricing to the platforms by id.
// Using @ts-ignore to avoid duplicate type-name issues if any.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
platforms.forEach((p) => {
  // use the platform id to lookup pricing; default to [] if missing
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  p.pricing = platformPricing[p.id] ?? [];
});

export function LearnPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('lovable');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const platformRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const filteredPlatforms = useMemo(() => {
    return platforms.filter((platform) => {
      const matchesDifficulty = difficultyFilter === 'all' || platform.difficulty === difficultyFilter;
      const matchesCategory = categoryFilter === 'all' || platform.category === categoryFilter;
      return matchesDifficulty && matchesCategory;
    });
  }, [difficultyFilter, categoryFilter]);

  useEffect(() => {
    if (!filteredPlatforms.some((platform) => platform.id === selectedPlatform)) {
      setSelectedPlatform(filteredPlatforms[0]?.id ?? '');
    }
  }, [filteredPlatforms, selectedPlatform]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎓 Explore No-Code Platforms for Fast Prototyping
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto">
            Discover the best no-code platforms and learn how to build amazing applications without writing a single line of code.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-gray-600 text-gray-200" onClick={() => setShowFilters((prev) => !prev)}>
                {showFilters ? 'Hide Filters' : 'Filter'}
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-200"
                onClick={() => {
                  // TODO: Wire up to Chatbot
                  alert("AI Recommendations coming soon!");
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assist
              </Button>
              {(difficultyFilter !== 'all' || categoryFilter !== 'all') && (
                <Button variant="ghost" className="text-gray-300" onClick={() => { setDifficultyFilter('all'); setCategoryFilter('all'); }}>
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
              <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                Difficulty: {difficultyFilter === 'all' ? 'All' : difficultyFilter}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                Category: {categoryFilter === 'all' ? 'All' : categoryFilter}
              </span>
            </div>
          </div>

          {showFilters && (
            <div className="grid sm:grid-cols-2 gap-4 bg-gray-800 border border-gray-700 p-4 rounded-lg">
              <div className="space-y-2">
                <label htmlFor="difficulty-select" className="block text-sm text-gray-300">Difficulty</label>
                <select
                  id="difficulty-select"
                  name="difficulty"
                  title="Difficulty"
                  aria-label="Difficulty"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="category-select" className="block text-sm text-gray-300">Category</label>
                <select
                  id="category-select"
                  name="category"
                  title="Category"
                  aria-label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All</option>
                  <option value="Visual Builder">Visual Builder</option>
                  <option value="AI-Powered">AI-Powered</option>
                  <option value="Database">Database</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Platform Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
          {filteredPlatforms.map((platform) => (
            <Card
              key={platform.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-gray-800 border-gray-700 ${selectedPlatform === platform.id ? 'ring-2 ring-purple-500' : ''
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
                <h3 className="font-semibold text-lg mb-2 text-white">{platform.name}</h3>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {getCategoryIcon(platform.category)}
                  <Badge className={getDifficultyColor(platform.difficulty)}>
                    {platform.difficulty}
                  </Badge>
                </div>
                <div className="mt-3">
                  <PricingPill pricing={platform.pricing} />
                </div>
                <p className="text-sm text-gray-300 line-clamp-3 pt-3">
                  {platform.description}
                </p>
              </CardContent>
            </Card>
          ))}
          {filteredPlatforms.length === 0 && (
            <div className="col-span-full text-center text-gray-300 border border-dashed border-gray-600 rounded-lg p-6">
              No platforms match the selected filters.
            </div>
          )}
        </div>

        {/* Detailed Platform Information */}
        <div className="space-y-6">
          {filteredPlatforms.map((platform) => (
            <div
              key={platform.id}
              className={`space-y-6 ${selectedPlatform === platform.id ? 'block' : 'hidden'}`}
            >
              <Card className="bg-gray-800 border-gray-700">
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
                      <CardTitle className="text-2xl text-white">{platform.name}</CardTitle>
                      <CardDescription className="text-base text-gray-300">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-white">Key Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {platform.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="justify-center bg-gray-700 text-gray-200">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Platform Info */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Category: {platform.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Difficulty: {platform.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{platform.tutorials.length} Tutorials</span>
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
                                      platform.id === 'figma' ? 'https://help.figma.com/hc/en-us' :
                                        platform.id === 'gemini-3' ? 'https://ai.google.dev/gemini-api/docs/gemini-3' :
                                          platform.id === 'base44' ? 'https://docs.base44.com/' :
                                            platform.id === 'emergent' ? 'https://emergent.dev/docs' :
                                              platform.id === 'grok' ? 'https://docs.x.ai/docs/overview' :
                                                platform.id === 'v0' ? 'https://v0.app/docs/introduction' :
                                                  platform.id === 'abacus-ai' ? 'https://abacus.ai/help' :
                                                    `${platform.website}/docs`
                      } target="_blank" rel="noopener noreferrer">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  </div>
                  <div className="sm:mr-4 mb-3 sm:mb-0">
                    <PricingPill pricing={platform.pricing} />
                  </div>
                </CardContent>
              </Card>

              {/* Tutorials Section */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Play className="w-5 h-5" />
                    <span>Learning Path</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Follow these tutorials to master {platform.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platform.tutorials.map((tutorial) => (
                      <div key={tutorial.id} className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{tutorial.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{tutorial.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className={getDifficultyColor(tutorial.difficulty)}>
                              {tutorial.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-400">{tutorial.duration}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="border-gray-600 text-gray-300 hover:bg-gray-700">
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
        <Card className="mt-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Zap className="w-5 h-5" />
              <span>Getting Started Guide</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              New to no-code development? Follow this step-by-step guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Choose Your Platform</h3>
                <p className="text-sm text-gray-300">
                  Start with Lovable for visual building or Windsurf for AI-powered development
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Follow Tutorials</h3>
                <p className="text-sm text-gray-300">
                  Complete the beginner tutorials to understand the platform basics
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Build & Practice</h3>
                <p className="text-sm text-gray-300">
                  Create your first project and practice with our challenges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* InnovAIte Section */}
        <Card className="mt-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl text-white">
              <img src={innovAIteLogo} alt="InnovAIte Logo" className="w-8 h-8" />
              <span>About InnovAIte</span>
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Meet the team behind NoCodeJam and learn about our mission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-300 mb-4">
                <strong>InnovAIte</strong> is focused on testing and validating two key programs that will make up SPARK when it launches in 2026 - the AI Generalist Program and the AI Prototyping Lab.
              </p>

              <p className="text-gray-300 mb-4">
                Our mission is to understand how AI tools and platforms can dramatically compress startup development cycles from months to days, making entrepreneurship more accessible to everyone regardless of technical background.
              </p>

              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 mb-4">
                <h4 className="font-semibold text-purple-400 mb-2">Our Structure</h4>
                <p className="text-gray-300 mb-3">
                  At InnovAIte, we operate with a collaborative structure that encourages team leadership and contributions. While Jesse McMeikan serves as our Product Owner, Dr Leon Yang as the Acting Academic Company Director, and Scott West as our Industry Mentor, we focus on contributions made by students to our validation projects.
                </p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 mb-4">
                <h4 className="font-semibold text-blue-400 mb-2">Our Operations: "The Three C's"</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-white">Code</h5>
                    <p className="text-gray-300 text-sm">
                      We use GitLab as our code repository with Code Integration Leads who help manage AI coding tools, establish best practices, and manage the handoff between AI-generated code and human refinement.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-white">Communication</h5>
                    <p className="text-gray-300 text-sm">
                      We use MS Teams for direct communication with students and for updates about events, managed by Comms Leads who also make Company-wide OnTrack submissions.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-white">Coordination</h5>
                    <p className="text-gray-300 text-sm">
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

            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-green-400 mb-2">Get Involved</h4>
              <p className="text-gray-300 mb-3">
                Deakin students can access our GitLab repository and contribute to our validation projects. Look for the SSO sign-in button.
              </p>
              <Button
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
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
