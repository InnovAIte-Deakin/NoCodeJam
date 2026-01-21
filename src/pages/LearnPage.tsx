import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  ExternalLink,
  Play,
  BookOpen,
  Code,
  Zap,
  Palette,
  Database,
  Globe,
  Search,
  ArrowUpDown,
  X
} from 'lucide-react';

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
  pricing?: string;
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
    description:
      'Lovable is a visual development platform that allows you to build web applications using a drag-and-drop interface. Perfect for creating beautiful, responsive websites and web apps without writing code.',
    logo: lovableLogo,
    website: 'https://lovable.dev',
    features: ['Visual Builder', 'Drag & Drop', 'Responsive Design', 'Real-time Preview'],
    difficulty: 'Beginner',
    category: 'Visual Builder',
    pricing: 'Pro $9',
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
    description:
      'Windsurf is an AI-powered no-code platform that helps you build applications using natural language. Simply describe what you want to build, and Windsurf creates it for you.',
    logo: windsurfLogo,
    website: 'https://windsurf.dev',
    features: ['AI-Powered', 'Natural Language', 'Auto-Generation', 'Smart Suggestions'],
    difficulty: 'Beginner',
    category: 'AI-Powered',
    pricing: 'Pro $29',
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
    description:
      "Replit is a powerful online IDE that allows you to write, run, and share code with others. It's perfect for beginners and experienced developers alike, offering a seamless development experience.",
    logo: replitLogo,
    website: 'https://replit.com',
    features: ['Online IDE', 'Real-time Collaboration', 'Version Control', 'Community'],
    difficulty: 'Beginner',
    category: 'Web Development',
    pricing: 'Hacker $7',
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
    description:
      'Bolt is a powerful no-code platform focused on building database-driven applications. Create complex business applications with ease using its intuitive interface and robust data management tools.',
    logo: boltLogo,
    website: 'https://bolt.com',
    features: ['Database Management', 'Business Logic', 'API Integration', 'User Management'],
    difficulty: 'Intermediate',
    category: 'Database',
    pricing: 'Free/Pro',
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
    description:
      'GitHub Copilot is an AI pair programmer that helps you write code faster and more accurately. It integrates with your existing workflow and provides intelligent suggestions.',
    logo: githubCopilotLogo,
    website: 'https://github.com/features/copilot',
    features: ['AI Pair Programming', 'Intelligent Suggestions', 'Code Generation', 'Integration'],
    difficulty: 'Intermediate',
    category: 'Web Development',
    pricing: 'Paid',
    tutorials: [
      {
        id: 'github-copilot-1',
        title: 'Getting Started With GitHub Copilot',
        description: 'Video Tutorial learn how to get started with GitHub Copilot and its features',
        duration: '10 min',
        difficulty: 'Beginner',
        url: 'https://www.youtube.com/watch?v=n0NlxUyA7FI'
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
    description:
      'Cursor is an AI-first code editor that helps you write, edit, and debug code faster. While not strictly no-code, it makes coding accessible to everyone with AI assistance.',
    logo: cursorLogo,
    website: 'https://cursor.sh',
    features: ['AI Code Assistant', 'Code Generation', 'Debugging', 'Multi-language Support'],
    difficulty: 'Advanced',
    category: 'Web Development',
    pricing: 'Paid',
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
    description:
      "Claude Code is an AI-powered code assistant that helps you write, debug, and optimize code. It's designed to be your personal assistant for all your coding needs.",
    logo: claudeCodeLogo,
    website: 'https://claude.com/code',
    features: ['AI Code Assistant', 'Code Generation', 'Debugging', 'Multi-language Support'],
    difficulty: 'Advanced',
    category: 'Web Development',
    pricing: 'Paid',
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
    description:
      'Gemini CLI is an open-source AI agent that brings the power of Gemini directly into your terminal. It can query and edit large codebases, generate apps from PDFs or sketches, and automate operational tasks.',
    logo: geminiLogo,
    website: 'https://github.com/google-gemini/gemini-cli',
    features: ['Terminal AI Agent', 'Code Analysis', 'Multimodal Generation', 'Tool Integration'],
    difficulty: 'Advanced',
    category: 'Web Development',
    pricing: 'Free',
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
    id: 'figma',
    name: 'Figma',
    description:
      'A collaborative interface design tool — learn UI fundamentals, prototyping, design systems, and handoff workflows.',
    logo: figmaLogo,
    website: 'https://www.figma.com',
    features: ['Design Systems', 'Prototyping', 'Collaboration', 'Plugins'],
    difficulty: 'Beginner',
    category: 'Visual Builder',
    pricing: 'Free/Paid',
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
  }
];

function difficultyRank(d: Platform['difficulty']) {
  if (d === 'Beginner') return 1;
  if (d === 'Intermediate') return 2;
  return 3;
}

