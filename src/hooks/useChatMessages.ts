import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Message } from '@/components/ChatInterface';
import OpenAI from 'openai';

export const useChatMessages = (
  apiKey: string,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const [isLoading, setIsLoading] = useState(false);

  console.log('useChatMessages hook initialized');

  const sendMessage = useCallback(async (content: string) => {
    console.log('sendMessage called with content:', content);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Initializing OpenAI client');
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const chatMessages = [...messages, userMessage].map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      console.log('Sending request to OpenAI with', chatMessages.length, 'messages');

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      console.log('Received response from OpenAI');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      let errorMessage = 'Failed to get response from AI. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('insufficient_quota')) {
          errorMessage = 'API quota exceeded. Please check your OpenAI account.';
        }
      }
      
      toast.error(errorMessage);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, messages, setMessages]);

  return { sendMessage, isLoading };
};