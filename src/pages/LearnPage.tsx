import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, ExternalLink } from 'lucide-react';

const videos = [
  {
    title: 'Bolt',
    url: 'https://youtu.be/JMBqw2SkuRw',
    description: 'Deep dive into Bolt - AI-powered web development'
  },
  {
    title: 'Vercel',
    url: 'https://youtu.be/JLK_W6t3bV8',
    description: 'Mastering Vercel for deployment and hosting'
  },
  {
    title: 'Cursor',
    url: 'https://youtu.be/zxCHEJACAI8',
    description: 'Exploring Cursor - AI code editor capabilities'
  },
  {
    title: 'Replit',
    url: 'https://youtu.be/KH63ojH6tQI',
    description: 'Building with Replit - collaborative coding platform'
  },
  {
    title: 'Lovable',
    url: 'https://youtu.be/N8JWiuVLi9E',
    description: 'Understanding Lovable - AI development tool'
  },
  {
    title: 'Windsurf',
    url: 'https://youtu.be/qVuWRQh4Buo',
    description: 'Windsurf tutorial - AI-powered development'
  },
  {
    title: 'Tempo Labs',
    url: 'https://youtu.be/7qRc1P-cNtw',
    description: 'Tempo Labs deep dive - accelerated development'
  },
  {
    title: 'Fynix.ai',
    url: 'https://youtu.be/bN-fGBCDkMQ',
    description: 'Fynix.ai exploration - AI development assistant'
  }
];

export function LearnPage() {
  const openVideo = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Learn to Vibe Code</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master the art of AI-assisted development with our comprehensive guides and tutorials. 
            Learn how to leverage cutting-edge tools to build amazing projects faster than ever.
          </p>
        </div>

        {/* Featured Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Play className="w-6 h-6 mr-2" />
                InnovAIte Trimester 1 Handover
              </CardTitle>
              <CardDescription className="text-purple-100">
                Complete overview of our journey and key learnings from Trimester 1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="secondary" 
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => openVideo('https://youtu.be/WPt6f4-sM4s')}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Video
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Play className="w-6 h-6 mr-2" />
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
                onClick={() => openVideo('https://youtube.com/@InnovAIte-Deakin')}
              >
                <Play className="w-4 h-4 mr-2" />
                Visit Channel
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tool Deep Dives */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            AI Development Tools Deep Dives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group" onClick={() => openVideo(video.url)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    {video.title}
                    <Play className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4">
                    {video.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Tutorial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Getting Started</CardTitle>
            <CardDescription className="text-center text-lg">
              New to AI-assisted development? Start here!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-600 mb-6">
                AI assistants and no-code/low-code tools are revolutionizing how we build software. 
                These tools help you prototype faster, write better code, and bring ideas to life 
                without getting bogged down in implementation details.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-purple-600 mb-2">🚀 Start Quick</h4>
                  <p>Jump into any tool and start building. Most have excellent onboarding.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-blue-600 mb-2">🤖 AI First</h4>
                  <p>Let AI handle the repetitive tasks while you focus on creativity and logic.</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-green-600 mb-2">🎯 Ship Fast</h4>
                  <p>From idea to deployment in hours, not weeks. Perfect for rapid prototyping.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
