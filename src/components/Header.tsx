export const Header = () => {
  return (
    <header className="flex items-center bg-surface-light dark:bg-surface-dark p-4 pb-2 justify-between sticky top-0 z-10 shadow-sm shadow-black/[0.02] dark:shadow-black/20">
      <div className="flex size-12 shrink-0 items-center">
        <img
          className="rounded-full size-10"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJODU3pkXVik-PiXmAZpIGCdUZnIhyel7vEsaaoelu7E-g-3NA1MMfhwrXbNWFgal3yI4gKrU1W9X7iVJydBdSBj-wM0s7c266UWWc2v72RfdvSW00dZiXY06kb4YMaujAge6dkE9viRwihrp-J2WCwENq9a25xxTeQHgwznnjcmoUCk3T4qUXu4-TGaYmBbKtweapg_nkZH6ksDQfKSigyDudX0j9wOCGjcVBjHjLanGLTB-TfsNl4OYNxy8D3lKHRKwik19KvPc"
          alt="User profile"
        />
      </div>
      <h1 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1">
        Hola, María
      </h1>
      <div className="flex w-12 items-center justify-end">
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent text-text-primary-light dark:text-text-primary-dark gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
};
