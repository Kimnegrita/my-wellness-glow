import { DashboardCard } from "@/components/DashboardCard";
import { SymptomTracker } from "@/components/SymptomTracker";
import { CycleCalendar } from "@/components/CycleCalendar";
import { WellnessTips } from "@/components/WellnessTips";
import { Activity, Calendar, Heart, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mi Bienestar
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">Tu compañera de salud y autocuidado</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            icon={<Activity className="h-6 w-6" />}
            title="Síntomas Registrados"
            value="5"
            description="Esta semana"
          />
          <DashboardCard
            icon={<Calendar className="h-6 w-6" />}
            title="Próximo Ciclo"
            value="12 días"
            description="Estimación basada en tu historial"
          />
          <DashboardCard
            icon={<Heart className="h-6 w-6" />}
            title="Racha de Autocuidado"
            value="7 días"
            description="¡Sigue así!"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SymptomTracker />
          <CycleCalendar />
        </div>

        {/* Wellness Tips */}
        <WellnessTips />
      </div>
    </div>
  );
};

export default Index;
