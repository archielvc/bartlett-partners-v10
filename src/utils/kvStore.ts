// =====================================================
// KEY-VALUE STORE (SUPABASE + LOCALSTORAGE FALLBACK)
// =====================================================

import { supabase } from './supabase/client';

const KV_PREFIX = 'bartlett_kv_';

// Helper for localStorage fallback
function getFromStorage<T>(key: string): T | null {
  try {
    const fullKey = `${KV_PREFIX}${key}`;
    const item = localStorage.getItem(fullKey);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

function saveToStorage<T>(key: string, value: T): boolean {
  try {
    const fullKey = `${KV_PREFIX}${key}`;
    localStorage.setItem(fullKey, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
}

export async function get<T = any>(key: string): Promise<T | null> {
  // Use Supabase if available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .maybeSingle();
      
      if (error) {
        console.error(`Error reading from Supabase (${key}):`, error);
        return getFromStorage<T>(key); // Fallback
      }
      
      return data?.setting_value || null;
    } catch (error) {
      console.error(`Error in KV get (${key}):`, error);
      return getFromStorage<T>(key);
    }
  }
  
  // Fallback to localStorage
  return getFromStorage<T>(key);
}

export async function set<T = any>(key: string, value: T): Promise<boolean> {
  // Use Supabase if available
  if (supabase) {
    try {
      const { error } = await supabase
        .from('global_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) {
        console.error(`Error writing to Supabase (${key}):`, error);
        return saveToStorage(key, value); // Fallback
      }
      
      return true;
    } catch (error) {
      console.error(`Error in KV set (${key}):`, error);
      return saveToStorage(key, value);
    }
  }
  
  // Fallback to localStorage
  return saveToStorage(key, value);
}

export async function del(key: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('global_settings')
        .delete()
        .eq('setting_key', key);
      
      if (error) {
        console.error(`Error deleting from Supabase (${key}):`, error);
      }
      return !error;
    } catch (error) {
      console.error(`Error in KV del (${key}):`, error);
      return false;
    }
  }
  
  try {
    const fullKey = `${KV_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    return false;
  }
}

export async function mget<T = any>(keys: string[]): Promise<(T | null)[]> {
  return Promise.all(keys.map(key => get<T>(key)));
}

export async function mset<T = any>(entries: Record<string, T>): Promise<boolean> {
  try {
    await Promise.all(
      Object.entries(entries).map(([key, value]) => set(key, value))
    );
    return true;
  } catch (error) {
    console.error('Error in mset:', error);
    return false;
  }
}

export async function mdel(keys: string[]): Promise<boolean> {
  try {
    await Promise.all(keys.map(key => del(key)));
    return true;
  } catch (error) {
    console.error('Error in mdel:', error);
    return false;
  }
}

export async function getByPrefix<T = any>(prefix: string): Promise<T[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('setting_value')
        .like('setting_key', `${prefix}%`);
      
      if (error) {
        console.error(`Error in getByPrefix (${prefix}):`, error);
        return [];
      }
      
      return (data || []).map(row => row.setting_value);
    } catch (error) {
      console.error(`Error in getByPrefix (${prefix}):`, error);
      return [];
    }
  }
  
  // localStorage fallback
  try {
    const fullPrefix = `${KV_PREFIX}${prefix}`;
    const results: T[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          results.push(JSON.parse(item));
        }
      }
    }
    
    return results;
  } catch (error) {
    return [];
  }
}

export async function clear(): Promise<boolean> {
  // Only clears localStorage keys, not Supabase
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KV_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing KV store:', error);
    return false;
  }
}