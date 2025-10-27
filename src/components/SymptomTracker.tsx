import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const commonSymptoms = [
  "Sofocos",
  "Cambios de humor",
  "Fatiga",
  "Insomnio",
  "Dolor de cabeza",
  "Dolor articular",
  "Cambios en el apetito",
  "Ansiedad"
];

export const SymptomTracker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = () => {
    toast.success("Síntomas registrados correctamente");
    setSelectedSymptoms([]);
    setNotes("");
  };

  return (
    <Card className="p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h2 className="text-2xl font-bold mb-6 text-foreground">Registrar Síntomas</h2>
      
      <div className="space-y-4 mb-6">
        <Label className="text-base font-semibold text-foreground">Síntomas de hoy</Label>
        <div className="grid grid-cols-2 gap-4">
          {commonSymptoms.map((symptom) => (
            <div key={symptom} className="flex items-center space-x-2">
              <Checkbox
                id={symptom}
                checked={selectedSymptoms.includes(symptom)}
                onCheckedChange={() => handleSymptomToggle(symptom)}
              />
              <Label
                htmlFor={symptom}
                className="text-sm font-normal cursor-pointer text-foreground"
              >
                {symptom}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <Label htmlFor="notes" className="text-base font-semibold text-foreground">
          Notas adicionales
        </Label>
        <Textarea
          id="notes"
          placeholder="Describe cómo te sientes hoy..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <Button 
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
      >
        Guardar Registro
      </Button>
    </Card>
  );
};
