import { Link } from "react-router-dom";

const Profile = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm">
        <Link to="/" className="flex size-10 shrink-0 items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-surface dark:text-on-surface-dark">arrow_back</span>
        </Link>
        <h1 className="text-on-surface dark:text-on-surface-dark flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em]">
          Ajustes y Perfil
        </h1>
        <div className="size-10"></div>
      </header>

      <main className="flex flex-1 flex-col pb-8">
        {/* Profile Section */}
        <section className="flex p-4">
          <div className="flex w-full flex-col items-center gap-4">
            <div className="relative">
              <div
                className="aspect-square w-32 rounded-full bg-cover bg-center bg-no-repeat ring-4 ring-white dark:ring-surface-dark"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC5IrhZgk-W4inNEhY1a6s9_8_k2FuyJTT1LDX5VRYLCtggTDT81q2W9CDq6Zc8zuztjuAUAuMki7NoU09r04GX0rah67cJWNafN6JaW27STszN9f82m1BzWeMHPQkqnPzA-t6rpQe6JhM7TBsyJ1vGX2K5poYDltvEgml9Dch6khm_5_1nFAnz9uzIXBoyK3Kh5C5R58_iVj1k5q8HY6cC025SUDNY37W2DCPut_FCR-zs7ewk7xEtEMybcKYDvkFiDH9gcL0k3w4")',
                }}
              ></div>
              <button className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md">
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-on-surface dark:text-on-surface-dark">
                Amelia Gómez
              </p>
              <p className="text-base font-normal leading-normal text-on-surface-variant dark:text-on-surface-variant-dark">
                amelia.gomez@email.com
              </p>
            </div>
          </div>
        </section>

        <div className="flex w-full flex-col gap-6 px-4">
          {/* Account Section */}
          <section>
            <h2 className="px-1 pb-2 pt-4 text-base font-bold leading-tight tracking-[-0.015em] text-primary">CUENTA</h2>
            <div className="flex flex-col gap-4 rounded-xl bg-surface dark:bg-surface-dark p-4 shadow-sm">
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium leading-normal text-on-surface-variant dark:text-on-surface-variant-dark">
                  Nombre Completo
                </p>
                <input
                  className="form-input flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-outline bg-background-light p-3 text-base font-normal leading-normal text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/30 dark:border-outline-dark dark:bg-background-dark dark:text-on-surface-dark dark:placeholder:text-on-surface-variant-dark"
                  defaultValue="Amelia Gómez"
                />
              </label>
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium leading-normal text-on-surface-variant dark:text-on-surface-variant-dark">
                  Fecha de Nacimiento
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
                Cambiar contraseña
              </a>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h2 className="px-1 pb-2 pt-4 text-base font-bold leading-tight tracking-[-0.015em] text-primary">
              PREFERENCIAS
            </h2>
            <div className="flex flex-col divide-y divide-outline overflow-hidden rounded-xl bg-surface shadow-sm dark:divide-outline-dark dark:bg-surface-dark">
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">notifications</span>
                <span className="flex-1 text-base font-medium">Recordatorios</span>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                  chevron_right
                </span>
              </a>
              <div className="flex items-center p-4">
                <span className="material-symbols-outlined mr-4 text-primary">dark_mode</span>
                <span className="flex-1 text-base font-medium">Modo Oscuro</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="peer h-6 w-11 rounded-full bg-outline after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-outline-dark dark:peer-focus:ring-primary/50"></div>
                </label>
              </div>
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">translate</span>
                <span className="flex-1 text-base font-medium">Idioma</span>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant dark:text-on-surface-variant-dark">Español</span>
                  <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                    chevron_right
                  </span>
                </div>
              </a>
            </div>
          </section>

          {/* Support Section */}
          <section>
            <h2 className="px-1 pb-2 pt-4 text-base font-bold leading-tight tracking-[-0.015em] text-primary">SOPORTE</h2>
            <div className="flex flex-col divide-y divide-outline overflow-hidden rounded-xl bg-surface shadow-sm dark:divide-outline-dark dark:bg-surface-dark">
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">help_outline</span>
                <span className="flex-1 text-base font-medium">Centro de Ayuda</span>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                  chevron_right
                </span>
              </a>
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">support_agent</span>
                <span className="flex-1 text-base font-medium">Contactar a Soporte</span>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                  chevron_right
                </span>
              </a>
              <a className="flex items-center p-4 transition-colors hover:bg-primary/10" href="#">
                <span className="material-symbols-outlined mr-4 text-primary">description</span>
                <span className="flex-1 text-base font-medium">Términos y Privacidad</span>
                <span className="material-symbols-outlined text-on-surface-variant dark:text-on-surface-variant-dark">
                  chevron_right
                </span>
              </a>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-6">
            <button className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary px-4 text-base font-bold leading-normal text-white shadow-lg shadow-primary/30 transition-transform active:scale-95">
              <span className="truncate">Guardar Cambios</span>
            </button>
            <button className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl px-4 text-base font-bold leading-normal text-red-500 transition-colors hover:bg-red-500/10 active:bg-red-500/20">
              <span className="truncate">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
