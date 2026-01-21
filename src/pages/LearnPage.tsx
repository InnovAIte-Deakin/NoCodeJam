// src/pages/LearnPage.tsx
import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import PricingPill from '@/components/PricingPill';
import { platformPricing } from '@/data/platformPricing';

import { ExternalLink, BookOpen, Code, Zap, Palette, Database, Globe } from 'lucide-react';

// ✅ Logos (make sure these exist in /src/images)
import lovableLogo from '@/images/logoblack.svg';
import boltLogo from '@/images/Bolt Logo.svg';
import windsurfLogo from '@/images/windsurf Logo.png';
import cursorLogo from '@/images/Cursor.jfif';
import replitLogo from '@/images/Replit Logo.png';
import githubCopilotLogo from '@/images/Github Copilot Logo.webp';
import claudeCodeLogo from '@/images/Claude Code Logo.webp';
import geminiLogo from '@/images/Gemini Logo.png';
import figmaLogo from '@/images/figma-logo.svg';
import base44Logo from '@/images/base44-logo.png';
import emergentLogo from '@/images/Emergent Logo.jpg';
import grokLogo from '@/images/grok-icon.png';
import v0Logo from '@/images/v0-icon.png';
import webflowLogo from '@/images/webflow-logo.webp';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Category = 'Visual Builder' | 'AI-Powered' | 'Database' | 'Web Development';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: Difficulty;
  url: string;
}

interface PricingTier {
  id: string;
  key: 'free' | 'freemium' | 'paid' | 'enterprise';
  name: string;
  price?: string;
  billing?: string;
  features?: string[];
  ctaUrl?: string;
}

interface Platform {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  docsUrl?: string;
  features: string[];
  difficulty: Difficulty;
  category: Category;
  tutorials: Tutorial[];
  pricing?: PricingTier[]; // populated from platformPricing
}

