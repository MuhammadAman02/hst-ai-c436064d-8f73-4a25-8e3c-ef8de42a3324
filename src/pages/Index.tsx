import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { ApiKeyInput } from '@/components/ApiKeyInput';

const Index = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasValidKey, setHasValidKey] = useState<boolean>(false);

  console.log('Index component rendered, hasValidKey:', hasValidKey);

  const handleApiKeySubmit = (key: string) => {
    console.log('API key submitted, length:', key.length);
    setApiKey(key);
    setHasValidKey(true);
  };

  const handleResetApiKey = () => {
    console.log('Resetting API key');
    setApiKey('');
    setHasValidKey(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!hasValidKey ? (
        <ApiKeyInput onSubmit={handleApiKeySubmit} />
      ) : (
        <ChatInterface apiKey={apiKey} onResetApiKey={handleResetApiKey} />
      )}
    </div>
  );
};

export default Index;