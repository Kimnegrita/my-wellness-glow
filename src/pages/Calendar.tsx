import { Link } from "react-router-dom";

const Calendar = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-gray-800 dark:text-gray-200">arrow_back</span>
        </Link>
        <h1 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Mi Calendario
        </h1>
        <div className="flex size-12 items-center justify-end">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent text-gray-800 dark:text-gray-200 gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-4">
        <div className="flex flex-col gap-4">
          <div className="flex min-w-72 flex-1 flex-col gap-0.5">
            {/* Month selector */}
            <div className="flex items-center p-1 justify-between">
              <button>
                <div className="text-gray-800 dark:text-gray-200 flex size-10 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </div>
              </button>
              <p className="text-gray-900 dark:text-gray-100 text-base font-bold leading-tight flex-1 text-center">
                Septiembre 2024
              </p>
              <button>
                <div className="text-gray-800 dark:text-gray-200 flex size-10 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </div>
              </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {["D", "L", "M", "M", "J", "V", "S"].map((day) => (
                <p
                  key={day}
                  className="text-gray-500 dark:text-gray-400 text-sm font-semibold leading-normal flex h-12 w-full items-center justify-center pb-0.5"
                >
                  {day}
                </p>
              ))}

              {/* Calendar days - simplified for demonstration */}
              {Array.from({ length: 35 }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  className="h-12 w-full text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal"
                >
                  <div className="flex size-full items-center justify-center rounded-full">{day}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-normal">Menstruación</p>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-purple-medium"></div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-normal">Ventana fértil</p>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="h-2 w-2 rounded-full bg-purple-dark"></div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-normal">Ovulación</p>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="h-1 w-1 rounded-full bg-primary ring-1 ring-offset-2 ring-primary dark:ring-offset-background-dark"></div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-normal ml-0.5">Nota registrada</p>
          </div>
        </div>

        {/* Info card */}
        <div className="mt-6">
          <div className="flex flex-col rounded-xl bg-white dark:bg-[#2A282D] p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex gap-4">
              <div
                className="flex-shrink-0 w-24 h-24 bg-center bg-no-repeat bg-contain rounded-xl"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAfG5dwUYvbj-KI6uVgbHXf8lcq2WS7S0_kERIy-FW8o_X00feK0HORHgJCKvoKy8fU3bNbASSvZFaZgJ3UpxEmEK_6lfTWwGRhq52z52eCZ-N0Cxb98W8RIYQmM2fKjpS4vZw4T2bp9KivVwlyV043gy2KAiLlc3ORXWBVsdiZYFU4T2oaH8eUOX3u5BLbi_JAipOKKUhh3CY_KgbuwNe1rx9a3cA7ZAWdqgslBHYBaHioAwIj9DKQj3pGsXEhhiX_MnZR949XeGk")',
                }}
              ></div>
              <div className="flex flex-col justify-center gap-1">
                <p className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em]">
                  Hoy es día de ovulación
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                  Pico de fertilidad. Día 14 de 28
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <div className="sticky bottom-0 right-0 p-5 flex justify-end">
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 gap-3 shadow-lg pl-4 pr-6">
          <span className="material-symbols-outlined">add</span>
          <span className="truncate">Añadir nota</span>
        </button>
      </div>
    </div>
  );
};

export default Calendar;