const platforms: Platform[] = [
  {
    id: 'lovable',
    name: 'Lovable',
    description:
      'Lovable is a visual development platform that allows you to build web applications using a drag-and-drop interface. Perfect for creating beautiful, responsive websites and web apps without writing code.',
    logo: lovableLogo,
    website: 'https://lovable.dev',
    docsUrl: 'https://docs.lovable.dev/introduction/welcome',
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
        description: 'Video tutorial by Darrel Wilson on Lovable',
        duration: '20 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=mOak_imYmqU'
      },
      {
        id: 'lovable-3',
        title: 'Deep Dive',
        description: 'Deep dive into Lovable',
        duration: '15 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=N8JWiuVLi9E'
      }
    ]
  },
  {
    id: 'base44',
    name: 'Base44',
    description:
      'Base44 is an AI-powered platform that lets you turn any idea into a fully-functional custom app, without the need for any coding experience.',
    logo: base44Logo,
    website: 'https://base44.com/',
    docsUrl: 'https://docs.base44.com/',
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
    description:
      'Windsurf is an AI-powered platform that helps you build applications using natural language. Simply describe what you want to build, and Windsurf creates it for you.',
    logo: windsurfLogo,
    website: 'https://windsurf.dev',
    docsUrl: 'https://docs.windsurf.com/windsurf/getting-started',
    features: ['AI-Powered', 'Natural Language', 'Auto-Generation', 'Smart Suggestions'],
    difficulty: 'Beginner',
    category: 'AI-Powered',
    tutorials: [
      {
        id: 'windsurf-1',
        title: 'Windsurf Basics',
        description: 'Video tutorial by Tech With Tim on Windsurf',
        duration: '20 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=8TcWGk1DJVs'
      },
      {
        id: 'windsurf-2',
        title: 'Deep Dive',
        description: 'Deep dive into Windsurf',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=qVuWRQh4Buo'
      }
    ]
  },
  {
    id: 'replit',
    name: 'Replit',
    description:
      "Replit is a powerful online IDE that allows you to write, run, and share code with others. It's perfect for beginners and experienced developers alike.",
    logo: replitLogo,
    website: 'https://replit.com',
    docsUrl: 'https://docs.replit.com/',
    features: ['Online IDE', 'Real-time Collaboration', 'Version Control', 'Community'],
    difficulty: 'Beginner',
    category: 'Web Development',
    tutorials: [
      {
        id: 'replit-1',
        title: 'Getting Started with Replit',
        description: 'Create your first Replit project and navigate the interface',
        duration: '10 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=St95nPOwsa8'
      },
      {
        id: 'replit-2',
        title: 'Deep Dive',
        description: 'Deep dive into Replit',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=KH63ojH6tQI'
      },
      {
        id: 'replit-3',
        title: 'Replit AI Agent',
        description: 'Full Replit course',
        duration: '2 hours',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=DaXQ5L7r7Lg'
      }
    ]
  },
  {
    id: 'bolt',
    name: 'Bolt',
    description:
      'Bolt is a powerful no-code platform focused on building database-driven applications. Create complex business apps using robust data management tools.',
    logo: boltLogo,
    website: 'https://bolt.new',
    docsUrl: 'https://support.bolt.new/',
    features: ['Database Management', 'Business Logic', 'API Integration', 'User Management'],
    difficulty: 'Intermediate',
    category: 'Database',
    tutorials: [
      {
        id: 'bolt-1',
        title: 'Bolt Basics',
        description: 'Build apps with Bolt (No Code MBA)',
        duration: '30 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=0_Ij8FEvY4U'
      },
      {
        id: 'bolt-2',
        title: 'Deep Dive',
        description: 'Deep dive into Bolt',
        duration: '20 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=JMBqw2SkuRw'
      }
    ]
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'GitHub Copilot is an AI pair programmer that helps you write code faster and more accurately.',
    logo: githubCopilotLogo,
    website: 'https://github.com/features/copilot',
    docsUrl: 'https://docs.github.com/en/copilot',
    features: ['AI Pair Programming', 'Intelligent Suggestions', 'Code Generation', 'Integration'],
    difficulty: 'Intermediate',
    category: 'Web Development',
    tutorials: [
      {
        id: 'github-copilot-1',
        title: 'Getting Started With GitHub Copilot',
        description: 'Start with Copilot and learn the core features',
        duration: '10 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=n0NlxUyA7FI'
      },
      {
        id: 'github-copilot-2',
        title: 'Essential Features',
        description: 'Essential Copilot features',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=b5xcWdzAB5c'
      },
      {
        id: 'github-copilot-3',
        title: 'Building a Web App',
        description: 'Build a web app with Copilot',
        duration: '20 min',
        difficulty: 'Advanced',
        url: 'https://www.youtube.com/watch?v=Nw4y5XQyugc'
      }
    ]
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'Cursor is an AI-first code editor that helps you write, edit, and debug code faster.',
    logo: cursorLogo,
    website: 'https://cursor.com',
    docsUrl: 'https://docs.cursor.com/en/get-started/installation',
    features: ['AI Code Assistant', 'Code Generation', 'Debugging', 'Multi-language Support'],
    difficulty: 'Advanced',
    category: 'Web Development',
    tutorials: [
      {
        id: 'cursor-1',
        title: 'Installation',
        description: 'Install Cursor quickly',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://docs.cursor.com/en/get-started/installation'
      },
      {
        id: 'cursor-2',
        title: 'Introduction to Cursor',
        description: 'Cursor basics',
        duration: '30 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=3289vhOUdKA'
      },
      {
        id: 'cursor-3',
        title: 'Advanced Cursor Rules',
        description: 'Set up advanced Cursor rules',
        duration: '25 min',
        difficulty: 'Advanced',
        url: 'https://www.youtube.com/watch?v=TrcyAWGC1k4'
      }
    ]
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Claude Code is an AI-powered code assistant that helps you write, debug, and optimize code.',
    logo: claudeCodeLogo,
    website: 'https://claude.ai',
    docsUrl: 'https://docs.anthropic.com/en/docs/claude-code/setup',
    features: ['AI Code Assistant', 'Code Generation', 'Debugging', 'Multi-language Support'],
    difficulty: 'Advanced',
    category: 'Web Development',
    tutorials: [
      {
        id: 'claude-code-1',
        title: 'Setup',
        description: 'Set up Claude Code',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://docs.anthropic.com/en/docs/claude-code/setup'
      },
      {
        id: 'claude-code-2',
        title: 'Claude Code Basics',
        description: 'Claude Code basics',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=P_pTypZZL4c'
      },
      {
        id: 'claude-code-3',
        title: 'Build a Full Stack Web App',
        description: 'Full stack build with Claude',
        duration: '30 min',
        difficulty: 'Advanced',
        url: 'https://www.youtube.com/watch?v=cYIxhL6pxL4'
      }
    ]
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    description: 'Gemini CLI brings Gemini into your terminal to help query, refactor, and automate developer tasks.',
    logo: geminiLogo,
    website: 'https://github.com/google-gemini/gemini-cli',
    docsUrl: 'https://github.com/google-gemini/gemini-cli',
    features: ['Terminal AI Agent', 'Code Analysis', 'Multimodal Generation', 'Tool Integration'],
    difficulty: 'Advanced',
    category: 'Web Development',
    tutorials: [
      {
        id: 'gemini-cli-1',
        title: 'Installation',
        description: 'Install and configure Gemini CLI',
        duration: '10 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=we2HwLyKYEg'
      },
      {
        id: 'gemini-cli-2',
        title: 'Crash Course',
        description: 'How to use Gemini CLI',
        duration: '15 min',
        difficulty: 'Intermediate',
        url: 'https://www.youtube.com/watch?v=KUCZe1xBKFM'
      }
    ]
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'A collaborative interface design tool — learn UI fundamentals, prototyping, design systems, and handoff workflows.',
    logo: figmaLogo,
    website: 'https://www.figma.com',
    docsUrl: 'https://help.figma.com/hc/en-us',
    features: ['Design Systems', 'Prototyping', 'Collaboration', 'Plugins'],
    difficulty: 'Beginner',
    category: 'Visual Builder',
    tutorials: [
      {
        id: 'figma-1',
        title: 'Figma Basics',
        description: 'Workspace, frames, constraints, and layout principles',
        duration: '15 min',
        difficulty: 'Beginner',
        url: 'https://help.figma.com/hc/en-us'
      }
    ]
  },
  {
  id: 'webflow',
  name: 'Webflow',
  description:
    'Webflow is a visual no-code website builder that lets you design and publish responsive websites with a powerful CMS—ideal for landing pages and fast MVP websites.',
  logo: webflowLogo,
  website: 'https://webflow.com',
  docsUrl: 'https://university.webflow.com',
  features: ['Visual Builder', 'Responsive Design', 'CMS', 'Hosting'],
  difficulty: 'Beginner',
  category: 'Visual Builder',
  tutorials: [
    {
      id: 'webflow-1',
      title: 'Webflow University (Start Here)',
      description: 'Official learning hub with beginner-friendly lessons',
      duration: 'Self-paced',
      difficulty: 'Beginner',
      url: 'https://university.webflow.com'
    }
  ]
},

  {
    id: 'emergent',
    name: 'Emergent',
    description:
      'Emergent is an AI-assisted builder that helps you spin up working app prototypes quickly. This tutorial track links straight to concise YouTube videos so you can learn the workflow fast.',
    logo: emergentLogo,
    website: 'https://emergent.dev',
    docsUrl: 'https://emergent.dev/docs',
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
      }
    ]
  },
  {
    id: 'grok',
    name: 'Grok',
    description:
      'Grok is an AI-powered chatbot developed by xAI that provides real-time, context-aware responses with access to current information.',
    logo: grokLogo,
    website: 'https://grok.com',
    docsUrl: 'https://docs.x.ai/docs/overview',
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
      }
    ]
  },
  {
    id: 'v0',
    name: 'v0',
    description:
      'v0 is Vercel’s AI-powered development platform that turns natural-language prompts into production-ready web apps and UI, generating React code styled with Tailwind.',
    logo: v0Logo,
    website: 'https://v0.app',
    docsUrl: 'https://v0.dev/docs',
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
platforms.forEach((p) => {
  p.pricing = platformPricing[p.id] ?? [];
});

function difficultyRank(d: Difficulty) {
  if (d === 'Beginner') return 1;
  if (d === 'Intermediate') return 2;
  return 3;
}

export function LearnPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platforms[0]?.id ?? 'lovable');

  const [goal, setGoal] = useState<'Build fast' | 'Learn UI' | 'Code with AI' | 'Ship a web app'>('Build fast');
  const [skill, setSkill] = useState<Difficulty>('Beginner');
  const [budget, setBudget] = useState<'Free' | 'Free/Paid' | 'Paid'>('Free');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'Recommended' | 'Name' | 'Difficulty' | 'Category'>('Recommended');

  const platformRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setTimeout(() => {
      const element = platformRefs.current[platformId];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/20';
      case 'Intermediate':
        return 'bg-amber-500/15 text-amber-200 border border-amber-500/20';
      case 'Advanced':
        return 'bg-rose-500/15 text-rose-200 border border-rose-500/20';
      default:
        return 'bg-zinc-500/15 text-zinc-200 border border-zinc-500/20';
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'Visual Builder':
        return <Palette className="w-4 h-4" />;
      case 'Database':
        return <Database className="w-4 h-4" />;
      case 'AI-Powered':
        return <Zap className="w-4 h-4" />;
      case 'Web Development':
        return <Code className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const recommendedIds = useMemo(() => {
    const rec = new Set<string>();

    if (goal === 'Build fast') ['lovable', 'windsurf', 'bolt', 'replit', 'webflow', 'figma', 'v0'].forEach((id) => rec.add(id));
    if (goal === 'Learn UI') ['figma', 'webflow', 'lovable'].forEach((id) => rec.add(id));
    if (goal === 'Code with AI') ['github-copilot', 'cursor', 'claude-code', 'gemini-cli', 'v0'].forEach((id) => rec.add(id));
    if (goal === 'Ship a web app') ['replit', 'lovable', 'webflow', 'windsurf', 'v0'].forEach((id) => rec.add(id));

    if (skill === 'Beginner') ['lovable', 'windsurf', 'replit', 'webflow', 'figma', 'base44', 'emergent', 'v0'].forEach((id) => rec.add(id));
    if (skill === 'Advanced') ['cursor', 'claude-code', 'gemini-cli'].forEach((id) => rec.add(id));

    if (budget === 'Free') ['replit', 'figma', 'gemini-cli'].forEach((id) => rec.add(id));

    return rec;
  }, [goal, skill, budget]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const base = platforms.filter((p) => {
      if (!normalizedQuery) return true;
      const haystack = `${p.name} ${p.description} ${p.category} ${p.difficulty} ${p.features.join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    return base.sort((a, b) => {
      if (sortBy === 'Recommended') {
        const ar = recommendedIds.has(a.id) ? 0 : 1;
        const br = recommendedIds.has(b.id) ? 0 : 1;
        if (ar !== br) return ar - br;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      if (sortBy === 'Difficulty') return difficultyRank(a.difficulty) - difficultyRank(b.difficulty);
      if (sortBy === 'Category') return a.category.localeCompare(b.category);
      return 0;
    });
  }, [normalizedQuery, sortBy, recommendedIds]);

  const selected = useMemo(() => {
    return platforms.find((p) => p.id === selectedPlatform) ?? filtered[0] ?? platforms[0];
  }, [selectedPlatform, filtered]);

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-140px] h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute left-[10%] top-[260px] h-[280px] w-[280px] rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute right-[8%] top-[540px] h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            <span className="mr-2">🎓</span>Explore No-Code Platforms for Fast Prototyping
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/70 max-w-3xl mx-auto">
            Discover no-code + AI tools, compare features, and follow guided learning paths to build faster.
          </p>
          <p className="mt-2 text-xs text-white/50">Tip: Use Goal + Skill + Budget to highlight tools, then Search/Sort.</p>
        </div>

        {/* Control Panel */}
        <Card className="bg-white/[0.03] border-white/10 backdrop-blur-md shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-300" />
              Learn Controls
            </CardTitle>
            <CardDescription className="text-white/60">
              Pick a goal + skill + budget to highlight recommended tools, then search and sort the grid.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Picker row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full h-11 rounded-lg bg-black/30 border border-white/10 px-3 text-sm outline-none
                             focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/40"
                >
                  <option>Build fast</option>
                  <option>Learn UI</option>
                  <option>Code with AI</option>
                  <option>Ship a web app</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Skill level</label>
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value as Difficulty)}
                  className="w-full h-11 rounded-lg bg-black/30 border border-white/10 px-3 text-sm outline-none
                             focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/40"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value as any)}
                  className="w-full h-11 rounded-lg bg-black/30 border border-white/10 px-3 text-sm outline-none
                             focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/40"
                >
                  <option>Free</option>
                  <option>Free/Paid</option>
                  <option>Paid</option>
                </select>
              </div>
            </div>

            {/* Recommended line */}
            <div className="rounded-lg border border-white/10 bg-black/25 px-4 py-3">
              <div className="text-xs text-white/60">Recommended now</div>
              <div className="mt-1 text-sm text-white/90">
                {filtered
                  .filter((p) => recommendedIds.has(p.id))
                  .slice(0, 8)
                  .map((p, idx, arr) => (
                    <span key={p.id}>
                      <button
                        onClick={() => scrollToPlatform(p.id)}
                        className="text-purple-300 hover:text-purple-200 underline underline-offset-4"
                      >
                        {p.name}
                      </button>
                      {idx < arr.length - 1 ? <span className="text-white/40">, </span> : null}
                    </span>
                  ))}
                {filtered.filter((p) => recommendedIds.has(p.id)).length === 0 && (
                  <span className="text-white/50">No strong match — try changing filters.</span>
                )}
              </div>
            </div>

            {/* Search + Sort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-medium text-white/70">Search tools</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, feature, difficulty, category…"
                    className="w-full h-11 rounded-lg bg-black/30 border border-white/10 pl-10 pr-3 text-sm outline-none
                               focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/40"
                  />
                </div>
                <div className="text-xs text-white/45">Showing {filtered.length} tools</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-11 rounded-lg bg-black/30 border border-white/10 px-3 text-sm outline-none
                             focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/40"
                >
                  <option>Recommended</option>
                  <option>Name</option>
                  <option>Difficulty</option>
                  <option>Category</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tool Grid */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((platform) => {
            const isSelected = selected?.id === platform.id;
            const isRecommended = recommendedIds.has(platform.id);

            return (
              <Card
                key={platform.id}
                className={[
                  'bg-white/[0.03] border-white/10 backdrop-blur-md transition-all',
                  'hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-xl',
                  isSelected ? 'ring-2 ring-purple-500/60' : '',
                  isRecommended ? 'shadow-[0_0_0_1px_rgba(168,85,247,0.25)]' : ''
                ].join(' ')}
              >
                <CardContent className="p-6">
                  <button onClick={() => scrollToPlatform(platform.id)} className="w-full text-left">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-black/30 border border-white/10 p-2 flex items-center justify-center">
                        <img src={platform.logo} alt={platform.name} className="w-full h-full object-contain" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold">{platform.name}</h3>
                          {isRecommended && (
                            <span className="text-[11px] px-2 py-1 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-200">
                              Recommended
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-white/70 text-xs">
                          <span className="inline-flex items-center gap-1">
                            {getCategoryIcon(platform.category)}
                            {platform.category}
                          </span>

                          <span className="text-white/30">•</span>

                          <span className={`inline-flex items-center px-2 py-1 rounded-full ${getDifficultyColor(platform.difficulty)}`}>
                            {platform.difficulty}
                          </span>
                        </div>

                        <div className="mt-3">
                          <PricingPill pricing={platform.pricing} />
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-white/70 line-clamp-3">{platform.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {platform.features.slice(0, 4).map((feature) => (
                        <span key={feature} className="text-[11px] px-2 py-1 rounded-full bg-black/25 border border-white/10 text-white/70">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected tool details */}
        {selected && (
          <div className="mt-10" ref={(el) => (platformRefs.current[selected.id] = el)}>
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-black/30 border border-white/10 p-2 flex items-center justify-center">
                    <img src={selected.logo} alt={selected.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-2xl">{selected.name}</CardTitle>
                    <CardDescription className="text-white/65">{selected.description}</CardDescription>
                    <div className="mt-3">
                      <PricingPill pricing={selected.pricing} />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="flex-1">
                    <a href={selected.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit
                    </a>
                  </Button>

                  <Button variant="outline" asChild className="flex-1 border-white/15 text-white/80 hover:bg-white/10">
                    <a href={selected.docsUrl ?? selected.website} target="_blank" rel="noopener noreferrer">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Docs
                    </a>
                  </Button>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Learning Path</h3>
                  <div className="space-y-3">
                    {selected.tutorials.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-lg border border-white/10 bg-black/25 px-4 py-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white">{t.title}</div>
                          <div className="text-xs text-white/65 mt-1">{t.description}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-[11px] px-2 py-1 rounded-full ${getDifficultyColor(t.difficulty)}`}>
                              {t.difficulty}
                            </span>
                            <span className="text-xs text-white/45">{t.duration}</span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-white/15 text-white/80 hover:bg-white/10 shrink-0"
                        >
                          <a href={t.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Start
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
