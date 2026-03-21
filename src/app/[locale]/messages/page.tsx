'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { createBrowserClient } from '@/lib/supabase/client';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import type { Message, Conversation, Profile } from '@/lib/supabase/types';

interface ConversationWithDetails extends Conversation {
  other_user?: Profile;
  last_message?: Message;
  unread_count?: number;
}

function MessagesContent() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const messagesEndRef: React.RefObject<HTMLDivElement> = { current: null };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as { id: string } | null);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    const selectedUserId = searchParams.get('user');
    if (selectedUserId) {
      // Start conversation with specific user
    }
  }, [searchParams, supabase]);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data: convs } = await supabase
        .from('conversations')
        .select('*, other_user:profiles(*)')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });
      setConversations((convs || []) as ConversationWithDetails[]);
      setLoading(false);
    };
    fetchConversations();
  }, [user, supabase]);

  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });
      setMessages((msgs || []) as Message[]);
    };
    fetchMessages();

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` },
        async (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConversation, supabase]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    if (!selectedConversation) {
      // Create new conversation first
      const { data: conv } = await supabase
        .from('conversations')
        .insert({ participant_1: user.id, participant_2: searchParams.get('user') })
        .select()
        .single();
      if (conv) {
        setSelectedConversation(conv as ConversationWithDetails);
        const { data: msg } = await supabase
          .from('messages')
          .insert({ conversation_id: conv.id, sender_id: user.id, content: newMessage })
          .select()
          .single();
        if (msg) setMessages([...messages, msg as Message]);
      }
    } else {
      const { data: msg } = await supabase
        .from('messages')
        .insert({ conversation_id: selectedConversation.id, sender_id: user.id, content: newMessage })
        .select()
        .single();
      if (msg) setMessages([...messages, msg as Message]);
    }
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversation List */}
      <div className="w-full border-r md:w-80">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">{t('nav.messages')}</h2>
          </div>
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {locale === 'zh-HK' ? '暫無對話' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex w-full items-center gap-3 border-b p-4 text-left hover:bg-muted ${
                    selectedConversation?.id === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {conv.other_user?.name?.charAt(0) || conv.other_user?.company_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium">
                        {conv.other_user?.name || conv.other_user?.company_name || locale === 'zh-HK' ? '用戶' : 'User'}
                      </p>
                    </div>
                    {conv.last_message && (
                      <p className="truncate text-sm text-muted-foreground">{conv.last_message.content}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden flex-1 flex-col md:flex">
        {selectedConversation ? (
          <>
            <div className="flex items-center gap-4 border-b p-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/${locale}/messages`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Avatar>
                <AvatarImage src={selectedConversation.other_user?.avatar_url || undefined} />
                <AvatarFallback>
                  {selectedConversation.other_user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedConversation.other_user?.name || selectedConversation.other_user?.company_name || ''}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="mt-1 text-xs opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={locale === 'zh-HK' ? '輸入訊息...' : 'Type a message...'}
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                />
                <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center">
            <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">
              {locale === 'zh-HK' ? '選擇對話開始' : 'Select a conversation to start messaging'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
