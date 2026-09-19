import { useState, useEffect, FormEvent } from "react";
import { 
  MATA_PELAJARAN_OPTIONS, 
  SENI_SUB_OPTIONS,
  SeniSubOption,
  MODEL_PEMBELAJARAN_OPTIONS, 
  SUBJECT_SAMPLES 
} from "../data/formOptions";
import { 
  School, 
  BookOpen, 
  Layers, 
  FileEdit, 
  Timer, 
  GitCommit, 
  Sparkles,
  BookMarked,
  FileText,
  User,
  Calendar,
  Award,
  Palette
} from "lucide-react";

interface RPPFormProps {
  onSubmit: (formData: any) => void;
  loading: boolean;
}

export default function RPPForm({ onSubmit, loading }: RPPFormProps) {
  const [namaPenyusun, setNamaPenyusun] = useState("");
  const [namaSekolah, setNamaSekolah] = useState("SDN 35 Tekolabbua");
  const [tahunPelajaran, setTahunPelajaran] = useState("2026/2027");
  const [mataPelajaran, setMataPelajaran] = useState("Pendidikan Agama Islam");
  const [subSeni, setSubSeni] = useState<SeniSubOption>("Seni Rupa");
  const [fase, setFase] = useState("Fase B");
  const [kelasSemester, setKelasSemester] = useState("Kelas 4 / Semester 1");
  const [materiPokok, setMateriPokok] = useState("");
  const [alokasiWaktu, setAlokasiWaktu] = useState("4x35 menit");
  const [modelPembelajaran, setModelPembelajaran] = useState("Project-Based Learning (PjBL)");
  const [capaianPembelajaran, setCapaianPembelajaran] = useState("");

  // Autocomplete sample materials and CP when subject is changed
  useEffect(() => {
    const sampleKey = mataPelajaran === "Pendidikan Seni"
      ? `Pendidikan Seni - ${subSeni}`
      : mataPelajaran;
    const sample = SUBJECT_SAMPLES[sampleKey] || SUBJECT_SAMPLES[mataPelajaran];
    if (sample) {
      setMateriPokok(sample.materiPokok);
      setAlokasiWaktu(sample.alokasiWaktu);
      setCapaianPembelajaran(sample.capaianPembelajaran || "");
      
      // Smart detection for Fase and Kelas/Semester
      if (sample.fase.includes("Fase A")) {
        setFase("Fase A");
        setKelasSemester("Kelas 2 / Semester 1");
      } else if (sample.fase.includes("Fase B")) {
        setFase("Fase B");
        setKelasSemester("Kelas 4 / Semester 1");
      } else if (sample.fase.includes("Fase C")) {
        setFase("Fase C");
        setKelasSemester("Kelas 6 / Semester 1");
      }
    }
  }, [mataPelajaran, subSeni]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !namaPenyusun ||
      !namaSekolah ||
      !tahunPelajaran ||
      !mataPelajaran ||
      !fase ||
      !kelasSemester ||
      !materiPokok ||
      !alokasiWaktu ||
      !modelPembelajaran ||
      !capaianPembelajaran
    ) {
      return;
    }

    const finalMataPelajaran = mataPelajaran === "Pendidikan Seni"
      ? `Pendidikan Seni (${subSeni})`
      : mataPelajaran;

    onSubmit({
      namaPenyusun,
      namaSekolah,
      tahunPelajaran,
      mataPelajaran: finalMataPelajaran,
      fase,
      kelasSemester,
      materiPokok,
      alokasiWaktu,
      modelPembelajaran,
      capaianPembelajaran,
    });
  };

  // Pre-fill fields with a fast sample clicker
  const quickFillSample = (subjectName: string) => {
    setMataPelajaran(subjectName);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-md font-bold text-slate-800 flex items-center space-x-2">
          <BookMarked className="w-5 h-5 text-emerald-600" />
          <span>Pengaturan Parameter RPP / Modul Ajar</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-normal">
          Isi form di bawah untuk memicu AI merumuskan dokumen Rencana Pembelajaran model Kurikulum Merdeka secara lengkap.
        </p>
      </div>

      {/* Quick suggest tags to test */}
      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Pilih Cepat Contoh Mata Pelajaran:</span>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
          {MATA_PELAJARAN_OPTIONS.map((sub, i) => (
            <button
              id={`quick-fill-${i}`}
              key={i}
              type="button"
              onClick={() => quickFillSample(sub)}
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide transition-all border ${
                mataPelajaran === sub
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Penyusun */}
        <div>
          <label htmlFor="namaPenyusun" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Nama Penyusun
          </label>
          <input
            id="namaPenyusun"
            type="text"
            required
            value={namaPenyusun}
            onChange={(e) => setNamaPenyusun(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800"
            placeholder="Masukkan Nama Penyusun"
          />
        </div>

        {/* Satuan Pendidikan (Nama Sekolah) */}
        <div>
          <label htmlFor="namaSekolah" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <School className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Satuan Pendidikan
          </label>
          <input
            id="namaSekolah"
            type="text"
            required
            value={namaSekolah}
            onChange={(e) => setNamaSekolah(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800"
            placeholder="Masukkan Satuan Pendidikan"
          />
        </div>

        {/* Tahun Pelajaran */}
        <div>
          <label htmlFor="tahunPelajaran" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Tahun Pelajaran
          </label>
          <input
            id="tahunPelajaran"
            type="text"
            required
            value={tahunPelajaran}
            onChange={(e) => setTahunPelajaran(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800"
            placeholder="Contoh: 2026/2027"
          />
        </div>

        {/* Mata Pelajaran */}
        <div>
          <label htmlFor="mataPelajaran" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Mata Pelajaran
          </label>
          <div className="relative">
            <select
              id="mataPelajaran"
              required
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800 bg-white appearance-none cursor-pointer"
            >
              {MATA_PELAJARAN_OPTIONS.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Secondary Dropdown for Pendidikan Seni */}
          {mataPelajaran === "Pendidikan Seni" && (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-2 animate-fadeIn transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="subSeni" className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center">
                  <Palette className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  Bidang Pendidikan Seni
                </label>
                <span className="text-[10px] bg-amber-200/60 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Sub-kategori
                </span>
              </div>
              <div className="relative">
                <select
                  id="subSeni"
                  value={subSeni}
                  onChange={(e) => setSubSeni(e.target.value as SeniSubOption)}
                  className="w-full text-sm px-4 py-2.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-semibold text-slate-800 bg-white appearance-none cursor-pointer"
                >
                  {SENI_SUB_OPTIONS.map((sub, i) => (
                    <option key={i} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-amber-600">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              <p className="text-[11px] text-amber-800/90 font-medium">
                Pilih bidang seni: <strong>Seni Rupa</strong>, <strong>Seni Tari</strong>, atau <strong>Seni Musik</strong>. Materi dan CP otomatis disesuaikan.
              </p>
            </div>
          )}
        </div>

        {/* Fase */}
        <div>
          <label htmlFor="fase" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Fase
          </label>
          <div className="relative">
            <select
              id="fase"
              required
              value={fase}
              onChange={(e) => setFase(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800 bg-white appearance-none cursor-pointer"
            >
              <option value="Fase A">Fase A</option>
              <option value="Fase B">Fase B</option>
              <option value="Fase C">Fase C</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kelas / Semester */}
        <div>
          <label htmlFor="kelasSemester" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <Award className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Kelas / Semester
          </label>
          <input
            id="kelasSemester"
            type="text"
            required
            value={kelasSemester}
            onChange={(e) => setKelasSemester(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800"
            placeholder="Contoh: Kelas 4 / Semester 1"
          />
        </div>

        {/* Materi Pokok */}
        <div>
          <label htmlFor="materiPokok" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <FileEdit className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Materi Pokok
          </label>
          <input
            id="materiPokok"
            type="text"
            required
            value={materiPokok}
            onChange={(e) => setMateriPokok(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800"
            placeholder="Contoh: Asmaul Husna: Al-Wahhab"
          />
        </div>

        {/* Capaian Pembelajaran (CP) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="capaianPembelajaran" className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Capaian Pembelajaran (CP)
            </label>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
              Acuan Pokok
            </span>
          </div>
          <textarea
            id="capaianPembelajaran"
            required
            rows={3}
            value={capaianPembelajaran}
            onChange={(e) => setCapaianPembelajaran(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800 resize-y"
            placeholder="Masukkan Capaian Pembelajaran (CP) dari kurikulum"
          />
          <p className="text-[11px] text-slate-500 mt-1 italic">
            *Cukup masukkan Capaian Pembelajaran. Tujuan Pembelajaran (TP) & Alur Tujuan Pembelajaran (ATP) akan dirumuskan otomatis oleh AI ke dalam dokumen.
          </p>
        </div>

        {/* Alokasi Waktu */}
        <div>
          {(() => {
            const jpMatch = alokasiWaktu.match(/(\d+)\s*(?:x|jp|jam)/i) || alokasiWaktu.match(/(\d+)/);
            const jpNum = jpMatch ? parseInt(jpMatch[1], 10) : 0;
            const isMulti = jpNum > 3;
            const targetP = jpNum > 4 ? 3 : (isMulti ? 2 : 1);

            return (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="alokasiWaktu" className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center">
                    <Timer className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Alokasi Waktu
                  </label>
                  {isMulti ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full animate-fadeIn shadow-2xs">
                      ⚡ Otomatis {targetP} Pertemuan ({jpNum} JP &gt; 3 JP)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      1 Pertemuan (&le; 3 JP)
                    </span>
                  )}
                </div>

                <input
                  id="alokasiWaktu"
                  type="text"
                  required
                  value={alokasiWaktu}
                  onChange={(e) => setAlokasiWaktu(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800"
                  placeholder="Contoh: 4 x 35 menit"
                />

                {/* Quick preset buttons for JP */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: "2x35m (2 JP)", val: "2 x 35 menit" },
                    { label: "3x35m (3 JP)", val: "3 x 35 menit" },
                    { label: "4x35m (4 JP • 2 Pertemuan)", val: "4 x 35 menit" },
                    { label: "6x35m (6 JP • 3 Pertemuan)", val: "6 x 35 menit" }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAlokasiWaktu(preset.val)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all border ${
                        alokasiWaktu === preset.val
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </>
            );
          })()}
        </div>

        {/* Model Pembelajaran */}
        <div>
          <label htmlFor="modelPembelajaran" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
            <GitCommit className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Model Pembelajaran
          </label>
          <div className="relative">
            <select
              id="modelPembelajaran"
              required
              value={modelPembelajaran}
              onChange={(e) => setModelPembelajaran(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800 bg-white appearance-none cursor-pointer"
            >
              {MODEL_PEMBELAJARAN_OPTIONS.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* LARGE GREEN BUTTON: "Tombol 'Buat RPP' yang besar dan berwarna hijau" */}
        <div className="pt-4">
          <button
            id="buat-rpp-btn"
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-wider text-sm px-6 py-4.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-98 ${
              loading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>{loading ? "Sedang Merumuskan..." : "Buat RPP"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
