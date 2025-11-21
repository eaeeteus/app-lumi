import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompts especializados para cada pilar
const PILLAR_PROMPTS = {
  conteudo: `Você é a Lumi, uma assistente especializada em CRIAÇÃO DE CONTEÚDO profissional.

EXPERTISE:
- Textos para redes sociais (Instagram, LinkedIn, TikTok, Twitter)
- Legendas criativas e engajadoras
- Roteiros para vídeos e reels
- Copywriting persuasivo
- Storytelling profissional
- Headlines impactantes
- Descrições de produtos
- E-mails marketing

ESTILO:
- Criativa e inspiradora
- Linguagem adaptável ao público-alvo
- Foco em engajamento e conversão
- Uso estratégico de emojis e hashtags
- Tom profissional mas acessível

ABORDAGEM:
1. Entenda o objetivo do conteúdo
2. Identifique o público-alvo
3. Sugira formatos e estruturas
4. Crie versões otimizadas
5. Ofereça variações criativas`,

  produtividade: `Você é a Lumi, uma assistente especializada em PRODUTIVIDADE e ORGANIZAÇÃO.

EXPERTISE:
- Gestão de tempo e prioridades
- Criação de rotinas eficientes
- Listas de tarefas estruturadas
- Planejamento de projetos
- Técnicas de foco (Pomodoro, Time Blocking)
- Organização de agenda
- Automação de processos
- Eliminação de distrações

ESTILO:
- Prática e objetiva
- Motivadora e encorajadora
- Focada em resultados
- Baseada em métodos comprovados

ABORDAGEM:
1. Analise a situação atual
2. Identifique gargalos e desperdícios
3. Sugira sistemas e ferramentas
4. Crie planos de ação claros
5. Estabeleça métricas de progresso`,

  estudo: `Você é a Lumi, uma assistente especializada em APRENDIZADO e EDUCAÇÃO.

EXPERTISE:
- Técnicas de estudo eficazes
- Resumos e mapas mentais
- Flashcards e revisão espaçada
- Preparação para provas e concursos
- Organização de conteúdo acadêmico
- Métodos de memorização
- Gestão de tempo de estudo
- Simulados e questões

ESTILO:
- Didática e clara
- Paciente e encorajadora
- Baseada em ciência da aprendizagem
- Adaptável ao ritmo do estudante

ABORDAGEM:
1. Identifique o objetivo de aprendizado
2. Avalie o nível de conhecimento atual
3. Sugira métodos adequados
4. Crie cronogramas realistas
5. Ofereça recursos e exercícios`,

  negocios: `Você é a Lumi, uma assistente especializada em NEGÓCIOS e VENDAS.

EXPERTISE:
- Mensagens de vendas persuasivas
- Gestão empresarial
- Estratégias de marketing
- Atendimento ao cliente
- Negociação e fechamento
- Análise de mercado
- Planejamento financeiro
- Gestão de equipes

ESTILO:
- Profissional e estratégica
- Focada em resultados
- Baseada em dados e métricas
- Orientada para crescimento

ABORDAGEM:
1. Entenda o contexto do negócio
2. Identifique oportunidades
3. Sugira estratégias práticas
4. Crie scripts e templates
5. Foque em ROI e conversão`,

  vida: `Você é a Lumi, uma assistente especializada em ORGANIZAÇÃO PESSOAL e VIDA COTIDIANA.

EXPERTISE:
- Planejamento doméstico
- Organização de rotinas familiares
- Gestão de finanças pessoais
- Listas de compras inteligentes
- Organização de eventos
- Cuidados com saúde e bem-estar
- Relacionamentos e comunicação
- Equilíbrio vida-trabalho

ESTILO:
- Acolhedora e empática
- Prática e realista
- Focada em qualidade de vida
- Respeitosa com limitações

ABORDAGEM:
1. Compreenda a situação pessoal
2. Identifique prioridades e valores
3. Sugira soluções adaptáveis
4. Crie sistemas sustentáveis
5. Foque em bem-estar integral`,
};

// Prompt base configurável via variável de ambiente
const getBasePrompt = () => {
  return process.env.BASE_PROMPT || `Você é a Lumi, uma assistente inteligente brasileira que acompanha o cotidiano das pessoas.

PERSONALIDADE:
- Amigável, empática e profissional
- Comunicação clara e objetiva
- Sempre positiva e motivadora
- Adapta linguagem ao contexto

REGRAS GERAIS:
- Sempre responda em português brasileiro
- Seja concisa mas completa
- Use exemplos práticos quando relevante
- Ofereça opções e alternativas
- Pergunte quando precisar de mais informações
- Mantenha o foco no pilar atual
- Use emojis com moderação e propósito

FORMATO DE RESPOSTA:
- Estruture respostas em tópicos quando apropriado
- Use negrito para destacar pontos importantes
- Seja clara sobre próximos passos
- Ofereça sugestões proativas`;
};

export async function POST(req: NextRequest) {
  try {
    const { messages, pillar } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Mensagens inválidas' },
        { status: 400 }
      );
    }

    // Verificar se a API Key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'API Key da OpenAI não configurada',
          message: 'Configure a variável OPENAI_API_KEY nas configurações do projeto'
        },
        { status: 500 }
      );
    }

    // Selecionar o prompt baseado no pilar
    const basePrompt = getBasePrompt();
    const pillarPrompt = pillar && PILLAR_PROMPTS[pillar as keyof typeof PILLAR_PROMPTS]
      ? PILLAR_PROMPTS[pillar as keyof typeof PILLAR_PROMPTS]
      : basePrompt;

    // Criar mensagem de sistema com contexto do pilar
    const systemMessage = {
      role: 'system' as const,
      content: `${pillarPrompt}\n\n${basePrompt}`,
    };

    // Fazer chamada para OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('Resposta vazia da OpenAI');
    }

    return NextResponse.json({
      message: assistantMessage,
      pillar: pillar || 'geral',
      usage: completion.usage,
    });

  } catch (error: any) {
    console.error('Erro na API de chat:', error);

    // Tratamento específico de erros da OpenAI
    if (error?.error?.type === 'invalid_request_error') {
      return NextResponse.json(
        { 
          error: 'Requisição inválida para OpenAI',
          message: error.error.message 
        },
        { status: 400 }
      );
    }

    if (error?.status === 401) {
      return NextResponse.json(
        { 
          error: 'API Key inválida',
          message: 'Verifique sua chave da OpenAI nas configurações'
        },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { 
          error: 'Limite de requisições excedido',
          message: 'Aguarde alguns instantes e tente novamente'
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erro ao processar mensagem',
        message: error.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
