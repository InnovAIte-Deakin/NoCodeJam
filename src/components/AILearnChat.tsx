import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AILearnChatProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AILearnChat({ open, onOpenChange }: AILearnChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm your Learning Guide. What skills or tools would you like to learn today? Tell me your goals, and I'll recommend a pathway for you."
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        try {
            const { data, error } = await supabase.functions.invoke('generate-challenge', {
                body: {
                    action: 'chat-learn',
                    messages: newMessages
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            // Add assistant response
            if (data?.message) {
                setMessages([...newMessages, { role: 'assistant', content: data.message }]);
            } else {
                throw new Error("No response message received");
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
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        <DialogTitle className="text-white">AI Learning Guide</DialogTitle>
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

                <div className="space-y-3 pt-4 border-t border-gray-700">
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