export function LearnPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('lovable');

  // ✅ neat controls: compact + centered + looks professional
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'name' | 'difficulty' | 'category'>('recommended');

  const platformRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setTimeout(() => {
      const element = platformRefs.current[platformId];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30';
      case 'Intermediate':
        return 'bg-amber-500/15 text-amber-200 border border-amber-500/30';
      case 'Advanced':
        return 'bg-rose-500/15 text-rose-200 border border-rose-500/30';
      default:
        return 'bg-white/10 text-gray-200 border border-white/10';
    }
  };

  const getCategoryIcon = (category: string) => {
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

  const PricePill = ({ pricing }: { pricing?: string }) => (
    <span className="inline-flex items-center rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-200 border border-purple-500/30">
      {pricing ?? 'Free'}
    </span>
  );

  const filteredPlatforms = useMemo(() => {
    const q = query.toLowerCase().trim();

    let list = platforms.filter((p) => {
      if (!q) return true;
      const hay = [p.name, p.description, p.category, p.difficulty, p.pricing ?? '', ...p.features]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    if (sortBy === 'recommended') {
      // Recommended: Beginner first, then Visual Builder/AI-Powered first, then alphabetical
      const catScore = (c: Platform['category']) =>
        c === 'Visual Builder' ? 1 : c === 'AI-Powered' ? 2 : c === 'Web Development' ? 3 : 4;

      list = list.sort((a, b) => {
        const diff = difficultyRank(a.difficulty) - difficultyRank(b.difficulty);
        if (diff !== 0) return diff;
        const cs = catScore(a.category) - catScore(b.category);
        if (cs !== 0) return cs;
        return a.name.localeCompare(b.name);
      });
    } else if (sortBy === 'name') {
      list = list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      list = list.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    } else {
      list = list.sort((a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty));
    }

    return list;
  }, [query, sortBy]);

  const activePlatformId = useMemo(() => {
    if (filteredPlatforms.some((p) => p.id === selectedPlatform)) return selectedPlatform;
    return filteredPlatforms[0]?.id ?? platforms[0].id;
  }, [filteredPlatforms, selectedPlatform]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-black">
      {/* ✅ Hero background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-64 w-[800px] -translate-x-1/2 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute top-24 left-1/3 h-48 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            🎓 Explore No-Code Platforms for Fast Prototyping
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Discover the best no-code platforms and learn how to build amazing applications without writing a single
            line of code.
          </p>

          {/* ✅ NEW: clean “toolbar” card (proper spacing + centered) */}
          <div className="max-w-3xl mx-auto mt-7">
            <Card className="bg-white/5 border-white/10 backdrop-blur">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tools (e.g., AI, builder, Replit)"
                        className="w-full rounded-xl bg-black/25 border border-white/10 pl-10 pr-10 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                      />
                      {query && (
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                          onClick={() => setQuery('')}
                          aria-label="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Showing <span className="text-gray-200 font-medium">{filteredPlatforms.length}</span> platforms
                    </div>
                  </div>

                  {/* sort */}
                  <div className="sm:w-56">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Sort</span>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full rounded-xl bg-black/25 border border-white/10 px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="name">Name</option>
                      <option value="difficulty">Difficulty</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                </div>

                {/* ✅ quick chips row */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {['AI', 'Builder', 'Database', 'Beginner', 'Advanced'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setQuery(chip)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200 hover:bg-white/10 transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Cards */}
        {filteredPlatforms.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-white font-medium">No platforms found.</p>
              <p className="text-sm text-gray-400 mt-2">Try keywords like AI, Builder, Database, Beginner.</p>
              <Button className="mt-5" variant="outline" onClick={() => setQuery('')}>
                Clear search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {filteredPlatforms.map((platform) => {
              const selected = activePlatformId === platform.id;

              return (
                <Card
                  key={platform.id}
                  className={`group cursor-pointer transition-all duration-200 bg-white/5 border-white/10 hover:bg-white/7 hover:border-white/15 ${
                    selected ? 'ring-2 ring-purple-500/70' : ''
                  }`}
                  onClick={() => scrollToPlatform(platform.id)}
                >
                  <CardContent className="p-6">
                    {/* top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-24 h-12 flex items-center">
                        <img
                          src={platform.logo}
                          alt={`${platform.name} logo`}
                          className="w-full h-full object-contain opacity-95 group-hover:opacity-100"
                        />
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <PricePill pricing={platform.pricing} />
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${getDifficultyColor(platform.difficulty)}`}>
                          {platform.difficulty}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">{platform.name}</h3>

                    {/* category */}
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-gray-400">{getCategoryIcon(platform.category)}</span>
                      <span>{platform.category}</span>
                    </div>

                    <p className="mt-3 text-sm text-gray-300 line-clamp-3">{platform.description}</p>

                    {/* features mini */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {platform.features.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="text-xs rounded-full border border-white/10 bg-black/20 px-3 py-1 text-gray-200"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Details */}
        <div className="space-y-6">
          {platforms.map((platform) => (
            <div key={platform.id} className={`${activePlatformId === platform.id ? 'block' : 'hidden'} space-y-6`}>
              <Card className="bg-white/5 border-white/10">
                <CardHeader ref={(el) => (platformRefs.current[platform.id] = el)}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 p-1 rounded-lg bg-black/20 border border-white/10">
                        <img
                          src={platform.logo}
                          alt={`${platform.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">{platform.name}</CardTitle>
                        <CardDescription className="text-base text-gray-300">{platform.description}</CardDescription>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <PricePill pricing={platform.pricing} />
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${getDifficultyColor(platform.difficulty)}`}>
                        {platform.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/25 border border-white/10 px-3 py-1 text-xs text-gray-200">
                        {getCategoryIcon(platform.category)}
                        {platform.category}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-white">Key Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {platform.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="justify-center bg-black/25 border border-white/10 text-gray-200"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <a href={platform.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit {platform.name}
                      </a>
                    </Button>

                    <Button variant="outline" asChild className="flex-1 border-white/15 text-gray-200 hover:bg-white/5">
                      <a
                        href={
                          platform.id === 'windsurf'
                            ? 'https://docs.windsurf.com/windsurf/getting-started'
                            : platform.id === 'bolt'
                            ? 'https://support.bolt.new/'
                            : platform.id === 'lovable'
                            ? 'https://docs.lovable.dev/introduction/welcome'
                            : platform.id === 'replit'
                            ? 'https://docs.replit.com/'
                            : platform.id === 'github-copilot'
                            ? 'https://docs.github.com/en/copilot'
                            : platform.id === 'claude-code'
                            ? 'https://docs.anthropic.com/claude'
                            : platform.id === 'gemini-cli'
                            ? 'https://cloud.google.com/gemini/docs/codeassist/gemini-cli'
                            : platform.id === 'figma'
                            ? 'https://help.figma.com/hc/en-us'
                            : `${platform.website}/docs`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tutorials */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Play className="w-5 h-5" />
                    <span>Learning Path</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300">Follow these tutorials to master {platform.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platform.tutorials.map((tutorial) => (
                      <div
                        key={tutorial.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-white/10 rounded-xl bg-black/20 hover:bg-black/30 transition"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{tutorial.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{tutorial.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${getDifficultyColor(tutorial.difficulty)}`}>
                              {tutorial.difficulty}
                            </span>
                            <span className="text-xs text-gray-400">{tutorial.duration}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="border-white/15 text-gray-200 hover:bg-white/5">
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

        {/* InnovAIte Section (kept same but matching new card styling) */}
        <Card className="mt-10 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl text-white">
              <img src={innovAIteLogo} alt="InnovAIte Logo" className="w-8 h-8" />
              <span>About InnovAIte</span>
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">Meet the team behind NoCodeJam and learn about our mission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-300 mb-4">
                <strong>InnovAIte</strong> is focused on testing and validating two key programs that will make up SPARK when it launches in 2026 - the AI Generalist Program and the AI Prototyping Lab.
              </p>

              <p className="text-gray-300 mb-4">
                Our mission is to understand how AI tools and platforms can dramatically compress startup development cycles from months to days, making entrepreneurship more accessible to everyone regardless of technical background.
              </p>

              <div className="bg-black/20 p-4 rounded-xl border border-white/10 mb-4">
                <h4 className="font-semibold text-purple-300 mb-2">Our Structure</h4>
                <p className="text-gray-300 mb-3">
                  At InnovAIte, we operate with a collaborative structure that encourages team leadership and contributions. While Jesse McMeikan serves as our Product Owner, Dr Leon Yang as the Acting Academic Company Director, and Scott West as our Industry Mentor, we focus on contributions made by students to our validation projects.
                </p>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/10 mb-4">
                <h4 className="font-semibold text-blue-300 mb-2">Our Operations: "The Three C's"</h4>
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
              <Card className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Company Handover Video
                  </CardTitle>
                  <CardDescription className="text-purple-100">Watch our Trimester 1 handover presentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    className="bg-white text-purple-700 hover:bg-gray-100"
                    onClick={() => window.open('https://www.youtube.com/watch?v=WPt6f4-sM4s', '_blank')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    YouTube Channel
                  </CardTitle>
                  <CardDescription className="text-blue-100">Subscribe to our channel for the latest tutorials and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    className="bg-white text-blue-700 hover:bg-gray-100"
                    onClick={() => window.open('https://www.youtube.com/@innovAIteDeakin', '_blank')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Visit Channel
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-white/10">
              <h4 className="font-semibold text-emerald-300 mb-2">Get Involved</h4>
              <p className="text-gray-300 mb-3">
                Deakin students can access our GitLab repository and contribute to our validation projects. Look for the SSO sign-in button.
              </p>
              <Button
                variant="outline"
                className="border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10"
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
