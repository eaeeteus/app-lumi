"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Sparkles, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  Briefcase, 
  Home,
  MessageSquare,
  Plus,
  TrendingUp,
  Target,
  Clock,
  Zap,
  Brain,
  Send,
  Mic,
  Paperclip,
  MoreVertical,
  Settings,
  User,
  Bell,
  Search,
  Loader2,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStats } from "@/lib/database";
import { useTheme } from "next-themes";

type Pillar = "conteudo" | "produtividade" | "estudo" | "negocios" | "vida";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Stats {
  tasksCompleted: number;
  contentsCreated: number;
  activeGoals: number;
  hoursEconomized: number;
}

export default function LumiApp() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activePillar, setActivePillar] = useState<Pillar | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou a Lumi, sua assistente inteligente. Estou aqui para ajudar você em tudo que precisar. Como posso te ajudar hoje?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    tasksCompleted: 0,
    contentsCreated: 0,
    activeGoals: 0,
    hoursEconomized: 0,
  });

  // Fix hydration - só renderiza tema após montar no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar autenticação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      loadStats(user.id);
    }
  };

  const loadStats = async (userId: string) => {
    try {
      const data = await getStats(userId);
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const pillars = [
    {
      id: "conteudo" as Pillar,
      name: "Conteúdo",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      description: "Crie textos, legendas e roteiros profissionais",
      features: ["Legendas para redes sociais", "Roteiros de vídeo", "Calendário editorial", "Variações de conteúdo"],
    },
    {
      id: "produtividade" as Pillar,
      name: "Produtividade",
      icon: CheckSquare,
      color: "from-blue-500 to-cyan-500",
      description: "Organize rotinas, listas e metas",
      features: ["Listas de tarefas", "Rotinas personalizadas", "Lembretes inteligentes", "Planos semanais"],
    },
    {
      id: "estudo" as Pillar,
      name: "Estudo",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
      description: "Resumos, mapas mentais e simulados",
      features: ["Resumos automáticos", "Mapas mentais", "Simulados", "Acompanhamento de progresso"],
    },
    {
      id: "negocios" as Pillar,
      name: "Negócios",
      icon: Briefcase,
      color: "from-orange-500 to-red-500",
      description: "Mensagens de venda e gestão empresarial",
      features: ["Scripts de vendas", "Precificação", "Contratos básicos", "Atendimento ao cliente"],
    },
    {
      id: "vida" as Pillar,
      name: "Vida Real",
      icon: Home,
      color: "from-indigo-500 to-purple-500",
      description: "Organização pessoal e planejamento diário",
      features: ["Listas de compras", "Planejamento financeiro", "Organização pessoal", "Resumo de notícias"],
    },
  ];

  const statsDisplay = [
    { label: "Tarefas Concluídas", value: stats.tasksCompleted.toString(), icon: CheckSquare, color: "text-blue-600 dark:text-blue-400" },
    { label: "Conteúdos Criados", value: stats.contentsCreated.toString(), icon: FileText, color: "text-purple-600 dark:text-purple-400" },
    { label: "Metas Ativas", value: stats.activeGoals.toString(), icon: Target, color: "text-green-600 dark:text-green-400" },
    { label: "Horas Economizadas", value: `${stats.hoursEconomized}h`, icon: Clock, color: "text-orange-600 dark:text-orange-400" },
  ];

  const recentActivities = [
    { title: "Lista de compras criada", time: "Há 2 horas", pillar: "vida" },
    { title: "Roteiro de vídeo gerado", time: "Há 4 horas", pillar: "conteudo" },
    { title: "Meta semanal definida", time: "Ontem", pillar: "produtividade" },
    { title: "Resumo de estudo salvo", time: "Ontem", pillar: "estudo" },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const apiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      apiMessages.push({
        role: "user",
        content: inputMessage,
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          pillar: activePillar,
          userId: user?.id,
        }),
      });

      // Verificar Content-Type da resposta
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = "Erro ao processar mensagem";
        
        // Se a resposta for JSON, tenta extrair a mensagem de erro
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (jsonError) {
            console.error("Erro ao fazer parse do JSON de erro:", jsonError);
          }
        } else {
          // Se não for JSON (ex: HTML de erro 500), mostra mensagem genérica
          const errorText = await response.text();
          console.error("Resposta não-JSON da API:", errorText.substring(0, 200));
          
          if (response.status === 500) {
            errorMessage = "Erro no servidor. Verifique se a variável OPENAI_API_KEY está configurada corretamente.";
          } else if (response.status === 404) {
            errorMessage = "Rota da API não encontrada. Verifique se /api/chat existe.";
          } else {
            errorMessage = `Erro ${response.status}: O servidor retornou uma resposta inválida.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Verificar se a resposta de sucesso é JSON
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Resposta de sucesso não é JSON:", responseText.substring(0, 200));
        throw new Error("A API retornou uma resposta inválida (não é JSON). Verifique os logs do servidor.");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (user) {
        loadStats(user.id);
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showChat) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Lumi</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Assistente Inteligente</p>
              </div>
            </div>
            <Button
              onClick={() => setShowChat(false)}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Home className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-3">
                Pilares
              </p>
              {pillars.map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activePillar === pillar.id
                      ? "bg-gradient-to-r " + pillar.color + " text-white shadow-lg"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <pillar.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{pillar.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-3">
                Histórico Recente
              </p>
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      {user.user_metadata?.name?.[0] || user.email?.[0].toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user.user_metadata?.name || user.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Plano Premium</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => router.push("/dashboard")}
                  >
                    <Settings className="w-4 h-4" />
                    Config
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                Fazer Login
              </Button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Lumi</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Online e pronta para ajudar</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mounted && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar
                    className={`w-10 h-10 ${
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-blue-500 to-purple-600"
                        : "bg-gradient-to-br from-slate-600 to-slate-800"
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      {message.role === "assistant" ? <Sparkles className="w-5 h-5" /> : user?.user_metadata?.name?.[0] || "U"}
                    </div>
                  </Avatar>
                  <div
                    className={`flex-1 max-w-2xl ${
                      message.role === "user" ? "flex justify-end" : ""
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl ${
                        message.role === "assistant"
                          ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "assistant" ? "text-slate-400" : "text-blue-100"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </Avatar>
                  <div className="flex-1 max-w-2xl">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <p className="text-sm text-slate-600 dark:text-slate-300">Lumi está pensando...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6">
            <div className="max-w-4xl mx-auto">
              {activePillar && (
                <div className="mb-4 flex items-center gap-2">
                  <Badge
                    className={`bg-gradient-to-r ${
                      pillars.find((p) => p.id === activePillar)?.color
                    } text-white border-0`}
                  >
                    {pillars.find((p) => p.id === activePillar)?.name}
                  </Badge>
                  <button
                    onClick={() => setActivePillar(null)}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Limpar contexto
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="shrink-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Digite sua mensagem para a Lumi..."
                    className="pr-12 h-12 rounded-2xl border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="shrink-0 h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
                A Lumi usa IA avançada para entender e responder suas solicitações
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lumi</h1>
                <p className="text-slate-600 dark:text-slate-400">Seu assistente inteligente completo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              )}
              {user ? (
                <>
                  <Button variant="outline" className="gap-2">
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notificações</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => router.push("/dashboard")}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Perfil</span>
                  </Button>
                  <Button
                    onClick={() => setShowChat(true)}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Conversar com Lumi
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                  >
                    Entrar
                  </Button>
                  <Button
                    onClick={() => router.push("/login")}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    Começar Grátis
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsDisplay.map((stat, index) => (
              <Card
                key={index}
                className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Pillars Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pilares da Lumi</h2>
            <Button variant="ghost" className="gap-2 text-slate-600 dark:text-slate-400">
              Ver todos
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <Card
                key={pillar.id}
                className="group p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setActivePillar(pillar.id);
                  setShowChat(true);
                }}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <pillar.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{pillar.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{pillar.description}</p>
                <div className="space-y-2">
                  {pillar.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-900 dark:text-white border-0"
                  variant="outline"
                >
                  Começar agora
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Atividades Recentes</h3>
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                  Ver todas
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                        pillars.find((p) => p.id === activity.pillar)?.color
                      } flex items-center justify-center`}
                    >
                      {(() => {
                        const Icon = pillars.find((p) => p.id === activity.pillar)?.icon;
                        return Icon ? <Icon className="w-5 h-5 text-white" /> : null;
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{activity.time}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start gap-3 h-auto py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  onClick={() => {
                    setActivePillar("conteudo");
                    setShowChat(true);
                  }}
                >
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Criar Conteúdo</p>
                    <p className="text-xs opacity-90">Legendas, posts e roteiros</p>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-auto py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  onClick={() => {
                    setActivePillar("produtividade");
                    setShowChat(true);
                  }}
                >
                  <CheckSquare className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Nova Lista</p>
                    <p className="text-xs opacity-90">Tarefas e lembretes</p>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-auto py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  onClick={() => {
                    setActivePillar("estudo");
                    setShowChat(true);
                  }}
                >
                  <Brain className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Resumir Conteúdo</p>
                    <p className="text-xs opacity-90">Estudos e revisões</p>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-auto py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  onClick={() => {
                    setActivePillar("negocios");
                    setShowChat(true);
                  }}
                >
                  <Briefcase className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Script de Vendas</p>
                    <p className="text-xs opacity-90">Mensagens profissionais</p>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Footer CTA */}
        <Card className="mt-8 p-8 bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Pronta para revolucionar seu dia?</h3>
              <p className="text-blue-100">
                A Lumi está aqui para tornar sua rotina mais produtiva, criativa e organizada.
              </p>
            </div>
            <Button
              onClick={() => user ? setShowChat(true) : router.push("/login")}
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl px-8 py-6 text-lg font-semibold"
            >
              {user ? "Começar agora" : "Criar Conta Grátis"}
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
