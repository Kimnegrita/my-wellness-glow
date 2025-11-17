import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  description?: string;
  onClick?: () => void;
}

export const DashboardCard = ({ icon, title, value, description, onClick }: DashboardCardProps) => {
  return (
    <Card 
      className="p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.03] bg-gradient-to-br from-card to-primary/5 border-primary/20 backdrop-blur group"
      onClick={onClick}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg group-hover:shadow-xl transition-shadow">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{title}</h3>
          <p className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent mb-1">
            {value}
          </p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
    </Card>
  );
};
