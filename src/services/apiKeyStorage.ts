import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  endpoint?: string;
  isActive: boolean;
  createdAt: Date;
}

// Simple encryption for storage (in production, use proper encryption)
const encryptApiKey = (apiKey: string): string => {
  return btoa(apiKey); // Base64 encoding (not secure, just obfuscation)
};

const decryptApiKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey);
  } catch {
    return encryptedKey; // Return as-is if decryption fails
  }
};

export const saveAPIKey = async (
  modelId: string,
  name: string,
  provider: string,
  apiKey: string,
  endpoint?: string
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const id = `${modelId}_${Date.now()}`;
  const modelData = {
    id,
    name,
    provider,
    apiKey: encryptApiKey(apiKey),
    endpoint,
    isActive: true,
    createdAt: new Date(),
    userId: user.uid
  };

  try {
    const modelRef = doc(db, 'aiModels', `${user.uid}_${id}`);
    await setDoc(modelRef, modelData);
    
    // Also save to localStorage for offline access (with encryption)
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    localModels.push(modelData);
    localStorage.setItem('craftly_ai_models', JSON.stringify(localModels));
    
    console.log('✅ AI model saved');
    return id;
  } catch (error) {
    console.error('❌ Failed to save AI model:', error);
    throw error;
  }
};

export const loadAPIKeys = async (): Promise<AIModel[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    // Try to load from Firestore first
    const modelsRef = collection(db, 'aiModels');
    const snapshot = await getDocs(modelsRef);
    const models: AIModel[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === user.uid) {
        models.push({
          id: data.id,
          name: data.name,
          provider: data.provider,
          apiKey: decryptApiKey(data.apiKey),
          endpoint: data.endpoint,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate()
        });
      }
    });
    
    if (models.length > 0) {
      // Update localStorage with fresh data
      localStorage.setItem('craftly_ai_models', JSON.stringify(models.map(m => ({
        ...m,
        apiKey: encryptApiKey(m.apiKey)
      }))));
      console.log('✅ AI models loaded from Firestore');
      return models;
    }
    
    // Fallback to localStorage
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    console.log('📱 AI models loaded from localStorage');
    return localModels.map((m: any) => ({
      ...m,
      apiKey: decryptApiKey(m.apiKey),
      createdAt: new Date(m.createdAt)
    }));
  } catch (error) {
    console.error('❌ Failed to load AI models:', error);
    
    // Fallback to localStorage
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    return localModels.map((m: any) => ({
      ...m,
      apiKey: decryptApiKey(m.apiKey),
      createdAt: new Date(m.createdAt)
    }));
  }
};

export const deleteAPIKey = async (modelId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    // Delete from Firestore
    const modelRef = doc(db, 'aiModels', `${user.uid}_${modelId}`);
    await deleteDoc(modelRef);
    
    // Delete from localStorage
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    const updatedModels = localModels.filter((m: AIModel) => m.id !== modelId);
    localStorage.setItem('craftly_ai_models', JSON.stringify(updatedModels));
    
    console.log('✅ AI model deleted');
  } catch (error) {
    console.error('❌ Failed to delete AI model:', error);
    throw error;
  }
};

export const testAPIConnection = async (
  provider: string,
  apiKey: string,
  endpoint?: string
): Promise<boolean> => {
  try {
    switch (provider.toLowerCase()) {
      case 'google':
        // Test Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        return response.ok;
        
      case 'openai':
        // Test OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return openaiResponse.ok;
        
      case 'anthropic':
        // Test Anthropic API
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        return anthropicResponse.status !== 401; // 401 means invalid API key
        
      case 'custom':
        // Test custom endpoint
        if (!endpoint) return false;
        const customResponse = await fetch(`${endpoint}/models`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return customResponse.ok;
        
      default:
        return false;
    }
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};