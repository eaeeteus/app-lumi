"use client";

import { useEffect, useState } from "react";
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
  TrendingUp,
  Target,
  Clock,
  LogOut,
  Settings,
  Bell,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { getStats } from "@/lib/database";
import { useTheme } from "next-themes";

interface Stats {
  tasksCompleted: number;
  contentsCreated: number;
  activeGoals: number;
  hoursEconomized: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    tasksCompleted: 0,
    contentsCreated: 0,
    activeGoals: 0,
    hoursEconomized: 0,
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      
      // Carregar estatísticas do usuário
      const userStats = await getStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const pillars = [
    {
      id: "conteudo",
      name: "Conteúdo",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      description: "Crie textos, legendas e roteiros profissionais",
    },
    {
      id: "produtividade",
      name: "Produtividade",
      icon: CheckSquare,
      color: "from-blue-500 to-cyan-500",
      description: "Organize rotinas, listas e metas",
    },
    {
      id: "estudo",
      name: "Estudo",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
      description: "Resumos, mapas mentais e simulados",
    },
    {
      id: "negocios",
      name: "Negócios",
      icon: Briefcase,
      color: "from-orange-500 to-red-500",
      description: "Mensagens de venda e gestão empresarial",
    },
    {
      id: "vida",
      name: "Vida Real",
      icon: Home,
      color: "from-indigo-500 to-purple-500",
      description: "Organização pessoal e planejamento diário",
    },
  ];

  const statsDisplay = [
    { label: "Tarefas Concluídas", value: stats.tasksCompleted.toString(), icon: CheckSquare, color: "text-blue-600 dark:text-blue-400" },
    { label: "Conteúdos Criados", value: stats.contentsCreated.toString(), icon: FileText, color: "text-purple-600 dark:text-purple-400" },
    { label: "Metas Ativas", value: stats.activeGoals.toString(), icon: Target, color: "text-green-600 dark:text-green-400" },
    { label: "Horas Economizadas", value: `${stats.hoursEconomized}h`, icon: Clock, color: "text-orange-600 dark:text-orange-400" },
  ];

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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Olá, {user?.user_metadata?.name || "Usuário"}!
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Bem-vindo de volta à Lumi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="outline" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificações</span>
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configurações</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
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

        {/* Pillars Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Seus Pilares</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <Card
                key={pillar.id}
                className="group p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <pillar.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{pillar.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{pillar.description}</p>
                <Button
                  className="w-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-900 dark:text-white border-0"
                  variant="outline"
                >
                  Acessar
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Pronta para começar?</h3>
              <p className="text-blue-100">
                A Lumi está aqui para tornar sua rotina mais produtiva e organizada.
              </p>
            </div>
            <Button
              onClick={() => router.push("/")}
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl px-8 py-6 text-lg font-semibold"
            >
              Conversar com Lumi
              <MessageSquare className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
