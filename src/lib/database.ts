import { supabase, isSupabaseConfigured } from './supabase';

// ID do usuário de teste (em produção, usar autenticação real)
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// Função auxiliar para garantir que o usuário existe
async function ensureUserExists(userId: string) {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Usuário não existe, criar
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, name: 'Usuário Teste', email: 'teste@lumi.com' }]);

      if (insertError) {
        console.error('Erro ao criar usuário:', insertError);
        return false;
      }
      return true;
    }

    return !error;
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return false;
  }
}

// Obter estatísticas do usuário
export async function getStats(userId: string = TEST_USER_ID) {
  if (!isSupabaseConfigured()) {
    // Retornar dados simulados se Supabase não estiver configurado
    return {
      tasksCompleted: 12,
      contentsCreated: 8,
      activeGoals: 3,
      hoursEconomized: 24,
    };
  }

  try {
    await ensureUserExists(userId);

    // Contar tarefas completadas
    const { count: tasksCompleted } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Contar conteúdos criados
    const { count: contentsCreated } = await supabase
      .from('contents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Contar metas ativas
    const { count: activeGoals } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Calcular horas economizadas (estimativa: 2h por tarefa completada)
    const hoursEconomized = (tasksCompleted || 0) * 2;

    return {
      tasksCompleted: tasksCompleted || 0,
      contentsCreated: contentsCreated || 0,
      activeGoals: activeGoals || 0,
      hoursEconomized,
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    // Retornar dados simulados em caso de erro
    return {
      tasksCompleted: 0,
      contentsCreated: 0,
      activeGoals: 0,
      hoursEconomized: 0,
    };
  }
}

// Criar nova conversa
export async function createConversation(
  userId: string = TEST_USER_ID,
  pillar?: string,
  title?: string
) {
  if (!isSupabaseConfigured()) {
    return { id: 'temp-conversation-id', error: null };
  }

  try {
    await ensureUserExists(userId);

    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: userId, pillar, title }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    return { data: null, error };
  }
}

// Salvar mensagem
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, role, content }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return { data: null, error };
  }
}

// Salvar conteúdo gerado
export async function saveContent(
  userId: string = TEST_USER_ID,
  pillar: string,
  type: string,
  title: string,
  content: string,
  metadata?: any
) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  try {
    await ensureUserExists(userId);

    const { data, error } = await supabase
      .from('contents')
      .insert([{ user_id: userId, pillar, type, title, content, metadata }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Erro ao salvar conteúdo:', error);
    return { data: null, error };
  }
}

// Criar meta
export async function createGoal(
  userId: string = TEST_USER_ID,
  title: string,
  description?: string,
  pillar?: string,
  targetDate?: string
) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  try {
    await ensureUserExists(userId);

    const { data, error } = await supabase
      .from('goals')
      .insert([{ user_id: userId, title, description, pillar, target_date: targetDate }])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return { data: null, error };
  }
}

// Criar tarefa
export async function createTask(
  userId: string = TEST_USER_ID,
  title: string,
  description?: string,
  pillar?: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
  dueDate?: string,
  goalId?: string
) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  try {
    await ensureUserExists(userId);

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          title,
          description,
          pillar,
          priority,
          due_date: dueDate,
          goal_id: goalId,
        },
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return { data: null, error };
  }
}

// Atualizar status da tarefa
export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  try {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return { data: null, error };
  }
}

// Obter tarefas do usuário
export async function getTasks(
  userId: string = TEST_USER_ID,
  status?: string,
  pillar?: string
) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (pillar) {
      query = query.eq('pillar', pillar);
    }

    const { data, error } = await query;

    return { data: data || [], error };
  } catch (error) {
    console.error('Erro ao obter tarefas:', error);
    return { data: [], error };
  }
}

// Obter metas do usuário
export async function getGoals(
  userId: string = TEST_USER_ID,
  status?: string,
  pillar?: string
) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  try {
    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (pillar) {
      query = query.eq('pillar', pillar);
    }

    const { data, error } = await query;

    return { data: data || [], error };
  } catch (error) {
    console.error('Erro ao obter metas:', error);
    return { data: [], error };
  }
}

// Obter conteúdos do usuário
export async function getContents(
  userId: string = TEST_USER_ID,
  pillar?: string,
  type?: string
) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  try {
    let query = supabase
      .from('contents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (pillar) {
      query = query.eq('pillar', pillar);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    return { data: data || [], error };
  } catch (error) {
    console.error('Erro ao obter conteúdos:', error);
    return { data: [], error };
  }
}
