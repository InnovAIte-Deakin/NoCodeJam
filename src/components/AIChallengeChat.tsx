import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChallengeData {
  title: string;
  challengeId?: string;
  associatedPathway?: string;
  associatedModule?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number; // in minutes
  challengeType: 'Build' | 'Modify' | 'Analyse' | 'Deploy' | 'Reflect';
  recommendedTools: string[];
  xp: string; // Always "(calculated by system)"
  coverImageDescription: string;
  versionNumber: string;
  fullDescription: string;
  requirements: string[];
}

interface AIChallengeChat {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChallengeGenerated: (data: AIChallengeData) => void;
}

export function AIChallengeChat({ open, onOpenChange, onChallengeGenerated }: AIChallengeChat) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you create a great challenge for NoCodeJam. What kind of challenge would you like to create? Tell me about your idea!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      // Call Edge Function for chat
      const { data, error } = await supabase.functions.invoke('generate-challenge', {
        body: {
          action: 'chat',
          messages: newMessages
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Add assistant response
      if (data?.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast({
        title: "Chat Error",
        description: err instanceof Error ? err.message : "Failed to get response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateChallenge = async () => {
    setIsGenerating(true);

    try {
      // Call Edge Function to extract structured data from conversation
      const { data, error } = await supabase.functions.invoke('generate-challenge', {
        body: {
          action: 'generate',
          messages: messages
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.challenge) {
        // Validation Warnings
        if (data.validationWarnings && data.validationWarnings.length > 0) {
          toast({
            title: "Governance Warnings",
            description: (
              <ul className="list-disc pl-4">
                {data.validationWarnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            ),
            variant: "default",
            className: "border-yellow-500 border-l-4 bg-gray-800 text-white"
          });
        }

        // Pass the structured challenge data back to parent
        onChallengeGenerated(data.challenge);

        toast({
          title: "Challenge Generated!",
          description: "The form has been populated with your challenge details.",
        });

        // Close the modal
        onOpenChange(false);

        // Reset for next time
        setMessages([
          {
            role: 'assistant',
            content: "Hi! I'm here to help you create a great challenge for NoCodeJam. What kind of challenge would you like to create? Tell me about your idea!"
          }
        ]);
      }
    } catch (err) {
      console.error('Generation error:', err);
      toast({
        title: "Generation Error",
        description: err instanceof Error ? err.message : "Failed to generate challenge",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <DialogTitle className="text-white">AI Challenge Assistant</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">
            Chat with me to refine your challenge idea, then click "Generate Challenge" when ready!
          </DialogDescription>
        </DialogHeader>

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What is your challenge about?"
              disabled={isLoading || isGenerating}
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Generate Button */}
          {messages.length > 2 && (
            <Button
              onClick={generateChallenge}
              disabled={isLoading || isGenerating}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Challenge...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Challenge
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
