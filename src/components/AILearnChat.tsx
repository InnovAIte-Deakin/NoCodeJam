import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, BookOpen } from 'lucide-react';
import { chatWithLearningArchitect, type AIMessage } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errorHandling';
import ReactMarkdown from 'react-markdown';



const INITIAL_MESSAGE: AIMessage = {
    role: 'assistant',
    content: "Hello! I'm your Learning Guide. What skills or tools would you like to learn today? Tell me your goals, and I'll recommend a pathway for you."
};

interface AILearnChatProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AILearnChat({ open, onOpenChange }: AILearnChatProps) {
    const [messages, setMessages] = useState<AIMessage[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPrompts, setShowPrompts] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

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

        // UI update: Add user message immediately
        const newMessages: AIMessage[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        try {
            const { message, fallback } = await chatWithLearningArchitect(newMessages);
            setMessages([...newMessages, { role: 'assistant', content: message }]);

            if (fallback.fallbackUsed) {
                toast({
                    title: "Fallback Response",
                    description: fallback.fallbackReason ?? "The AI service was unavailable, so a fallback learning response was used.",
                });
            }
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = getErrorMessage(err);
            const isRateLimit = errorMsg.includes('429') || 
                errorMsg.toLowerCase().includes('rate limit') ||
                errorMsg.toLowerCase().includes('too many') ||
                errorMsg.toLowerCase().includes('non-2xx');
            
            if (isRateLimit) {
                setMessages([...newMessages, {
                    role: 'assistant',
                    content: "⚠️ You have reached the maximum number of AI requests for this hour (20 requests). Please wait a while before trying again. In the meantime, feel free to browse the challenges and learning pathways available on the platform! You can also visit our FAQ page for answers to common questions."
                }]);
            } else {
                toast({
                    title: "Chat Error",
                    description: errorMsg,
                    variant: "destructive"
                });
            }
        } finally {
            setIsLoading(false);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen style={{ width: '20px', height: '20px', color: '#60a5fa', flexShrink: 0 }} />
                        <DialogTitle style={{ color: 'white', margin: 0, lineHeight: '20px' }}>AI Learning Guide</DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-300">
                        Ask me about No-Code tools, coding concepts, or where to start!
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
                    <div className="space-y-4 pb-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : message.content.startsWith('⚠️')
                                            ? 'bg-red-900/40 border border-red-500/40 text-red-200'
                                            : 'bg-gray-700 text-gray-100'
                                        }`}
                                >
                                    <div className="text-sm leading-relaxed max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({children}) => <p className="font-bold text-white mt-3 mb-0">{children}</p>,
                                                h2: ({children}) => <p className="font-bold text-white mt-3 mb-0">{children}</p>,
                                                h3: ({children}) => <p className="font-semibold text-white mt-3 mb-0">{children}</p>,
                                                p: ({children}) => <p className="my-1.5">{children}</p>,
                                                strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                                                ol: ({children}) => <ol className="list-decimal list-outside ml-4 my-1.5 space-y-1">{children}</ol>,
                                                ul: ({children}) => <ul className="list-disc list-outside ml-4 my-1.5 space-y-1">{children}</ul>,
                                                li: ({children}) => <li className="text-sm leading-relaxed">{children}</li>,
}}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    {message.role === 'assistant' && !message.content.startsWith('⚠️') && (
                                        <p className="text-[10px] text-gray-400 mt-2 text-right">AI Learning Guide</p>
                                    )}
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

                <div className="space-y-3 pt-4 border-t border-gray-700">
                    {/* ── Suggested AI Prompts ── */}
                    {showPrompts && (
                        <div className="space-y-2">
                            <p className="text-xs text-gray-400">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'Which no-code tool should I start with?',
                                    'What is the easiest challenge for beginners?',
                                    'How do I earn XP on NoCodeJam?',
                                    'What can I build with no-code tools?',
                                ].map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => {
                                            setInput(prompt);
                                            setShowPrompts(false);
                                        }}
                                        disabled={isLoading}
                                        className="text-xs px-3 py-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white border border-gray-600 hover:border-blue-500 transition-colors duration-200"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowPrompts(!showPrompts)}
                            className="text-xs text-gray-400 hover:text-blue-400 transition-colors duration-200 whitespace-nowrap"
                        >
                            {showPrompts ? 'Hide suggestions ▲' : 'Show suggestions ▼'}
                        </button>
                    </div>

                    <div className="flex space-x-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="I want to learn how to build..."
                            disabled={isLoading}
                            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
