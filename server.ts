import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set!");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper function to call Gemini with exponential retries and model fallback
async function generateContentWithRetryAndFallback(ai: any, params: {
  contents: string;
  systemInstruction: string;
  responseSchema: any;
}) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Mengajukan permintaan menggunakan model ${modelName} (Percobaan ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: "application/json",
            responseSchema: params.responseSchema,
            temperature: 0.7,
          },
        });
        return response;
      } catch (error: any) {
        lastError = error;
        console.error(`Gagal pada model ${modelName}, percobaan ${attempt}:`, error);

        const errStr = (String(error) + " " + (error.message || "") + " " + JSON.stringify(error)).toLowerCase();
        
        // High demand / overloaded / rate limit / 503 / 429
        const isOverloadedOrRateLimited = errStr.includes("503") || 
                                          errStr.includes("429") || 
                                          errStr.includes("demand") || 
                                          errStr.includes("unavailable") || 
                                          errStr.includes("overloaded") || 
                                          errStr.includes("limit");

        if (isOverloadedOrRateLimited) {
          console.log(`Model ${modelName} sedang sibuk atau kelebihan beban (503/429). Beralih ke model berikutnya untuk efisiensi...`);
          break; // Break the inner loop immediately to try the next model without wasting time retrying a busy model
        }

        const isTransient = errStr.includes("500") || 
                            errStr.includes("temporary") ||
                            errStr.includes("timeout") ||
                            errStr.includes("econnreset");

        if (isTransient && attempt < maxRetries) {
          const delay = attempt * 1500;
          console.log(`Terjadi kesalahan jaringan/sementara. Menunggu ${delay}ms sebelum mencoba kembali...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("Gagal menghasilkan konten setelah mencoba semua model.");
}

// API endpoint to generate RPP
app.post("/api/generate-rpp", async (req, res) => {
  try {
    const {
      namaPenyusun,
      namaSekolah,
      tahunPelajaran,
      mataPelajaran,
      fase,
      kelasSemester,
      materiPokok,
      alokasiWaktu,
      modelPembelajaran,
      capaianPembelajaran,
    } = req.body;

    if (!namaPenyusun || !namaSekolah || !tahunPelajaran || !mataPelajaran || !fase || !kelasSemester || !materiPokok || !alokasiWaktu || !modelPembelajaran || !capaianPembelajaran) {
      return res.status(400).json({ error: "Semua field formulir harus diisi!" });
    }

    const ai = getGeminiClient();

    // Analisis alokasi waktu untuk menentukan jumlah pertemuan jika jam pelajaran melebihi 3 JP
    let jpCount = 4;
    const jpMatch = alokasiWaktu.match(/(\d+)\s*(?:x|jp|jam)/i);
    if (jpMatch) {
      jpCount = parseInt(jpMatch[1], 10);
    } else {
      const numOnly = alokasiWaktu.match(/(\d+)/);
      if (numOnly) {
        jpCount = parseInt(numOnly[1], 10);
      }
    }

    const isMultiPertemuan = jpCount > 3;
    const targetPertemuan = jpCount > 4 ? 3 : (isMultiPertemuan ? 2 : 1);

    const systemPrompt = `Anda adalah ahli kurikulum pendidikan Indonesia yang mendesain RPP / Modul Ajar format resmi:
"PERENCANAAN PEMBELAJARAN MENDALAM" berstandar Kurikulum Merdeka dan menerapkan prinsip Deep Learning (Berkesadaran, Bermakna, Menggembirakan).

Format dokumen yang WAJIB dihasilkan mengikuti struktur:
PERENCANAAN PEMBELAJARAN MENDALAM
Identitas:
- Mata Pelajaran
- Kelas/ Semester
- Materi Pokok
- Alokasi Waktu
(beserta nama penyusun, sekolah, tahun pelajaran, fase, model pembelajaran)

I. IDENTIFIKASI
A. Kesiapan Peserta Didik (pengetahuan awal, keterampilan dasar, kesulitan belajar)
B. Materi Pelajaran
C. Dimensi Profil Lulusan (pilih 2-4 dari 8 DPL resmi)

II. DESAIN PEMBELAJARAN
A. Tujuan Pembelajaran (TP & Alur Tujuan Pembelajaran / ATP yang operasional)
B. Praktik Pedagogis (pendekatan, model, dan metode pembelajaran aktif)
C. Kemitraan Pembelajaran (kolaborasi orang tua, komunitas, rekan sejawat, narasumber)
D. Lingkungan Pembelajaran (penataan ruang, sarana prasarana, suasana psikologis aman & nyaman)
E. Pemanfaatan Digital (media, aplikasi, dan platform digital edukatif interaktif)

III. PENGALAMAN BELAJAR (Menerapkan prinsip Deeplearning)
A. Kegiatan Awal (Berkesadaran & Bermakna)
B. Kegiatan Inti:
• Memahami (Bermakna & Menggembirakan)
• Mengaplikasikan (Berkesadaran & Bermakna)
• Merefleksikan (Berkesadaran & Bermakna)
C. Kegiatan Penutup (Berkesadaran)

IV. ASESMEN
A. Asesmen Diagnostik (teknik, instrumen, deskripsi pelaksanaan)
B. Asesmen Formatif (teknik, instrumen, deskripsi pelaksanaan)
C. Asesmen Sumatif (teknik, instrumen, deskripsi pelaksanaan)

Tuntutan Penting untuk Dimensi Profil Lulusan (DPL):
Pilih 2 hingga 4 dimensi yang relevan dari 8 dimensi resmi:
- DPL 1 (Keimanan dan Ketakwaan terhadap Tuhan YME)
- DPL 2 (Kewargaan)
- DPL 3 (Penalaran Kritis)
- DPL 4 (Kreativitas)
- DPL 5 (Kolaborasi)
- DPL 6 (Kemandirian)
- DPL 7 (Kesehatan)
- DPL 8 (Komunikasi)

${isMultiPertemuan 
  ? `ATURAN KHUSUS JUMLAH PERTEMUAN (Alokasi Waktu: ${alokasiWaktu} = ${jpCount} Jam Pelajaran / JP > 3 JP):
Karena alokasi waktu melebihi 3 JP, Anda WAJIB membagi kegiatan pembelajaran menjadi tepat ${targetPertemuan} PERTEMUAN (${targetPertemuan === 3 ? 'Pertemuan 1, Pertemuan 2, dan Pertemuan 3' : 'Pertemuan 1 dan Pertemuan 2'}) di dalam array 'pertemuan'.
Setiap pertemuan harus dirancang utuh dengan:
1. 'pertemuanKe': nomor pertemuan (1, 2${targetPertemuan === 3 ? ', 3' : ''}).
2. 'alokasiWaktu': alokasi waktu per pertemuan (misal: '2 x 35 menit').
3. 'fokusMateri': fokus materi atau sasaran aktivitas di pertemuan tersebut.
4. 'kegiatanAwal': mencakup unsur 'Berkesadaran' dan 'Bermakna' beserta durasi dan rincian aktivitas.
5. 'kegiatanInti': mencakup 3 tahapan pembelajaran mendalam: 'Memahami', 'Mengaplikasikan', dan 'Merefleksikan', dengan rincian kegiatan guru & siswa yang konkret.
6. 'kegiatanPenutup': mencakup durasi, rincian refleksi, dan unsur 'Berkesadaran'.`
  : `Karena alokasi waktu pembelajaran (${alokasiWaktu}) tidak melebihi 3 JP (<= 3 JP), buatlah 1 Pertemuan di dalam array 'pertemuan' dengan kegiatan Awal, Inti (Memahami, Mengaplikasikan, Merefleksikan dengan minimal 5-7 kegiatan guru & siswa), dan Penutup.`
}`;

    const userPrompt = `Buatlah RPP PERENCANAAN PEMBELAJARAN MENDALAM dengan rincian berikut:
- Nama Penyusun: ${namaPenyusun}
- Satuan Pendidikan (Nama Sekolah): ${namaSekolah}
- Tahun Pelajaran: ${tahunPelajaran}
- Mata Pelajaran: ${mataPelajaran}
- Fase: ${fase}
- Kelas/Semester: ${kelasSemester}
- Materi Pokok / Topik Pembelajaran: ${materiPokok}
- Alokasi Waktu: ${alokasiWaktu} (${jpCount} JP)
- Model Pembelajaran: ${modelPembelajaran}
- Capaian Pembelajaran (CP) Acuan: ${capaianPembelajaran}

Pedoman Pengisian:
1. Rumuskan Tujuan Pembelajaran (TP) yang rinci, operasional, dan berstandar tinggi secara mandiri berdasarkan Capaian Pembelajaran (CP) acuan, beserta Alur Tujuan Pembelajaran (ATP).
2. Tuliskan rincian Praktik Pedagogis, Kemitraan Pembelajaran, Lingkungan Pembelajaran, dan Pemanfaatan Digital secara kontekstual.
3. ${isMultiPertemuan 
    ? `Pecahlah pengalaman belajar menjadi ${targetPertemuan} PERTEMUAN di dalam array 'pertemuan' (Pertemuan 1, Pertemuan 2${targetPertemuan === 3 ? ', dan Pertemuan 3' : ''}). Masing-masing memiliki Kegiatan Awal, Kegiatan Inti (Memahami, Mengaplikasikan, Merefleksikan), dan Kegiatan Penutup.`
    : `Sediakan 1 pertemuan utuh di dalam array 'pertemuan' dengan alokasi waktu ${alokasiWaktu}.`}
4. Pada Bagian IV. ASESMEN: Rincikan A. Asesmen Diagnostik, B. Asesmen Formatif, dan C. Asesmen Sumatif masing-masing lengkap dengan teknik, instrumen, dan deskripsi kegiatan asesmen.
5. Sediakan Glosarium berisi minimal 3 istilah kunci terkait materi beserta definisinya.`;

    const pertemuanItemSchema = {
      type: Type.OBJECT,
      properties: {
        pertemuanKe: { type: Type.INTEGER, description: "Nomor urut pertemuan (1, 2, atau 3)" },
        alokasiWaktu: { type: Type.STRING, description: "Alokasi waktu pertemuan ini, contoh '2 x 35 menit'" },
        fokusMateri: { type: Type.STRING, description: "Fokus materi atau aktivitas pokok pada pertemuan ini" },
        kegiatanAwal: {
          type: Type.OBJECT,
          properties: {
            durasi: { type: Type.STRING },
            kegiatan: { type: Type.ARRAY, items: { type: Type.STRING } },
            berkesadaran: { type: Type.STRING, description: "Deskripsi pilar berkesadaran di kegiatan awal" },
            bermakna: { type: Type.STRING, description: "Deskripsi pilar bermakna di kegiatan awal" }
          },
          required: ["durasi", "kegiatan", "berkesadaran", "bermakna"]
        },
        kegiatanInti: {
          type: Type.OBJECT,
          properties: {
            durasi: { type: Type.STRING },
            memahami: {
              type: Type.OBJECT,
              properties: {
                kegiatanGuru: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar kegiatan guru yang runtut" },
                kegiatanSiswa: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar kegiatan siswa yang runtut" },
                bermakna: { type: Type.STRING, description: "Penerapan pilar bermakna" },
                menggembirakan: { type: Type.STRING, description: "Penerapan pilar menggembirakan" }
              },
              required: ["kegiatanGuru", "kegiatanSiswa", "bermakna", "menggembirakan"]
            },
            mengaplikasikan: {
              type: Type.OBJECT,
              properties: {
                kegiatanGuru: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar kegiatan guru yang runtut" },
                kegiatanSiswa: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar kegiatan siswa yang runtut" },
                berkesadaran: { type: Type.STRING, description: "Penerapan pilar berkesadaran" },
                bermakna: { type: Type.STRING, description: "Penerapan pilar bermakna" }
              },
              required: ["kegiatanGuru", "kegiatanSiswa", "berkesadaran", "bermakna"]
            },
            merefleksikan: {
              type: Type.OBJECT,
              properties: {
                kegiatanGuru: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar kegiatan guru yang runtut" },
                kegiatanSiswa: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar kegiatan siswa yang runtut" },
                berkesadaran: { type: Type.STRING, description: "Penerapan pilar berkesadaran" },
                bermakna: { type: Type.STRING, description: "Penerapan pilar bermakna" }
              },
              required: ["kegiatanGuru", "kegiatanSiswa", "berkesadaran", "bermakna"]
            }
          },
          required: ["durasi", "memahami", "mengaplikasikan", "merefleksikan"]
        },
        kegiatanPenutup: {
          type: Type.OBJECT,
          properties: {
            durasi: { type: Type.STRING },
            kegiatan: { type: Type.ARRAY, items: { type: Type.STRING } },
            berkesadaran: { type: Type.STRING, description: "Deskripsi pilar berkesadaran di kegiatan penutup" }
          },
          required: ["durasi", "kegiatan", "berkesadaran"]
        }
      },
      required: ["pertemuanKe", "alokasiWaktu", "fokusMateri", "kegiatanAwal", "kegiatanInti", "kegiatanPenutup"]
    };

    const rppSchema = {
      type: Type.OBJECT,
      properties: {
        identitas: {
          type: Type.OBJECT,
          properties: {
            namaPenyusun: { type: Type.STRING },
            sekolah: { type: Type.STRING, description: "Satuan pendidikan" },
            tahunPelajaran: { type: Type.STRING },
            mataPelajaran: { type: Type.STRING },
            fase: { type: Type.STRING },
            kelasSemester: { type: Type.STRING },
            materiPokok: { type: Type.STRING },
            alokasiWaktu: { type: Type.STRING },
            modelPembelajaran: { type: Type.STRING }
          },
          required: ["namaPenyusun", "sekolah", "tahunPelajaran", "mataPelajaran", "fase", "kelasSemester", "alokasiWaktu", "modelPembelajaran"]
        },
        identifikasi: {
          type: Type.OBJECT,
          properties: {
            kesiapanPesertaDidik: {
              type: Type.OBJECT,
              properties: {
                pengetahuanAwal: { type: Type.STRING, description: "Penjelasan mengenai tingkat pengetahuan awal peserta didik" },
                keterampilanDasar: { type: Type.STRING, description: "Penjelasan mengenai keterampilan dasar peserta didik" },
                kesulitanBelajar: { type: Type.STRING, description: "Penjelasan mengenai kesulitan belajar atau miskonsepsi yang akan dihadapi" }
              },
              required: ["pengetahuanAwal", "keterampilanDasar", "kesulitanBelajar"]
            },
            materiPelajaran: { type: Type.STRING, description: "Penjelasan materi pelajaran / pokok pembahasan" },
            dimensiProfilLulusan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Dimensi Profil Lulusan yang dipilih dari 8 DPL resmi"
            }
          },
          required: ["kesiapanPesertaDidik", "materiPelajaran", "dimensiProfilLulusan"]
        },
        desainPembelajaran: {
          type: Type.OBJECT,
          properties: {
            tujuanPembelajaran: { type: Type.STRING, description: "Tujuan Pembelajaran (TP) yang dirumuskan secara rinci dan operasional" },
            alurTujuanPembelajaran: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Alur Tujuan Pembelajaran (ATP) atau indikator ketercapaian"
            },
            praktikPedagogis: { type: Type.STRING, description: "Penerapan praktik pedagogis, model & metode pembelajaran aktif" },
            kemitraanPembelajaran: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Kemitraan pembelajaran yang dilibatkan (orang tua, masyarakat, pakar/narasumber, dll)"
            },
            lingkunganPembelajaran: { type: Type.STRING, description: "Penataan lingkungan pembelajaran fisik, psikososial, dan sarpras" },
            pemanfaatanDigital: { type: Type.STRING, description: "Pemanfaatan media, alat, dan platform digital dalam pembelajaran" }
          },
          required: [
            "tujuanPembelajaran",
            "praktikPedagogis",
            "kemitraanPembelajaran",
            "lingkunganPembelajaran",
            "pemanfaatanDigital"
          ]
        },
        pengalamanBelajar: {
          type: Type.OBJECT,
          properties: {
            pertemuan: {
              type: Type.ARRAY,
              items: pertemuanItemSchema,
              description: `Daftar pertemuan pembelajaran (Wajib ${targetPertemuan} pertemuan)`
            }
          },
          required: ["pertemuan"]
        },
        asesmen: {
          type: Type.OBJECT,
          properties: {
            asesmenDiagnostik: {
              type: Type.OBJECT,
              properties: {
                teknik: { type: Type.STRING, description: "Teknik asesmen diagnostik, misal: Tes diagnostik kognitif/non-kognitif, tanya jawab lisan" },
                instrumen: { type: Type.STRING, description: "Instrumen asesmen diagnostik, misal: Lembar kuis singkat, daftar pertanyaan apersepsi" },
                deskripsi: { type: Type.STRING, description: "Deskripsi atau cara pelaksanaan asesmen diagnostik di awal pembelajaran" }
              },
              required: ["teknik", "instrumen", "deskripsi"]
            },
            asesmenFormatif: {
              type: Type.OBJECT,
              properties: {
                teknik: { type: Type.STRING, description: "Teknik asesmen formatif, misal: Observasi kinerja, unjuk kerja diskusi, penugasan proses" },
                instrumen: { type: Type.STRING, description: "Instrumen asesmen formatif, misal: Lembar observasi diskusi, lembar checklist kinerja LKPD" },
                deskripsi: { type: Type.STRING, description: "Deskripsi atau cara pelaksanaan asesmen formatif selama proses pembelajaran" }
              },
              required: ["teknik", "instrumen", "deskripsi"]
            },
            asesmenSumatif: {
              type: Type.OBJECT,
              properties: {
                teknik: { type: Type.STRING, description: "Teknik asesmen sumatif, misal: Tes tertulis pilihan ganda/uraian, produk karya, presentasi akhir" },
                instrumen: { type: Type.STRING, description: "Instrumen asesmen sumatif, misal: Lembar soal evaluasi akhir, rubrik penilaian produk" },
                deskripsi: { type: Type.STRING, description: "Deskripsi atau cara pelaksanaan asesmen sumatif di akhir lingkup materi" }
              },
              required: ["teknik", "instrumen", "deskripsi"]
            }
          },
          required: ["asesmenDiagnostik", "asesmenFormatif", "asesmenSumatif"]
        },
        lampiran: {
          type: Type.OBJECT,
          properties: {
            glosarium: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  istilah: { type: Type.STRING },
                  definisi: { type: Type.STRING }
                },
                required: ["istilah", "definisi"]
              }
            }
          },
          required: ["glosarium"]
        }
      },
      required: ["identitas", "identifikasi", "desainPembelajaran", "pengalamanBelajar", "asesmen", "lampiran"]
    };

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: userPrompt,
      systemInstruction: systemPrompt,
      responseSchema: rppSchema,
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Tidak menerima respons dari model Gemini.");
    }

    const rppData = JSON.parse(resultText);

    // Normalisasi identitas
    if (!rppData.identitas.materiPokok) {
      rppData.identitas.materiPokok = materiPokok || rppData.desainPembelajaran?.topikPembelajaran || "";
    }

    // Normalisasi identifikasi kesiapan peserta didik
    if (rppData.identifikasi?.kesiapanPesertaDidik && !rppData.identifikasi.murid) {
      rppData.identifikasi.murid = rppData.identifikasi.kesiapanPesertaDidik;
    } else if (rppData.identifikasi?.murid && !rppData.identifikasi.kesiapanPesertaDidik) {
      rppData.identifikasi.kesiapanPesertaDidik = rppData.identifikasi.murid;
    }

    // Normalisasi desain pembelajaran
    if (rppData.desainPembelajaran) {
      if (!rppData.desainPembelajaran.praktikPedagogis && rppData.desainPembelajaran.praktekPaedagogik) {
        rppData.desainPembelajaran.praktikPedagogis = rppData.desainPembelajaran.praktekPaedagogik;
      } else if (!rppData.desainPembelajaran.praktekPaedagogik && rppData.desainPembelajaran.praktikPedagogis) {
        rppData.desainPembelajaran.praktekPaedagogik = rppData.desainPembelajaran.praktikPedagogis;
      }

      if (!rppData.desainPembelajaran.kemitraanPembelajaran && rppData.desainPembelajaran.mitraPembelajaran) {
        rppData.desainPembelajaran.kemitraanPembelajaran = rppData.desainPembelajaran.mitraPembelajaran;
      } else if (!rppData.desainPembelajaran.mitraPembelajaran && rppData.desainPembelajaran.kemitraanPembelajaran) {
        rppData.desainPembelajaran.mitraPembelajaran = rppData.desainPembelajaran.kemitraanPembelajaran;
      }

      if (!rppData.desainPembelajaran.lingkunganPembelajaran && rppData.desainPembelajaran.lingkupPembelajaran) {
        rppData.desainPembelajaran.lingkunganPembelajaran = rppData.desainPembelajaran.lingkupPembelajaran;
      } else if (!rppData.desainPembelajaran.lingkupPembelajaran && rppData.desainPembelajaran.lingkunganPembelajaran) {
        rppData.desainPembelajaran.lingkupPembelajaran = rppData.desainPembelajaran.lingkunganPembelajaran;
      }
    }

    // Normalisasi pengalamanBelajar untuk memastikan kompatibilitas penuh
    if (rppData.pengalamanBelajar?.pertemuan && rppData.pengalamanBelajar.pertemuan.length > 0) {
      rppData.pengalamanBelajar.pertemuan.forEach((p: any) => {
        if (p.kegiatanInti) {
          if (!p.kegiatanInti.mengaplikasi && p.kegiatanInti.mengaplikasikan) {
            p.kegiatanInti.mengaplikasi = p.kegiatanInti.mengaplikasikan;
          } else if (!p.kegiatanInti.mengaplikasikan && p.kegiatanInti.mengaplikasi) {
            p.kegiatanInti.mengaplikasikan = p.kegiatanInti.mengaplikasi;
          }

          if (!p.kegiatanInti.merefleksi && p.kegiatanInti.merefleksikan) {
            p.kegiatanInti.merefleksi = p.kegiatanInti.merefleksikan;
          } else if (!p.kegiatanInti.merefleksikan && p.kegiatanInti.merefleksi) {
            p.kegiatanInti.merefleksikan = p.kegiatanInti.merefleksi;
          }
        }
      });

      if (!rppData.pengalamanBelajar.kegiatanAwal) {
        rppData.pengalamanBelajar.kegiatanAwal = rppData.pengalamanBelajar.pertemuan[0].kegiatanAwal;
      }
      if (!rppData.pengalamanBelajar.kegiatanInti) {
        rppData.pengalamanBelajar.kegiatanInti = rppData.pengalamanBelajar.pertemuan[0].kegiatanInti;
      }
      if (!rppData.pengalamanBelajar.kegiatanPenutup) {
        rppData.pengalamanBelajar.kegiatanPenutup = rppData.pengalamanBelajar.pertemuan[0].kegiatanPenutup;
      }
    } else if (rppData.pengalamanBelajar?.kegiatanAwal) {
      rppData.pengalamanBelajar.pertemuan = [{
        pertemuanKe: 1,
        alokasiWaktu: rppData.identitas?.alokasiWaktu || alokasiWaktu,
        fokusMateri: rppData.identitas?.materiPokok || rppData.desainPembelajaran?.topikPembelajaran || materiPokok,
        kegiatanAwal: rppData.pengalamanBelajar.kegiatanAwal,
        kegiatanInti: rppData.pengalamanBelajar.kegiatanInti,
        kegiatanPenutup: rppData.pengalamanBelajar.kegiatanPenutup
      }];
    }

    // Normalisasi Asesmen
    if (rppData.asesmen && !rppData.lampiran?.asesmenPembelajaran) {
      rppData.lampiran = rppData.lampiran || { glosarium: [] };
      rppData.lampiran.asesmenPembelajaran = [
        {
          jenis: "Asesmen Diagnostik",
          teknik: rppData.asesmen.asesmenDiagnostik?.teknik || "Apersepsi / Tes Diagnostik",
          instrumen: rppData.asesmen.asesmenDiagnostik?.instrumen || "Daftar Pertanyaan Lisan"
        },
        {
          jenis: "Asesmen Formatif",
          teknik: rppData.asesmen.asesmenFormatif?.teknik || "Observasi Proses Belajar",
          instrumen: rppData.asesmen.asesmenFormatif?.instrumen || "Rubrik / Lembar Observasi"
        },
        {
          jenis: "Asesmen Sumatif",
          teknik: rppData.asesmen.asesmenSumatif?.teknik || "Tes Tertulis / Unjuk Kerja",
          instrumen: rppData.asesmen.asesmenSumatif?.instrumen || "Soal Evaluasi / Rubrik Penilaian"
        }
      ];
    }

    res.json(rppData);
  } catch (error: any) {
    console.error("Error generating RPP:", error);
    res.status(500).json({ error: error.message || "Gagal menghasilkan RPP bertenaga AI." });
  }
});

// Configure Vite or production static handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
