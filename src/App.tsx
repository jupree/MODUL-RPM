import { useState, useEffect } from "react";
import Header from "./components/Header";
import RPPForm from "./components/RPPForm";
import DocumentViewer from "./components/DocumentViewer";
import { RPPData } from "./types";
import { 
  Sparkles, 
  HelpCircle, 
  BookMarked, 
  GraduationCap, 
  FileCheck,
  AlertTriangle,
  Lightbulb,
  XCircle
} from "lucide-react";

export default function App() {
  const [rpp, setRpp] = useState<RPPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // List of professional Indonesian pedagogical steps for the AI loading overlay
  const LOADING_STEPS = [
    "Memvalidasi parameter kurikulum dan nama sekolah...",
    "Menganalisis materi mata pelajaran sesuai dengan target Fase/Kelas...",
    "Merumuskan Tujuan Pembelajaran (TP) & Alur Ketercapaian...",
    "Merancang kegiatan inti terstruktur berdasarkan Sintaks Model Pembelajaran...",
    "Sintesis aktivitas guru yang komunikatif dan respons berpikir kritis siswa...",
    "Menyusun kriteria asesmen formatif, sumatif, serta instrumen penilaian...",
    "Memfinalisasi modul ajar modular versi Kurikulum Merdeka..."
  ];

  // Logic to simulate pedagogical step progression during generation
  useEffect(() => {
    let intervalId: any;
    if (loading) {
      let stepIndex = 0;
      setLoadingStep(LOADING_STEPS[0]);
      
      intervalId = setInterval(() => {
        stepIndex++;
        if (stepIndex < LOADING_STEPS.length) {
          setLoadingStep(LOADING_STEPS[stepIndex]);
        }
      }, 2400);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [loading]);

  // Main submission handler toward our full-stack Express API
  const handleGenerateRPP = async (formData: any) => {
    setLoading(true);
    setError(null);
    setRpp(null);

    try {
      const response = await fetch("/api/generate-rpp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal berkomunikasi dengan server.");
      }

      const data = await response.json();
      setRpp(data);

      // Scroll to the generated RPP result card automatically on mobile/sm views
      setTimeout(() => {
        const element = document.getElementById("result-card");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan sistem saat menghubungi AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Printable Global Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Callout Info Section - no-print */}
        <section className="mb-8 no-print p-5 bg-gradient-to-r from-emerald-800 to-teal-950 text-white rounded-2xl shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start md:items-center space-x-3.5">
            <div className="bg-white/15 p-2 rounded-xl text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide">Panduan Pintar Modul Ajar</h2>
              <p className="text-xs text-emerald-100/80 font-medium leading-relaxed">
                Pilih atau ketik mata pelajaran yang diinginkan. AI akan menyinkronkan sub-tema pembelajaran dengan Sintaks Model resmi.
              </p>
              <div className="mt-2 text-[11px] font-black bg-white/10 px-2.5 py-1 rounded-md border border-white/10 inline-block text-amber-300">
                made by : Muhammad jupri, S.Pd (SDN35 Tekolabbua)
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs bg-black/20 self-start md:self-auto px-3.5 py-1.5 rounded-lg border border-white/10">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Format Kurikulum Merdeka (Modul Ajar)</span>
          </div>
        </section>

        {/* Actionable Error State Notice */}
        {error && (
          <section className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-800 no-print">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-extrabold block text-sm">Gagal Menghasilkan RPP</span>
              <p className="leading-relaxed font-semibold">{error}</p>
              <p className="text-red-600/90 leading-relaxed font-medium">
                Saran: Pastikan API Key di Secrets panel telah dimasukkan dengan benar, atau coba kembali dengan topik materi pokok yang lebih spesifik.
              </p>
            </div>
          </section>
        )}

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: Parameter Form (Left 5 Columns on Large screen) */}
          <section className="lg:col-span-5 no-print">
            <RPPForm onSubmit={handleGenerateRPP} loading={loading} />

            {/* Quick tips box under form */}
            <div className="bg-slate-100 border border-slate-200 p-4.5 rounded-2xl mt-5 space-y-2.5">
              <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Tips Penyusunan RPP</span>
              </div>
              <ul className="text-slate-500 text-[11px] list-disc list-inside space-y-1 pl-1 font-medium leading-relaxed">
                <li>Gunakan alokasi waktu realisits seperti <strong className="text-slate-700">"2 x 35 menit"</strong> atau <strong className="text-slate-700">"3 JP"</strong>.</li>
                <li>Materi pokok dapat ditulis spesifik beserta sub-tema agar hasil materi di kegiatan inti lebih mendalam.</li>
                <li>Download as DOC untuk disunting lebih lanjut, atau cetak langsung ke PDF untuk dibagikan ke Pengawas Sekolah.</li>
              </ul>
            </div>
          </section>

          {/* RIGHT VIEWPORT: Beautiful structured paper A4 (Right 7 Columns on Large screen) */}
          <section className="lg:col-span-7">
            <DocumentViewer rpp={rpp} loading={loading} loadingStep={loadingStep} />
          </section>
        </div>
      </main>

      {/* Elegant minimalist footbar */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p>© 2026 Generator RPP Kurikulum Merdeka. Hak Cipta Dilindungi.</p>
          <div className="text-emerald-800 font-black bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100">
            made by : Muhammad jupri, S.Pd (SDN35 Tekolabbua)
          </div>
          <div className="flex space-x-4">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Panduan Penggunaan</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Buku Kurikulum</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer text-emerald-700 font-bold">SDN 35 Tekolabbua</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
