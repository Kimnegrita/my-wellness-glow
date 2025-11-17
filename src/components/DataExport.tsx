import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

export const DataExport = () => {
  const { user } = useAuth();

  const exportToCSV = async () => {
    if (!user) return;

    try {
      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false });

      if (error) throw error;

      if (!logs || logs.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }

      // Create CSV content
      const headers = [
        'Fecha',
        'Síntomas',
        'Entrada de Diario',
        'Periodo Iniciado',
        'Periodo Finalizado',
        'Patrones Emocionales',
        'Insights AI'
      ];

      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          format(new Date(log.log_date), 'yyyy-MM-dd'),
          `"${(log.symptoms || []).join('; ')}"`,
          `"${(log.journal_entry || '').replace(/"/g, '""')}"`,
          log.period_started ? 'Sí' : 'No',
          log.period_ended ? 'Sí' : 'No',
          `"${JSON.stringify(log.emotional_patterns || {}).replace(/"/g, '""')}"`,
          `"${(log.ai_insights || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `wellness-glow-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Datos exportados exitosamente");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Error al exportar datos");
    }
  };

  return (
    <Button
      onClick={exportToCSV}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      <FileSpreadsheet className="h-4 w-4" />
      Exportar Datos
    </Button>
  );
};
