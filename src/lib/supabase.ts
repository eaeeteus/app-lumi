import { createClient } from '@supabase/supabase-js';

// Valores padrão para desenvolvimento (permitir que o app funcione sem credenciais)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar se as credenciais estão configuradas
export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
  );
};

// Types para o banco de dados
export type Pillar = 'conteudo' | 'produtividade' | 'estudo' | 'negocios' | 'vida';

export interface User {
  id: string;
  email?: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  pillar?: Pillar;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Content {
  id: string;
  user_id: string;
  pillar?: Pillar;
  type?: string;
  title?: string;
  content: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  pillar?: Pillar;
  target_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  pillar?: Pillar;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
