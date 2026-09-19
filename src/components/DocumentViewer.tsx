import React, { useState, useRef } from "react";
import { RPPData } from "../types";
import { exportRPPToWord } from "../utils/exportWord";
import { 
  FileText, 
  Printer, 
  FileCode, 
  Sparkles, 
  Clock,
  Sparkle,
  Calendar
} from "lucide-react";

interface DocumentViewerProps {
  rpp: RPPData | null;
  loading: boolean;
  loadingStep: string;
}

// Inline lightweight Markdown parser specifically customized to parse and style 
// the Gemini-generated rubrikPenilaian and markdown segments safely and elegantly
function parseMarkdownToElements(markdownText: string) {
  if (!markdownText) return null;
  const lines = markdownText.split("\n");
  const elements: React.ReactNode[] = [];
  
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  
  let inList = false;
  let listItems: string[] = [];

  const flushTable = (key: number) => {
    if (tableRows.length > 0 || tableHeaders.length > 0) {
      elements.push(
        <div key={`table-${key}`} className="overflow-x-auto my-3 border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            {tableHeaders.length > 0 && (
              <thead>
                <tr className="bg-emerald-800 text-white font-bold uppercase tracking-wider text-[9px]">
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="p-3 border-b border-slate-300 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-200">
              {tableRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 font-medium">
                  {row.map((cell, i) => (
                    <td key={i} className="p-3 text-slate-700 max-w-xs break-words">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
    }
    inTable = false;
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc list-inside space-y-1 my-2 text-xs text-slate-600 pl-2">
          {listItems.map((item, i) => (
            <li key={i} className="leading-relaxed font-semibold">{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Table handling
    if (trimmed.startsWith("|")) {
      if (inList) flushList(index);
      inTable = true;
      
      const cells = line
        .split("|")
        .map(c => c.trim())
        .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        
      const isSeparator = cells.every(c => c.startsWith("-") || c === "");
      if (!isSeparator) {
        if (tableHeaders.length === 0) {
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
      }
      return;
    } else {
      if (inTable) flushTable(index);
    }
    
    // Headers
    if (trimmed.startsWith("###")) {
      if (inList) flushList(index);
      const content = trimmed.replace(/^###\s*/, "");
      elements.push(
        <h4 key={index} className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider mt-4 mb-2 flex items-center">
          <span className="w-1.5 h-3 bg-emerald-600 rounded-sm mr-2 inline-block"></span>
          {content}
        </h4>
      );
      return;
    }
    
    if (trimmed.startsWith("##")) {
      if (inList) flushList(index);
      const content = trimmed.replace(/^##\s*/, "");
      elements.push(
        <h3 key={index} className="text-sm font-black text-slate-900 border-b border-slate-200 pb-1 mt-5 mb-2 uppercase tracking-wide">
          {content}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("#")) {
      if (inList) flushList(index);
      const content = trimmed.replace(/^#\s*/, "");
      elements.push(
        <h2 key={index} className="text-md font-black text-emerald-900 uppercase tracking-tight mt-6 mb-3">
          {content}
        </h2>
      );
      return;
    }

    // List items
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      inList = true;
      const content = trimmed.replace(/^[-\*]\s*/, "");
      listItems.push(content);
      return;
    } else {
      if (inList) flushList(index);
    }

    // Paragraph
    if (trimmed !== "") {
      const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, "$1");
      elements.push(
        <p key={index} className="text-xs text-slate-600 leading-relaxed font-semibold my-1 text-justify">
          {formatted}
        </p>
      );
    }
  });

  if (inTable) flushTable(lines.length);
  if (inList) flushList(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

export default function DocumentViewer({ rpp, loading, loadingStep }: DocumentViewerProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  // Trigger browser print dialog styled for A4
  const handlePrint = () => {
    window.print();
  };

  // Export to Microsoft Word
  const handleExportWord = () => {
    if (!rpp) return;
    exportRPPToWord(rpp);
  };

  if (loading) {
    return (
      <div id="result-card" className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <Sparkles className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 animate-pulse">Menghasilkan RPP Berbasis AI</h3>
        <p className="text-slate-500 text-sm max-w-md text-center bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-medium">
          {loadingStep}
        </p>
        <div className="mt-8 flex space-x-1.5 justify-center">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }

  if (!rpp) {
    return (
      <div id="result-card" className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner p-12 flex flex-col items-center justify-center text-center min-h-[550px]">
        <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl text-slate-400 mb-4 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">Hasil RPP Siap Dibuat</h3>
        <p className="text-slate-500 text-xs max-w-sm font-medium leading-relaxed">
          Silakan isi formulir di sebelah kiri layar, lalu klik tombol hijau <strong className="text-emerald-700 font-extrabold">Buat RPP</strong> untuk merumuskan Modul Ajar lengkap dengan susunan yang diatur rapi.
        </p>
      </div>
    );
  }

  return (
    <div id="result-card" className="space-y-4">
      {/* Top action toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-2 justify-between items-center no-print">
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5">
            <Sparkle className="w-3.5 h-3.5 text-emerald-600" />
            RPP Tersusun Rapi
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export to Word Button */}
          <button
            id="export-word-btn"
            onClick={handleExportWord}
            className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <FileCode className="w-4 h-4" />
            <span>Word DOC</span>
          </button>

          {/* Print PDF Button */}
          <button
            id="print-pdf-btn"
            onClick={handlePrint}
            className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* RPP Main Physical Sheet mock-up */}
      {(() => {
        const materiPokokDisplay = rpp.identitas.materiPokok || rpp.desainPembelajaran?.topikPembelajaran || rpp.identifikasi?.materiPelajaran || "";
        const kesiapan = rpp.identifikasi?.kesiapanPesertaDidik || rpp.identifikasi?.murid;
        const praktikPedagogis = rpp.desainPembelajaran?.praktikPedagogis || rpp.desainPembelajaran?.praktekPaedagogik || rpp.identitas?.modelPembelajaran || "";
        const kemitraan = rpp.desainPembelajaran?.kemitraanPembelajaran || rpp.desainPembelajaran?.mitraPembelajaran || [];
        const lingkungan = rpp.desainPembelajaran?.lingkunganPembelajaran || rpp.desainPembelajaran?.lingkupPembelajaran || "";

        const asesmenDiag = rpp.asesmen?.asesmenDiagnostik || {
          teknik: rpp.lampiran?.asesmenPembelajaran?.[0]?.teknik || "Tanya jawab lisan / Pertanyaan pemantik",
          instrumen: rpp.lampiran?.asesmenPembelajaran?.[0]?.instrumen || "Daftar ceklis pemahaman awal",
          deskripsi: "Dilakukan di awal pembelajaran untuk memetakan kesiapan peserta didik."
        };
        const asesmenForm = rpp.asesmen?.asesmenFormatif || {
          teknik: rpp.lampiran?.asesmenPembelajaran?.[1]?.teknik || "Observasi proses belajar & diskusi",
          instrumen: rpp.lampiran?.asesmenPembelajaran?.[1]?.instrumen || "Lembar observasi & rubrik kerja kelompok",
          deskripsi: "Dilakukan selama proses pembelajaran berlangsung secara berkelanjutan."
        };
        const asesmenSum = rpp.asesmen?.asesmenSumatif || {
          teknik: rpp.lampiran?.asesmenPembelajaran?.[2]?.teknik || "Penilaian produk / Tes akhir",
          instrumen: rpp.lampiran?.asesmenPembelajaran?.[2]?.instrumen || "Soal tes evaluasi akhir / rubrik produk",
          deskripsi: "Dilakukan di akhir kegiatan pembelajaran untuk mengukur ketercapaian tujuan."
        };

        const daftarPertemuan = (rpp.pengalamanBelajar?.pertemuan && rpp.pengalamanBelajar.pertemuan.length > 0)
          ? rpp.pengalamanBelajar.pertemuan
          : [
              {
                pertemuanKe: 1,
                alokasiWaktu: rpp.identitas.alokasiWaktu,
                fokusMateri: materiPokokDisplay,
                kegiatanAwal: rpp.pengalamanBelajar?.kegiatanAwal || { durasi: "10 menit", kegiatan: [], berkesadaran: "", bermakna: "" },
                kegiatanInti: rpp.pengalamanBelajar?.kegiatanInti || {
                  durasi: "50 menit",
                  memahami: { kegiatanGuru: [], kegiatanSiswa: [] },
                  mengaplikasikan: { kegiatanGuru: [], kegiatanSiswa: [] },
                  merefleksikan: { kegiatanGuru: [], kegiatanSiswa: [] }
                },
                kegiatanPenutup: rpp.pengalamanBelajar?.kegiatanPenutup || { durasi: "10 menit", kegiatan: [], berkesadaran: "" }
              }
            ];

        return (
          <div 
            ref={documentRef}
            className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-10 text-slate-800 print-document font-sans relative space-y-7"
          >
            {/* Document Header */}
            <div className="border-b-4 border-double border-emerald-900 pb-4 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                PERENCANAAN PEMBELAJARAN MENDALAM
              </h2>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
                  KURIKULUM MERDEKA • DEEP LEARNING PRINCIPLES
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              </div>
            </div>

            {/* IDENTITAS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
              <table className="w-full text-xs font-medium border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200/70">
                    <td className="py-1.5 pr-2 font-bold text-slate-700 w-36 sm:w-44">Mata Pelajaran</td>
                    <td className="py-1.5 px-1 font-bold text-slate-500 w-3">:</td>
                    <td className="py-1.5 pl-2 font-black text-emerald-950 uppercase tracking-wide">{rpp.identitas.mataPelajaran}</td>
                  </tr>
                  <tr className="border-b border-slate-200/70">
                    <td className="py-1.5 pr-2 font-bold text-slate-700">Kelas/ Semester</td>
                    <td className="py-1.5 px-1 font-bold text-slate-500">:</td>
                    <td className="py-1.5 pl-2 font-bold text-slate-800">{rpp.identitas.kelasSemester}</td>
                  </tr>
                  <tr className="border-b border-slate-200/70">
                    <td className="py-1.5 pr-2 font-bold text-slate-700">Materi Pokok</td>
                    <td className="py-1.5 px-1 font-bold text-slate-500">:</td>
                    <td className="py-1.5 pl-2 font-extrabold text-slate-900">{materiPokokDisplay}</td>
                  </tr>
                  <tr className="border-b border-slate-200/70">
                    <td className="py-1.5 pr-2 font-bold text-slate-700">Alokasi Waktu</td>
                    <td className="py-1.5 px-1 font-bold text-slate-500">:</td>
                    <td className="py-1.5 pl-2 font-bold text-slate-800">{rpp.identitas.alokasiWaktu}</td>
                  </tr>
                  {rpp.identitas.sekolah && (
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-slate-700">Satuan Pendidikan</td>
                      <td className="py-1.5 px-1 font-bold text-slate-500">:</td>
                      <td className="py-1.5 pl-2 font-medium text-slate-600">
                        {rpp.identitas.sekolah} • Penyusun: <strong>{rpp.identitas.namaPenyusun}</strong> (T.P {rpp.identitas.tahunPelajaran})
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* I. IDENTIFIKASI */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2 border-b-2 border-slate-900 pb-1.5">
                <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">I</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">IDENTIFIKASI</h3>
              </div>
              
              <div className="space-y-4 pl-1 text-xs">
                {/* A. Kesiapan Peserta Didik */}
                <div className="space-y-2">
                  <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    A. Kesiapan Peserta Didik
                  </h4>
                  <div className="pl-3 space-y-2 text-slate-700">
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                      <span className="font-extrabold text-slate-800 block mb-0.5">1. Pengetahuan Awal:</span>
                      <p className="leading-relaxed font-normal">{kesiapan?.pengetahuanAwal || "-"}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                      <span className="font-extrabold text-slate-800 block mb-0.5">2. Keterampilan Dasar:</span>
                      <p className="leading-relaxed font-normal">{kesiapan?.keterampilanDasar || "-"}</p>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-lg">
                      <span className="font-extrabold text-amber-900 block mb-0.5">3. Potensi Kesulitan Belajar:</span>
                      <p className="leading-relaxed font-normal text-amber-950">{kesiapan?.kesulitanBelajar || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* B. Materi Pelajaran */}
                <div className="space-y-1.5">
                  <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    B. Materi Pelajaran
                  </h4>
                  <p className="pl-3 leading-relaxed text-slate-700 font-normal">
                    {rpp.identifikasi.materiPelajaran}
                  </p>
                </div>

                {/* C. Dimensi Profil Lulusan */}
                <div className="space-y-2">
                  <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    C. Dimensi Profil Lulusan
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pl-3">
                    {(rpp.identifikasi.dimensiProfilLulusan || []).map((dim, i) => (
                      <span key={i} className="text-[10px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                        {dim}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* II. DESAIN PEMBELAJARAN */}
            <section className="space-y-3">
              <div className="flex items-center space-x-2 border-b-2 border-slate-900 pb-1.5">
                <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">II</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">DESAIN PEMBELAJARAN</h3>
              </div>

              <div className="space-y-3.5 pl-1 text-xs">
                {/* A. Tujuan Pembelajaran */}
                <div className="space-y-1.5">
                  <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    A. Tujuan Pembelajaran
                  </h4>
                  <div className="pl-3 space-y-2">
                    <p className="font-semibold text-slate-800 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                      <em>"{rpp.desainPembelajaran.tujuanPembelajaran}"</em>
                    </p>
                    {rpp.desainPembelajaran.alurTujuanPembelajaran && rpp.desainPembelajaran.alurTujuanPembelajaran.length > 0 && (
                      <div>
                        <span className="font-extrabold text-slate-700 block mb-1">Alur Tujuan Pembelajaran (ATP) / Indikator:</span>
                        <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-700">
                          {rpp.desainPembelajaran.alurTujuanPembelajaran.map((atp, i) => (
                            <li key={i} className="font-normal">{atp}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>

                {/* B. Praktik Pedagogis */}
                <div className="space-y-1">
                  <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    B. Praktik Pedagogis
                  </h4>
                  <p className="pl-3 leading-relaxed text-slate-700 font-normal">
                    {praktikPedagogis}
                  </p>
                </div>

                {/* C. Kemitraan Pembelajaran */}
                <div className="space-y-1">
                  <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    C. Kemitraan Pembelajaran
                  </h4>
                  {kemitraan.length > 0 ? (
                    <ul className="list-disc list-inside space-y-0.5 pl-3 text-slate-700 font-normal">
                      {kemitraan.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="pl-3 text-slate-500 font-normal">-</p>
                  )}
                </div>

                {/* D. Lingkungan Pembelajaran */}
                <div className="space-y-1">
                  <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    D. Lingkungan Pembelajaran
                  </h4>
                  <p className="pl-3 leading-relaxed text-slate-700 font-normal">
                    {lingkungan || "-"}
                  </p>
                </div>

                {/* E. Pemanfaatan Digital */}
                <div className="space-y-1">
                  <h4 className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
                    E. Pemanfaatan Digital
                  </h4>
                  <p className="pl-3 leading-relaxed text-slate-700 font-normal">
                    {rpp.desainPembelajaran.pemanfaatanDigital || "-"}
                  </p>
                </div>
              </div>
            </section>

            {/* III. PENGALAMAN BELAJAR (Menerapkan prinsip Deeplearning) */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2 border-b-2 border-slate-900 pb-1.5">
                <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">III</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  PENGALAMAN BELAJAR <span className="font-extrabold text-emerald-800 lowercase">(Menerapkan prinsip Deeplearning)</span>
                </h3>
              </div>

              <div className="space-y-6 pl-1 text-xs">
                {daftarPertemuan.map((p, pIdx) => {
                  const memahamiData = p.kegiatanInti?.memahami;
                  const mengaplikasikanData = p.kegiatanInti?.mengaplikasikan || p.kegiatanInti?.mengaplikasi;
                  const merefleksikanData = p.kegiatanInti?.merefleksikan || p.kegiatanInti?.merefleksi;

                  return (
                    <div key={pIdx} className="space-y-4 border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50 shadow-2xs">
                      {/* Pertemuan Banner if multiple */}
                      {daftarPertemuan.length > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-emerald-900/10 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="bg-emerald-900 text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                              Pertemuan {p.pertemuanKe}
                            </span>
                            {p.fokusMateri && (
                              <span className="text-xs font-black text-slate-800">
                                {p.fokusMateri}
                              </span>
                            )}
                          </div>
                          {p.alokasiWaktu && (
                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 border border-emerald-200">
                              <Clock className="w-3 h-3 text-emerald-700" />
                              {p.alokasiWaktu}
                            </span>
                          )}
                        </div>
                      )}

                      {/* A. Kegiatan Awal */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            A. Kegiatan Awal
                          </span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {p.kegiatanAwal?.durasi || "10 menit"}
                          </span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1.5 font-normal">
                          {(p.kegiatanAwal?.kegiatan || []).map((item, i) => (
                            <li key={i} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                        {(p.kegiatanAwal?.berkesadaran || p.kegiatanAwal?.bermakna) && (
                          <div className="pt-2 border-t border-dashed border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            {p.kegiatanAwal?.berkesadaran && (
                              <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                                <span className="text-emerald-900 font-bold uppercase block tracking-wider text-[8px] mb-0.5">Pilar Berkesadaran:</span>
                                <p className="text-slate-700 italic font-normal">"{p.kegiatanAwal.berkesadaran}"</p>
                              </div>
                            )}
                            {p.kegiatanAwal?.bermakna && (
                              <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                                <span className="text-emerald-900 font-bold uppercase block tracking-wider text-[8px] mb-0.5">Pilar Bermakna:</span>
                                <p className="text-slate-700 italic font-normal">"{p.kegiatanAwal.bermakna}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* B. Kegiatan Inti */}
                      <div className="border border-emerald-200 rounded-xl p-3.5 bg-white space-y-3.5">
                        <div className="flex justify-between items-center border-b border-emerald-100 pb-1.5">
                          <span className="font-black text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                            B. Kegiatan Inti
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-emerald-200">
                            <Clock className="w-3 h-3 text-emerald-700" />
                            {p.kegiatanInti?.durasi || "50 menit"}
                          </span>
                        </div>

                        {/* • Memahami */}
                        <div className="pl-1 space-y-2">
                          <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                            <span className="text-emerald-700 font-black">•</span>
                            <span>Memahami</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Aktivitas Guru</span>
                              <ul className="list-disc list-inside text-slate-700 space-y-1 font-normal">
                                {(memahamiData?.kegiatanGuru || []).map((kg, i) => (
                                  <li key={i}>{kg}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Aktivitas Siswa</span>
                              <ul className="list-disc list-inside text-slate-700 space-y-1 font-normal">
                                {(memahamiData?.kegiatanSiswa || []).map((ks, i) => (
                                  <li key={i}>{ks}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {(memahamiData?.bermakna || memahamiData?.menggembirakan) && (
                            <div className="text-[10px] pl-2 text-slate-600 italic">
                              Prinsip Deep Learning: Bermakna ("{memahamiData?.bermakna || "-"}") • Menggembirakan ("{memahamiData?.menggembirakan || "-"}")
                            </div>
                          )}
                        </div>

                        {/* • Mengaplikasikan */}
                        <div className="pl-1 space-y-2 pt-2 border-t border-dashed border-emerald-100">
                          <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                            <span className="text-emerald-700 font-black">•</span>
                            <span>Mengaplikasikan</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Aktivitas Guru</span>
                              <ul className="list-disc list-inside text-slate-700 space-y-1 font-normal">
                                {(mengaplikasikanData?.kegiatanGuru || []).map((kg, i) => (
                                  <li key={i}>{kg}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Aktivitas Siswa</span>
                              <ul className="list-disc list-inside text-slate-700 space-y-1 font-normal">
                                {(mengaplikasikanData?.kegiatanSiswa || []).map((ks, i) => (
                                  <li key={i}>{ks}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {(mengaplikasikanData?.berkesadaran || mengaplikasikanData?.bermakna) && (
                            <div className="text-[10px] pl-2 text-slate-600 italic">
                              Prinsip Deep Learning: Berkesadaran ("{mengaplikasikanData?.berkesadaran || "-"}") • Bermakna ("{mengaplikasikanData?.bermakna || "-"}")
                            </div>
                          )}
                        </div>

                        {/* • Merefleksikan */}
                        <div className="pl-1 space-y-2 pt-2 border-t border-dashed border-emerald-100">
                          <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                            <span className="text-emerald-700 font-black">•</span>
                            <span>Merefleksikan</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Aktivitas Guru</span>
                              <ul className="list-disc list-inside text-slate-700 space-y-1 font-normal">
                                {(merefleksikanData?.kegiatanGuru || []).map((kg, i) => (
                                  <li key={i}>{kg}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Aktivitas Siswa</span>
                              <ul className="list-disc list-inside text-slate-700 space-y-1 font-normal">
                                {(merefleksikanData?.kegiatanSiswa || []).map((ks, i) => (
                                  <li key={i}>{ks}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {(merefleksikanData?.berkesadaran || merefleksikanData?.bermakna) && (
                            <div className="text-[10px] pl-2 text-slate-600 italic">
                              Prinsip Deep Learning: Berkesadaran ("{merefleksikanData?.berkesadaran || "-"}") • Bermakna ("{merefleksikanData?.bermakna || "-"}")
                            </div>
                          )}
                        </div>
                      </div>

                      {/* C. Kegiatan Penutup */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            C. Kegiatan Penutup
                          </span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {p.kegiatanPenutup?.durasi || "10 menit"}
                          </span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1.5 font-normal">
                          {(p.kegiatanPenutup?.kegiatan || []).map((item, i) => (
                            <li key={i} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                        {p.kegiatanPenutup?.berkesadaran && (
                          <div className="pt-2 border-t border-dashed border-slate-200 text-[10px]">
                            <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                              <span className="text-emerald-900 font-bold uppercase block tracking-wider text-[8px] mb-0.5">Pilar Berkesadaran:</span>
                              <p className="text-slate-700 italic font-normal">"{p.kegiatanPenutup.berkesadaran}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* IV. ASESMEN */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2 border-b-2 border-slate-900 pb-1.5">
                <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">IV</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">ASESMEN</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-1 text-xs">
                {/* A. Asesmen Diagnostik */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="font-black text-emerald-950 uppercase text-[10px] block mb-1.5 border-b border-slate-200 pb-1 tracking-wider">
                      A. Asesmen Diagnostik
                    </span>
                    <p className="text-slate-700 mb-1">
                      <strong className="text-slate-800">Teknik:</strong> {asesmenDiag.teknik}
                    </p>
                    <p className="text-slate-700 mb-2">
                      <strong className="text-slate-800">Instrumen:</strong> {asesmenDiag.instrumen}
                    </p>
                  </div>
                  {asesmenDiag.deskripsi && (
                    <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100 mt-2">
                      {asesmenDiag.deskripsi}
                    </p>
                  )}
                </div>

                {/* B. Asesmen Formatif */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="font-black text-emerald-950 uppercase text-[10px] block mb-1.5 border-b border-slate-200 pb-1 tracking-wider">
                      B. Asesmen Formatif
                    </span>
                    <p className="text-slate-700 mb-1">
                      <strong className="text-slate-800">Teknik:</strong> {asesmenForm.teknik}
                    </p>
                    <p className="text-slate-700 mb-2">
                      <strong className="text-slate-800">Instrumen:</strong> {asesmenForm.instrumen}
                    </p>
                  </div>
                  {asesmenForm.deskripsi && (
                    <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100 mt-2">
                      {asesmenForm.deskripsi}
                    </p>
                  )}
                </div>

                {/* C. Asesmen Sumatif */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="font-black text-emerald-950 uppercase text-[10px] block mb-1.5 border-b border-slate-200 pb-1 tracking-wider">
                      C. Asesmen Sumatif
                    </span>
                    <p className="text-slate-700 mb-1">
                      <strong className="text-slate-800">Teknik:</strong> {asesmenSum.teknik}
                    </p>
                    <p className="text-slate-700 mb-2">
                      <strong className="text-slate-800">Instrumen:</strong> {asesmenSum.instrumen}
                    </p>
                  </div>
                  {asesmenSum.deskripsi && (
                    <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100 mt-2">
                      {asesmenSum.deskripsi}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* LAMPIRAN GLOSARIUM (Optional if exists) */}
            {rpp.lampiran?.glosarium && rpp.lampiran.glosarium.length > 0 && (
              <section className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    LAMPIRAN: GLOSARIUM
                  </h4>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200">
                        <th className="p-2.5 w-1/3">Istilah</th>
                        <th className="p-2.5">Definisi / Penjelasan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {rpp.lampiran.glosarium.map((g, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800 bg-slate-50/50">{g.istilah}</td>
                          <td className="p-2.5 text-slate-600">{g.definisi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Closing Signature Section at the bottom of paper */}
            <div className="mt-12 border-t border-slate-200 pt-6 grid grid-cols-2 gap-4 text-center text-[10px] font-bold text-slate-600">
              <div>
                <p>Mengetahui,</p>
                <p className="font-black text-slate-800 uppercase mt-0.5">Kepala Sekolah {rpp.identitas.sekolah}</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-800 underline">______________________________</p>
                <p>NIP. ..................................</p>
              </div>
              <div>
                <p>Makassar, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="font-black text-slate-800 uppercase mt-0.5">Guru Mata Pelajaran</p>
                <div className="h-16"></div>
                <p className="font-black text-slate-900 underline">______________________________</p>
                <p className="font-extrabold text-slate-800 mt-0.5">{rpp.identitas.namaPenyusun}</p>
                <p>NIP. ..................................</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
