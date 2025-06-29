import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

// Get current user
const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const saveAPIKey = async (
  modelId: string,
  name: string,
  provider: string,
  apiKey: string,
  endpoint?: string
): Promise<string> => {
  const user = await getCurrentUser();
  
  const id = `${modelId}_${Date.now()}`;
  const modelData = {
    id,
    name,
    provider,
    apiKey: encryptApiKey(apiKey),
    endpoint,
    isActive: true,
    createdAt: new Date()
  };

  // For demo mode or when Supabase is not configured
  if (!user || !supabase) {
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    localModels.push(modelData);
    localStorage.setItem('craftly_ai_models', JSON.stringify(localModels));
    console.log('✅ AI model saved to localStorage');
    return id;
  }

  try {
    const { error } = await supabase
      .from('ai_models')
      .insert({
        id,
        name,
        provider,
        api_key: encryptApiKey(apiKey),
        endpoint,
        is_active: true,
        user_id: user.id,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Also save to localStorage for offline access
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    localModels.push(modelData);
    localStorage.setItem('craftly_ai_models', JSON.stringify(localModels));
    
    console.log('✅ AI model saved to Supabase');
    return id;
  } catch (error) {
    console.error('❌ Failed to save AI model to Supabase:', error);
    
    // Fallback to localStorage
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    localModels.push(modelData);
    localStorage.setItem('craftly_ai_models', JSON.stringify(localModels));
    console.log('✅ AI model saved to localStorage (fallback)');
    return id;
  }
};

export const loadAPIKeys = async (): Promise<AIModel[]> => {
  const user = await getCurrentUser();
  
  // For demo mode or when Supabase is not configured
  if (!user || !supabase) {
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    console.log('📱 AI models loaded from localStorage');
    return localModels.map((m: any) => ({
      ...m,
      apiKey: decryptApiKey(m.apiKey),
      createdAt: new Date(m.createdAt)
    }));
  }

  try {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const models = data.map((m: any) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      apiKey: decryptApiKey(m.api_key),
      endpoint: m.endpoint,
      isActive: m.is_active,
      createdAt: new Date(m.created_at)
    }));
    
    if (models.length > 0) {
      // Update localStorage with fresh data
      localStorage.setItem('craftly_ai_models', JSON.stringify(models.map(m => ({
        ...m,
        apiKey: encryptApiKey(m.apiKey)
      }))));
      console.log('✅ AI models loaded from Supabase');
      return models;
    }
    
    // Fallback to localStorage if no data in Supabase
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    console.log('📱 AI models loaded from localStorage (fallback)');
    return localModels.map((m: any) => ({
      ...m,
      apiKey: decryptApiKey(m.apiKey),
      createdAt: new Date(m.createdAt)
    }));
  } catch (error) {
    console.error('❌ Failed to load AI models from Supabase:', error);
    
    // Fallback to localStorage
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    console.log('📱 AI models loaded from localStorage (fallback)');
    return localModels.map((m: any) => ({
      ...m,
      apiKey: decryptApiKey(m.apiKey),
      createdAt: new Date(m.createdAt)
    }));
  }
};

export const deleteAPIKey = async (modelId: string): Promise<void> => {
  const user = await getCurrentUser();
  
  // For demo mode or when Supabase is not configured
  if (!user || !supabase) {
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    const updatedModels = localModels.filter((m: AIModel) => m.id !== modelId);
    localStorage.setItem('craftly_ai_models', JSON.stringify(updatedModels));
    console.log('✅ AI model deleted from localStorage');
    return;
  }

  try {
    const { error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', modelId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // Delete from localStorage too
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    const updatedModels = localModels.filter((m: AIModel) => m.id !== modelId);
    localStorage.setItem('craftly_ai_models', JSON.stringify(updatedModels));
    
    console.log('✅ AI model deleted from Supabase');
  } catch (error) {
    console.error('❌ Failed to delete AI model from Supabase:', error);
    
    // Fallback: delete from localStorage only
    const localModels = JSON.parse(localStorage.getItem('craftly_ai_models') || '[]');
    const updatedModels = localModels.filter((m: AIModel) => m.id !== modelId);
    localStorage.setItem('craftly_ai_models', JSON.stringify(updatedModels));
    console.log('✅ AI model deleted from localStorage (fallback)');
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