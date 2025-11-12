import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Language } from "@/i18n/translations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1532635244-5c0565f92f67?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1501686637-b7aa9c48a882?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=200&h=200&fit=crop",
];

const Profile = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setShowLanguageModal(false);
    toast.success(
      language === "es"
        ? `Idioma cambiado a ${newLanguage === "es" ? "Español" : "English"}`
        : `Language changed to ${newLanguage === "es" ? "Español" : "English"}`
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success(t.profile.logout);
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleSaveChanges = () => {
    toast.success(t.profile.saveChanges + ' ✓');
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setShowAvatarModal(false);
    toast.success('Foto de perfil actualizada ✓');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm">
        <Link to="/" className="flex size-10 shrink-0 items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-surface dark:text-on-surface-dark">{t.common.back}</span>
        </Link>
        <h1 className="text-on-surface dark:text-on-surface-dark flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em]">
          {t.profile.title}
        </h1>
        <div className="size-10"></div>
      </header>

      <main className="flex flex-1 flex-col pb-8">
        {/* Profile Section */}
        <section className="flex p-4">
          <div className="flex w-full flex-col items-center gap-4">
            <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
              <div className="relative">
                <div
                  className="aspect-square w-32 rounded-full bg-cover bg-center bg-no-repeat ring-4 ring-primary/20 shadow-glow transition-transform hover:scale-105"
                  style={{
                    backgroundImage: `url("${selectedAvatar}")`,
                  }}
                ></div>
                <DialogTrigger asChild>
                  <button className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-primary text-white shadow-glow animate-glow-pulse hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl">{t.common.edit}</span>
                  </button>
                </DialogTrigger>
              </div>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold text-foreground">
                    Elige tu avatar
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-3 p-4">
                  {AVATAR_OPTIONS.map((avatarUrl, index) => (
                    <button
                      key={index}
                      onClick={() => handleAvatarSelect(avatarUrl)}
                      className={`aspect-square rounded-full bg-cover bg-center bg-no-repeat ring-2 transition-all hover:scale-110 hover:shadow-glow ${
                        selectedAvatar === avatarUrl
                          ? 'ring-primary shadow-glow scale-110'
                          : 'ring-outline dark:ring-outline-dark'
                      }`}
                      style={{
                        backgroundImage: `url("${avatarUrl}")`,
                      }}
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex flex-col items-center justify-center">
              <p className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-on-surface dark:text-on-surface-dark">
                {profile?.name || "Usuario"}
              </p>
              <p className="text-base font-normal leading-normal text-on-surface-variant dark:text-on-surface-variant-dark">
                {user?.email || "usuario@email.com"}
              </p>
            </div>
          </div>
        </section>

        <div className="flex w-full flex-col gap-6 px-4">
          {/* Account Section */}
          <section>
            <h2 className="px-1 pb-2 pt-4 text-base font-bold leading-tight tracking-[-0.015em] text-primary">
              {t.profile.account}
            </h2>
            <div className="flex flex-col gap-4 rounded-xl bg-surface dark:bg-surface-dark p-4 shadow-sm">
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium leading-normal text-on-surface-variant dark:text-on-surface-variant-dark">
                  {t.profile.fullName}
                </p>
                <input
                  className="form-input flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-outline bg-background-light p-3 text-base font-normal leading-normal text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/30 dark:border-outline-dark dark:bg-background-dark dark:text-on-surface-dark dark:placeholder:text-on-surface-variant-dark"
                  defaultValue={profile?.name || ""}
                  placeholder="Tu nombre completo"
                />
              </label>
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium leading-normal text-on-surface-variant dark:text-on-surface-variant-dark">
                  {t.profile.birthDate}
                </p>
                <div className="relative flex w-full flex-1 items-stretch">
                  <input
                    className="form-input flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-outline bg-background-light p-3 pr-12 text-base font-normal leading-normal text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/30 dark:border-outline-dark dark:bg-background-dark dark:text-on-surface-dark dark:placeholder:text-on-surface-variant-dark"
                    defaultValue="15 / 08 / 1985"
                  />
                  <div className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-on-surface-variant dark:text-on-surface-variant-dark">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                </div>
              </label>
              <a className="text-center font-semibold text-primary" href="#">
                {t.profile.changePassword}
              </a>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h2 className="px-1 pb-2 pt-4 text-base font-bold leading-tight tracking-[-0.015em] text-primary">
              {t.profile.preferences}
            </h2>
            <div className="flex flex-col divide-y divide-outline overflow-hidden rounded-xl bg-surface shadow-sm dark:divide-outline-dark dark:bg-surface-dark">
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">{t.common.notifications}</span>
                <span className="flex-1 text-base font-medium">{t.profile.reminders}</span>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                  chevron_right
                </span>
              </a>
              <div className="flex items-center p-4">
                <span className="material-symbols-outlined mr-4 text-primary">dark_mode</span>
                <span className="flex-1 text-base font-medium">{t.profile.darkMode}</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    className="peer sr-only"
                    type="checkbox"
                    checked={theme === "dark"}
                    onChange={toggleTheme}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-outline after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-outline-dark dark:peer-focus:ring-primary/50"></div>
                </label>
              </div>
              <button
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center p-4 transition-colors hover:bg-primary/10"
              >
                <span className="material-symbols-outlined mr-4 text-primary">translate</span>
                <span className="flex-1 text-base font-medium text-left">{t.profile.language}</span>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant dark:text-on-surface-variant-dark">
                    {t.languages[language]}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                    chevron_right
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* Support Section */}
          <section>
            <h2 className="px-1 pb-2 pt-4 text-base font-bold leading-tight tracking-[-0.015em] text-primary">
              {t.profile.support}
            </h2>
            <div className="flex flex-col divide-y divide-outline overflow-hidden rounded-xl bg-surface shadow-sm dark:divide-outline-dark dark:bg-surface-dark">
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">help_outline</span>
                <span className="flex-1 text-base font-medium">{t.profile.helpCenter}</span>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                  chevron_right
                </span>
              </a>
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">support_agent</span>
                <span className="flex-1 text-base font-medium">{t.profile.contactSupport}</span>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                  chevron_right
                </span>
              </a>
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">description</span>
                <span className="flex-1 text-base font-medium">{t.profile.termsPrivacy}</span>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                  chevron_right
                </span>
              </a>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-6">
            <button 
              onClick={handleSaveChanges}
              className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary px-4 text-base font-bold leading-normal text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
            >
              <span className="truncate">{t.profile.saveChanges}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl px-4 text-base font-bold leading-normal text-red-500 transition-colors hover:bg-red-500/10 active:bg-red-500/20"
            >
              <span className="truncate">{t.profile.logout}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowLanguageModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-surface dark:bg-surface-dark p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-bold text-on-surface dark:text-on-surface-dark">
              {t.profile.language}
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleLanguageChange("es")}
                className={`flex items-center justify-between rounded-lg p-4 transition-colors ${
                  language === "es"
                    ? "bg-primary text-white"
                    : "bg-background-light dark:bg-background-dark hover:bg-primary/10"
                }`}
              >
                <span className="text-base font-medium">{t.languages.es}</span>
                {language === "es" && <span className="material-symbols-outlined">check</span>}
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`flex items-center justify-between rounded-lg p-4 transition-colors ${
                  language === "en"
                    ? "bg-primary text-white"
                    : "bg-background-light dark:bg-background-dark hover:bg-primary/10"
                }`}
              >
                <span className="text-base font-medium">{t.languages.en}</span>
                {language === "en" && <span className="material-symbols-outlined">check</span>}
              </button>
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="mt-4 w-full rounded-lg bg-outline dark:bg-outline-dark p-3 text-base font-medium transition-colors hover:bg-outline/80 dark:hover:bg-outline-dark/80"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
