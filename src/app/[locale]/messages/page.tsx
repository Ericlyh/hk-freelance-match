'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { createBrowserClient } from '@/lib/supabase/client';
import { Send, Paperclip, MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Message, Conversation, Profile } from '@/lib/supabase/types';

interface ConversationWithDetails extends Conversation {
  other_user?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export default function MessagesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(searchParams.get('user') || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as { id: string } | null);

      if (user) {
        // Fetch conversations
        const { data: convos } = await supabase
          .from('conversations')
          .select(`
            *,
            messages (
              content,
              created_at,
              sender_id,
              attachments
            )
          `)
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        // Get other participant info for each conversation
        const convosWithDetails = await Promise.all(
          (convos || []).map(async (convo) => {
            const otherUserId = convo.participant_1 === user.id ? convo.participant_2 : convo.participant_1;
            const { data: otherUser } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', otherUserId)
              .single();

            const sortedMessages = convo.messages?.sort(
              (a: Message, b: Message) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ) || [];

            return {
              ...convo,
              other_user: otherUser,
              last_message: sortedMessages[0],
            };
          })
        );

        setConversations(convosWithDetails);

        // If user param is provided, create or open conversation
        if (selectedUserId && selectedUserId !== user.id) {
          const existingConvo = convosWithDetails.find(
            (c) => c.participant_1 === selectedUserId || c.participant_2 === selectedUserId
          );

          if (existingConvo) {
            setSelectedConversation(existingConvo);
          } else {
            // Create new conversation
            const { data: newConvo, error } = await supabase
              .from('conversations')
              .insert({
                participant_1: user.id,
                participant_2: selectedUserId,
              })
              .select()
              .single();

            if (!error && newConvo) {
              const { data: otherUser } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', selectedUserId)
                .single();

              setSelectedConversation({
                ...newConvo,
                other_user: otherUser || undefined,
              });
            }
          }
        }
      }

      setIsLoading(false);
    };

    fetchUser();
  }, [supabase, selectedUserId]);

  useEffect(() => {
    if (selectedConversation && user) {
      const fetchMessages = async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation.id)
          .order('created_at', { ascending: true });

        setMessages(data || []);
      };

      fetchMessages();

      // Subscribe to new messages
      const channel = supabase
        .channel(`conversation:${selectedConversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation, supabase, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast.error(error.message);
    } else {
      setNewMessage('');

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);
    }

    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">{t('messages.noMessages')}</h3>
            <p className="mb-4 text-center text-muted-foreground">{t('messages.noMessagesDesc')}</p>
            <Button asChild>
              <Link href={`/${locale}/auth/signin?redirect=/messages`}>
                {t('auth.signIn')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] px-0 py-4">
      <div className="flex h-full overflow-hidden rounded-lg border md:mx-4 md:shadow-lg">
        {/* Conversations List */}
        <div
          className={`w-full flex-col border-r md:w-80 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}
        >
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">{t('messages.title')}</h2>
          </div>
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('messages.noMessages')}</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConversation(convo)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${
                      selectedConversation?.id === convo.id ? 'bg-muted' : ''
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={convo.other_user?.avatar_url || undefined} />
                      <AvatarFallback>
                        {convo.other_user?.name?.charAt(0) ||
                         convo.other_user?.company_name?.charAt(0) ||
                         'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {convo.other_user?.name ||
                           convo.other_user?.company_name ||
                           locale === 'zh-HK' ? '用戶' : 'User'}
                        </span>
                        {convo.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(convo.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {convo.last_message && (
                        <p className="truncate text-sm text-muted-foreground">
                          {convo.last_message.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex flex-1 flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-4 border-b p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedConversation.other_user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedConversation.other_user?.name?.charAt(0) ||
                     selectedConversation.other_user?.company_name?.charAt(0) ||
                     'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {selectedConversation.other_user?.name ||
                     selectedConversation.other_user?.company_name ||
                     locale === 'zh-HK' ? '用戶' : 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.other_user?.role === 'freelancer'
                      ? t('auth.freelancer')
                      : t('auth.employer')}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender_id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <span
                          className={`mt-1 text-xs ${
                            message.sender_id === user.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" disabled>
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder={t('messages.typeMessage')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSending}
                  />
                  <Button size="icon" onClick={handleSend} disabled={isSending || !newMessage.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">{t('messages.startConversation')}</h3>
                <p className="text-muted-foreground">{t('messages.noMessagesDesc')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
