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
      className="p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-card border-border"
      onClick={onClick}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
    </Card>
  );
};
