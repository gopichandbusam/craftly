import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

export interface CustomPrompt {
  id: string;
  name: string;
  prompt: string;
  createdAt: Date;
}

export const saveCustomPrompt = async (name: string, prompt: string, promptId?: string): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const id = promptId || `prompt_${Date.now()}`;
  const promptData = {
    id,
    name,
    prompt,
    createdAt: new Date(),
    userId: user.uid
  };

  try {
    const promptRef = doc(db, 'customPrompts', `${user.uid}_${id}`);
    await setDoc(promptRef, promptData);
    
    // Also save to localStorage for offline access
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    const existingIndex = localPrompts.findIndex((p: CustomPrompt) => p.id === id);
    
    if (existingIndex >= 0) {
      localPrompts[existingIndex] = promptData;
    } else {
      localPrompts.push(promptData);
    }
    
    localStorage.setItem('craftly_custom_prompts', JSON.stringify(localPrompts));
    
    console.log('✅ Custom prompt saved');
    return id;
  } catch (error) {
    console.error('❌ Failed to save custom prompt:', error);
    throw error;
  }
};

export const loadCustomPrompts = async (): Promise<CustomPrompt[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    // Try to load from Firestore first
    const promptsRef = collection(db, 'customPrompts');
    const snapshot = await getDocs(promptsRef);
    const prompts: CustomPrompt[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === user.uid) {
        prompts.push({
          id: data.id,
          name: data.name,
          prompt: data.prompt,
          createdAt: data.createdAt.toDate()
        });
      }
    });
    
    if (prompts.length > 0) {
      // Update localStorage with fresh data
      localStorage.setItem('craftly_custom_prompts', JSON.stringify(prompts));
      console.log('✅ Custom prompts loaded from Firestore');
      return prompts;
    }
    
    // Fallback to localStorage
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    console.log('📱 Custom prompts loaded from localStorage');
    return localPrompts.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt)
    }));
  } catch (error) {
    console.error('❌ Failed to load custom prompts:', error);
    
    // Fallback to localStorage
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    return localPrompts.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt)
    }));
  }
};

export const deleteCustomPrompt = async (promptId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    // Delete from Firestore
    const promptRef = doc(db, 'customPrompts', `${user.uid}_${promptId}`);
    await deleteDoc(promptRef);
    
    // Delete from localStorage
    const localPrompts = JSON.parse(localStorage.getItem('craftly_custom_prompts') || '[]');
    const updatedPrompts = localPrompts.filter((p: CustomPrompt) => p.id !== promptId);
    localStorage.setItem('craftly_custom_prompts', JSON.stringify(updatedPrompts));
    
    console.log('✅ Custom prompt deleted');
  } catch (error) {
    console.error('❌ Failed to delete custom prompt:', error);
    throw error;
  }
};