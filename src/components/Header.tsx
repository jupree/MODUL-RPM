import { GraduationCap, Sparkles, BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                  Generator RPP Kurikulum Merdeka
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Kemendikbudristek
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Penyusunan Rencana Pelaksanaan Pembelajaran Automatis Berbasis Artificial Intelligence
              </p>
              <div className="text-[10px] text-emerald-800 font-extrabold mt-1 md:hidden">
                made by : Muhammad jupri, S.Pd (SDN35 Tekolabbua)
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Didukung Gemini 3.5 Flash</span>
            </div>
            <div className="text-[10px] text-emerald-800 font-black bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md">
              made by : Muhammad jupri, S.Pd (SDN35 Tekolabbua)
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
