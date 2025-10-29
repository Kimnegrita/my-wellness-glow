const articles = [
  {
    category: "Alimentación",
    icon: "restaurant",
    items: [
      { title: "Recetas para tu ciclo", type: "Artículo - 5 min", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
      { title: "Batidos llenos de energía", type: "Video - 3 min", image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400" },
      { title: "Hidratación y suplementos", type: "Artículo - 8 min", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400" },
    ],
  },
  {
    category: "Ejercicio",
    icon: "fitness_center",
    items: [
      { title: "Yoga para la fase lútea", type: "Video - 15 min", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400" },
      { title: "Ejercicios de bajo impacto", type: "Artículo - 7 min", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400" },
    ],
  },
  {
    category: "Cuidado Personal",
    icon: "self_care",
    items: [
      { title: "Meditación guiada", type: "Audio - 10 min", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400" },
      { title: "Rituales de noche", type: "Artículo - 6 min", image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400" },
    ],
  },
];

const Wellness = () => {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-24">
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-3 justify-between backdrop-blur-sm">
        <div className="flex size-10 shrink-0 items-center justify-start">
          <img
            alt="Logo"
            className="h-8 w-8"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA45U8HTdtF2SjA55uX4tqAnarVjrTa8PtWzbE9qeBodMSFZBR34Z_tddlLjaRfY69xF14-MEnm86IAKiW6jO4R7IondEQnJ-mjcH1SQKe-BBCeZAwh7Cjd4I812H0BtS2HOvrnfEsmaAjLG_Z_WlQfBvYzH1UPXZ7rFSg6EBDInpQxKSSiBRi7QeHmIMkHvNttGVcdFfqYRrNWMomM6JNjngkU5OUn_M4I9bWPLKfqeAyVTf_khFBfxYEpU2e19OkmZQ-QUCJf7NA"
          />
        </div>
        <h1 className="text-[#181114] dark:text-gray-200 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Bienestar para ti
        </h1>
        <div className="flex w-10 items-center justify-end">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-transparent text-[#181114] dark:text-gray-200 gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-8">
        <div className="px-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-primary">
            Consejos para tu bienestar
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Descubre artículos y guías para nutrir tu cuerpo y mente en cada fase de tu ciclo.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {articles.map((section) => (
            <section key={section.category} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-full bg-primary-container dark:bg-primary/20">
                    <span className="material-symbols-outlined text-primary dark:text-primary-light">
                      {section.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.category}</h3>
                </div>
                <a className="text-sm font-medium text-primary hover:underline" href="#">
                  Ver todo
                </a>
              </div>

              <div className="flex gap-4 pl-4 overflow-x-auto pb-2 -mb-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col w-64 shrink-0 gap-2 pr-4">
                    <div className="relative">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-xl"
                        style={{ backgroundImage: `url('${item.image}')` }}
                      ></div>
                      <button className="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-black/30 text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-lg">bookmark_border</span>
                      </button>
                    </div>
                    <div>
                      <p className="text-[#181114] dark:text-gray-200 text-base font-medium leading-normal">
                        {item.title}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Wellness;
