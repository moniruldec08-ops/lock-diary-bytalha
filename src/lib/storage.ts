import { supabase } from "@/integrations/supabase/client";
import * as localDb from "./db";

export type StorageMode = 'local' | 'cloud';

// Get current storage mode
export async function getStorageMode(): Promise<StorageMode> {
  const mode = await localDb.getSetting('storageMode');
  return mode || 'local';
}

// Entry operations with automatic routing
export async function getAllEntries() {
  const mode = await getStorageMode();
  
  if (mode === 'cloud') {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return [];
    
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching cloud entries:', error);
      return [];
    }
    
    return data.map(entry => ({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || [],
      date: entry.date,
      createdAt: new Date(entry.created_at).getTime(),
      updatedAt: new Date(entry.updated_at).getTime(),
    }));
  }
  
  return localDb.getAllEntries();
}

export async function getEntry(id: string) {
  const mode = await getStorageMode();
  
  if (mode === 'cloud') {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) return undefined;
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      date: data.date,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  }
  
  return localDb.getEntry(id);
}

export async function addEntry(entry: Omit<localDb.DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) {
  const mode = await getStorageMode();
  
  if (mode === 'cloud') {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: session.session.user.id,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
        date: entry.date,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      date: data.date,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  }
  
  return localDb.addEntry(entry);
}

export async function updateEntry(id: string, updates: Partial<localDb.DiaryEntry>) {
  const mode = await getStorageMode();
  
  if (mode === 'cloud') {
    const { error } = await supabase
      .from('diary_entries')
      .update({
        title: updates.title,
        content: updates.content,
        mood: updates.mood,
        tags: updates.tags,
        date: updates.date,
      })
      .eq('id', id);
    
    if (error) throw error;
    return;
  }
  
  return localDb.updateEntry(id, updates);
}

export async function deleteEntry(id: string) {
  const mode = await getStorageMode();
  
  if (mode === 'cloud') {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return;
  }
  
  return localDb.deleteEntry(id);
}

// Migrate local data to cloud
export async function migrateToCloud() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) throw new Error('Not authenticated');
  
  const localEntries = await localDb.getAllEntries();
  
  for (const entry of localEntries) {
    await supabase.from('diary_entries').insert({
      user_id: session.session.user.id,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags,
      date: entry.date,
    });
  }
  
  await localDb.setSetting('storageMode', 'cloud');
}
