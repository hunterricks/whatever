"use client";

import { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, off, query, orderByChild } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender: string;
  senderName: string;
  content: string;
  timestamp: number;
  attachments?: string[];
}

interface MessagingProps {
  jobId: string;
  otherUserId: string;
  otherUserName: string;
}

export default function Messaging({ jobId, otherUserId, otherUserName }: MessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    const chatId = [user.id, otherUserId].sort().join('_');
    const messagesRef = ref(database, `messages/${jobId}/${chatId}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    setIsLoading(true);
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        setMessages(messageList);
      }
      setIsLoading(false);
    });

    return () => {
      off(messagesRef);
      unsubscribe();
    };
  }, [jobId, otherUserId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || isLoading) return;

    const chatId = [user.id, otherUserId].sort().join('_');
    const messagesRef = ref(database, `messages/${jobId}/${chatId}`);

    setIsLoading(true);
    try {
      await push(messagesRef, {
        sender: user.id,
        senderName: user.name,
        content: newMessage,
        timestamp: Date.now(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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

  if (!user) return null;

  return (
    <div className="flex flex-col h-[700px]">
      {/* Messages Area */}
      <ScrollArea className="flex-grow px-4">
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`flex items-start space-x-2 max-w-[70%] ${
                message.sender === user.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName}`} />
                  <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.sender === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="break-words">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-grow"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !newMessage.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}