import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface CustomPrompt {
  id: string;
  name: string;
  prompt: string;
  createdAt: Date;
}

// Get current user
const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const saveCustomPrompt = async (name: string, prompt: string, promptId?: string): Promise<string> => {
  const user = await getCurrentUser();
  
  // For demo mode or when Supabase is not configured
  if (!user || !supabase) {
    const id = promptId || `prompt_${Date.now()}`;
    const promptData = {
      id,
      name,
      prompt,
      createdAt: new Date()
    };

    // Save to localStorage
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    const existingIndex = localPrompts.findIndex((p: CustomPrompt) => p.id === id);
    
    if (existingIndex >= 0) {
      localPrompts[existingIndex] = promptData;
    } else {
      localPrompts.push(promptData);
    }
    
    localStorage.setItem('craftly_custom_prompts', JSON.stringify(localPrompts));
    console.log('✅ Custom prompt saved to localStorage');
    return id;
  }

  const id = promptId || `prompt_${Date.now()}`;
  const promptData = {
    id,
    name,
    prompt,
    user_id: user.id,
    created_at: new Date().toISOString()
  };

  try {
    if (promptId) {
      // Update existing prompt
      const { error } = await supabase
        .from('custom_prompts')
        .update(promptData)
        .eq('id', promptId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      // Insert new prompt
      const { error } = await supabase
        .from('custom_prompts')
        .insert(promptData);
      
      if (error) throw error;
    }
    
    // Also save to localStorage for offline access
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    const existingIndex = localPrompts.findIndex((p: CustomPrompt) => p.id === id);
    
    if (existingIndex >= 0) {
      localPrompts[existingIndex] = { ...promptData, createdAt: new Date(promptData.created_at) };
    } else {
      localPrompts.push({ ...promptData, createdAt: new Date(promptData.created_at) });
    }
    
    localStorage.setItem('craftly_custom_prompts', JSON.stringify(localPrompts));
    
    console.log('✅ Custom prompt saved to Supabase');
    return id;
  } catch (error) {
    console.error('❌ Failed to save custom prompt to Supabase:', error);
    
    // Fallback to localStorage
    const promptData = { id, name, prompt, createdAt: new Date() };
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    const existingIndex = localPrompts.findIndex((p: CustomPrompt) => p.id === id);
    
    if (existingIndex >= 0) {
      localPrompts[existingIndex] = promptData;
    } else {
      localPrompts.push(promptData);
    }
    
    localStorage.setItem('craftly_custom_prompts', JSON.stringify(localPrompts));
    console.log('✅ Custom prompt saved to localStorage (fallback)');
    return id;
  }
};

export const loadCustomPrompts = async (): Promise<CustomPrompt[]> => {
  const user = await getCurrentUser();
  
  // For demo mode or when Supabase is not configured
  if (!user || !supabase) {
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    console.log('📱 Custom prompts loaded from localStorage');
    return localPrompts.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt)
    }));
  }

  try {
    const { data, error } = await supabase
      .from('custom_prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const prompts = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      prompt: p.prompt,
      createdAt: new Date(p.created_at)
    }));
    
    if (prompts.length > 0) {
      // Update localStorage with fresh data
      localStorage.setItem('craftly_custom_prompts', JSON.stringify(prompts));
      console.log('✅ Custom prompts loaded from Supabase');
      return prompts;
    }
    
    // Fallback to localStorage if no data in Supabase
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    console.log('📱 Custom prompts loaded from localStorage (fallback)');
    return localPrompts.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt)
    }));
  } catch (error) {
    console.error('❌ Failed to load custom prompts from Supabase:', error);
    
    // Fallback to localStorage
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    console.log('📱 Custom prompts loaded from localStorage (fallback)');
    return localPrompts.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt)
    }));
  }
};

export const deleteCustomPrompt = async (promptId: string): Promise<void> => {
  const user = await getCurrentUser();
  
  // For demo mode or when Supabase is not configured
  if (!user || !supabase) {
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    const updatedPrompts = localPrompts.filter((p: CustomPrompt) => p.id !== promptId);
    localStorage.setItem('craftly_custom_prompts', JSON.stringify(updatedPrompts));
    console.log('✅ Custom prompt deleted from localStorage');
    return;
  }

  try {
    const { error } = await supabase
      .from('custom_prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // Delete from localStorage too
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    const updatedPrompts = localPrompts.filter((p: CustomPrompt) => p.id !== promptId);
    localStorage.setItem('craftly_custom_prompts', JSON.stringify(updatedPrompts));
    
    console.log('✅ Custom prompt deleted from Supabase');
  } catch (error) {
    console.error('❌ Failed to delete custom prompt from Supabase:', error);
    
    // Fallback: delete from localStorage only
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    const updatedPrompts = localPrompts.filter((p: CustomPrompt) => p.id !== promptId);
    localStorage.setItem('craftly_custom_prompts', JSON.stringify(updatedPrompts));
    console.log('✅ Custom prompt deleted from localStorage (fallback)');
  }
};