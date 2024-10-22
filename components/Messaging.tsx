"use client";

import { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/auth';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

interface MessagingProps {
  jobId: string;
  otherUserId: string;
}

export default function Messaging({ jobId, otherUserId }: MessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    const chatId = [user.id, otherUserId].sort().join('_');
    const messagesRef = ref(database, `messages/${jobId}/${chatId}`);

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        setMessages(messageList);
      }
    });

    return () => {
      off(messagesRef);
    };
  }, [jobId, otherUserId, user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    const chatId = [user.id, otherUserId].sort().join('_');
    const messagesRef = ref(database, `messages/${jobId}/${chatId}`);

    await push(messagesRef, {
      sender: user.id,
      content: newMessage,
      timestamp: Date.now(),
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-grow" ref={scrollRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 ${
              message.sender === user?.id ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.sender === user?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
      </ScrollArea>
      <div className="flex mt-4">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage} className="ml-2">
          Send
        </Button>
      </div>
    </div>
  );
}