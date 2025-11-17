import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, User, Calendar as CalendarIcon, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, pt } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function Profile() {
  const navigate = useNavigate();
  const { updateProfile, profile } = useAuth();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [language, setLanguage] = useState(profile?.language || 'es');
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>(
    profile?.last_period_date ? new Date(profile.last_period_date) : undefined
  );
  const [cycleLength, setCycleLength] = useState<number>(profile?.avg_cycle_length || 28);
  const [isIrregular, setIsIrregular] = useState(profile?.is_irregular || false);

  const handleSave = async () => {
    setLoading(true);

    try {
      console.log('Saving profile with language:', language);
      
      await updateProfile({
        name,
        language,
        last_period_date: lastPeriodDate 
          ? format(lastPeriodDate, 'yyyy-MM-dd')
          : null,
        avg_cycle_length: isIrregular ? null : cycleLength,
        is_irregular: isIrregular,
      });

      console.log('Profile saved, changing i18n language to:', language);
      // Force language change immediately after save
      await i18n.changeLanguage(language);

      toast.success(t('profile.saveSuccess'));
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(t('profile.saveError'));
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en':
        return enUS;
      case 'pt':
        return pt;
      default:
        return es;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.backToHome')}
        </Button>

        <Card className="shadow-elegant border-primary/20 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              <span className="text-gradient">{t('profile.title')}</span>
            </CardTitle>
            <CardDescription className="text-base">
              {t('profile.personalInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('profile.personalInfo')}
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  {t('profile.name')}
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('profile.namePlaceholder')}
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('profile.language')}
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="border-2">
                    <SelectValue placeholder={t('profile.selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('profile.languageNote')}
                </p>
              </div>
            </div>

            {/* Cycle Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {t('profile.cycleInfo')}
              </h3>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  {t('profile.lastPeriod')}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {lastPeriodDate ? (
                        format(lastPeriodDate, "PPP", { locale: getDateLocale() })
                      ) : (
                        <span>{t('profile.selectDate')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={lastPeriodDate}
                      onSelect={setLastPeriodDate}
                      disabled={(date) => date > new Date()}
                      locale={getDateLocale()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycle-length" className="text-base font-semibold">
                  {t('profile.avgCycleLength')}
                </Label>
                <Input
                  id="cycle-length"
                  type="number"
                  min={21}
                  max={35}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  disabled={isIrregular}
                  className="text-center text-lg font-semibold border-2"
                />
                <p className="text-xs text-muted-foreground">
                  {t('profile.irregularCycleDesc')}
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="irregular"
                  checked={isIrregular}
                  onCheckedChange={(checked) => setIsIrregular(checked as boolean)}
                />
                <label
                  htmlFor="irregular"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {t('profile.irregularCycle')}
                </label>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading || !name}
              className="w-full bg-gradient-primary hover:opacity-90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {loading ? t('common.loading') : t('common.save')}
              <Save className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
