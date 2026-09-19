import { RPPData, PertemuanBelajar } from "../types";

export function exportRPPToWord(s: RPPData) {
  const materiPokokStr = s.identitas.materiPokok || s.desainPembelajaran?.topikPembelajaran || s.identifikasi.materiPelajaran || "";

  // Helper daftar pertemuan
  const daftarPertemuan: PertemuanBelajar[] = 
    (s.pengalamanBelajar?.pertemuan && s.pengalamanBelajar.pertemuan.length > 0)
      ? s.pengalamanBelajar.pertemuan
      : [
          {
            pertemuanKe: 1,
            alokasiWaktu: s.identitas.alokasiWaktu,
            fokusMateri: materiPokokStr,
            kegiatanAwal: s.pengalamanBelajar?.kegiatanAwal || { durasi: "10 menit", kegiatan: [], berkesadaran: "", bermakna: "" },
            kegiatanInti: s.pengalamanBelajar?.kegiatanInti || {
              durasi: "50 menit",
              memahami: { kegiatanGuru: [], kegiatanSiswa: [] },
              mengaplikasikan: { kegiatanGuru: [], kegiatanSiswa: [] },
              merefleksikan: { kegiatanGuru: [], kegiatanSiswa: [] }
            },
            kegiatanPenutup: s.pengalamanBelajar?.kegiatanPenutup || { durasi: "10 menit", kegiatan: [], berkesadaran: "" }
          }
        ];

  const kesiapan = s.identifikasi.kesiapanPesertaDidik || s.identifikasi.murid;
  const praktikPedagogis = s.desainPembelajaran.praktikPedagogis || s.desainPembelajaran.praktekPaedagogik || s.identitas.modelPembelajaran || "";
  const kemitraan = s.desainPembelajaran.kemitraanPembelajaran || s.desainPembelajaran.mitraPembelajaran || [];
  const lingkungan = s.desainPembelajaran.lingkunganPembelajaran || s.desainPembelajaran.lingkupPembelajaran || "";

  const asesmenDiag = s.asesmen?.asesmenDiagnostik || {
    teknik: s.lampiran?.asesmenPembelajaran?.[0]?.teknik || "Tanya jawab lisan / Tes diagnostik",
    instrumen: s.lampiran?.asesmenPembelajaran?.[0]?.instrumen || "Daftar pertanyaan pemantik",
    deskripsi: "Dilakukan di awal pembelajaran untuk memetakan kesiapan peserta didik."
  };

  const asesmenForm = s.asesmen?.asesmenFormatif || {
    teknik: s.lampiran?.asesmenPembelajaran?.[1]?.teknik || "Observasi proses belajar & diskusi",
    instrumen: s.lampiran?.asesmenPembelajaran?.[1]?.instrumen || "Lembar observasi & rubrik kerja kelompok",
    deskripsi: "Dilakukan selama proses pembelajaran berlangsung secara berkelanjutan."
  };

  const asesmenSum = s.asesmen?.asesmenSumatif || {
    teknik: s.lampiran?.asesmenPembelajaran?.[2]?.teknik || "Tes tertulis / Penilaian produk akhir",
    instrumen: s.lampiran?.asesmenPembelajaran?.[2]?.instrumen || "Soal tes evaluasi akhir / rubrik produk",
    deskripsi: "Dilakukan di akhir kegiatan pembelajaran untuk mengukur ketercapaian tujuan."
  };

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>PERENCANAAN PEMBELAJARAN MENDALAM</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000000;
          margin: 20px;
        }
        .header-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 20px;
          border-bottom: 2px solid #000000;
          padding-bottom: 8px;
        }
        .identitas-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11pt;
        }
        .identitas-table td {
          padding: 4px 6px;
          vertical-align: top;
        }
        .identitas-label {
          width: 25%;
          font-weight: bold;
        }
        .identitas-separator {
          width: 3%;
          font-weight: bold;
        }
        .identitas-value {
          width: 72%;
        }
        h2.section-heading {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 18px;
          margin-bottom: 6px;
          color: #000000;
          border-bottom: 1px solid #000000;
          padding-bottom: 2px;
        }
        h3.subsection-heading {
          font-size: 11pt;
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 4px;
        }
        ul, ol {
          margin-top: 2px;
          margin-bottom: 6px;
          padding-left: 24px;
        }
        li {
          margin-bottom: 3px;
        }
        .content-block {
          margin-left: 18px;
          margin-bottom: 8px;
        }
        .deep-pertemuan-banner {
          background-color: #f1f5f9;
          font-weight: bold;
          font-size: 11pt;
          padding: 4px 8px;
          margin-top: 12px;
          margin-bottom: 8px;
          border-left: 4px solid #0f766e;
        }
        .tanda-tangan {
          margin-top: 30px;
          width: 100%;
          border-collapse: collapse;
        }
        .tanda-tangan td {
          width: 50%;
          text-align: center;
          vertical-align: top;
          font-size: 11pt;
        }
      </style>
    </head>
    <body>
      <div class="header-title">PERENCANAAN PEMBELAJARAN MENDALAM</div>

      <!-- IDENTITAS -->
      <table class="identitas-table">
        <tr>
          <td class="identitas-label">Mata Pelajaran</td>
          <td class="identitas-separator">:</td>
          <td class="identitas-value"><strong>${s.identitas.mataPelajaran}</strong></td>
        </tr>
        <tr>
          <td class="identitas-label">Kelas/ Semester</td>
          <td class="identitas-separator">:</td>
          <td class="identitas-value">${s.identitas.kelasSemester}</td>
        </tr>
        <tr>
          <td class="identitas-label">Materi Pokok</td>
          <td class="identitas-separator">:</td>
          <td class="identitas-value"><strong>${materiPokokStr}</strong></td>
        </tr>
        <tr>
          <td class="identitas-label">Alokasi Waktu</td>
          <td class="identitas-separator">:</td>
          <td class="identitas-value">${s.identitas.alokasiWaktu}</td>
        </tr>
        ${s.identitas.sekolah ? `
        <tr>
          <td class="identitas-label">Satuan Pendidikan</td>
          <td class="identitas-separator">:</td>
          <td class="identitas-value">${s.identitas.sekolah} (Tahun Pelajaran: ${s.identitas.tahunPelajaran})</td>
        </tr>` : ''}
      </table>

      <!-- I. IDENTIFIKASI -->
      <h2 class="section-heading">I. IDENTIFIKASI</h2>
      
      <h3 class="subsection-heading">A. Kesiapan Peserta Didik</h3>
      <div class="content-block">
        <p><strong>1. Pengetahuan Awal Peserta Didik:</strong><br>${kesiapan?.pengetahuanAwal || "-"}</p>
        <p><strong>2. Keterampilan Dasar:</strong><br>${kesiapan?.keterampilanDasar || "-"}</p>
        <p><strong>3. Potensi Kesulitan Belajar:</strong><br>${kesiapan?.kesulitanBelajar || "-"}</p>
      </div>

      <h3 class="subsection-heading">B. Materi Pelajaran</h3>
      <div class="content-block">
        <p>${s.identifikasi.materiPelajaran || "-"}</p>
      </div>

      <h3 class="subsection-heading">C. Dimensi Profil Lulusan</h3>
      <div class="content-block">
        <ul>
          ${(s.identifikasi.dimensiProfilLulusan || []).map(dpl => `<li>${dpl}</li>`).join("")}
        </ul>
      </div>

      <!-- II. DESAIN PEMBELAJARAN -->
      <h2 class="section-heading">II. DESAIN PEMBELAJARAN</h2>

      <h3 class="subsection-heading">A. Tujuan Pembelajaran</h3>
      <div class="content-block">
        <p><strong>Tujuan Pembelajaran:</strong><br><em>"${s.desainPembelajaran.tujuanPembelajaran}"</em></p>
        ${s.desainPembelajaran.alurTujuanPembelajaran && s.desainPembelajaran.alurTujuanPembelajaran.length > 0 ? `
        <p><strong>Alur Tujuan Pembelajaran (ATP) / Indikator Ketercapaian:</strong></p>
        <ol>
          ${s.desainPembelajaran.alurTujuanPembelajaran.map(atp => `<li>${atp}</li>`).join("")}
        </ol>` : ''}
      </div>

      <h3 class="subsection-heading">B. Praktik Pedagogis</h3>
      <div class="content-block">
        <p>${praktikPedagogis}</p>
      </div>

      <h3 class="subsection-heading">C. Kemitraan Pembelajaran</h3>
      <div class="content-block">
        ${kemitraan.length > 0 ? `
        <ul>
          ${kemitraan.map(k => `<li>${k}</li>`).join("")}
        </ul>` : `<p>-</p>`}
      </div>

      <h3 class="subsection-heading">D. Lingkungan Pembelajaran</h3>
      <div class="content-block">
        <p>${lingkungan || "-"}</p>
      </div>

      <h3 class="subsection-heading">E. Pemanfaatan Digital</h3>
      <div class="content-block">
        <p>${s.desainPembelajaran.pemanfaatanDigital || "-"}</p>
      </div>

      <!-- III. PENGALAMAN BELAJAR -->
      <h2 class="section-heading">III. PENGALAMAN BELAJAR (Menerapkan prinsip Deeplearning)</h2>

      ${daftarPertemuan.map(p => `
        ${daftarPertemuan.length > 1 ? `
        <div class="deep-pertemuan-banner">
          PERTEMUAN ${p.pertemuanKe}${p.alokasiWaktu ? ` (${p.alokasiWaktu})` : ""}${p.fokusMateri ? ` - Fokus: ${p.fokusMateri}` : ""}
        </div>` : ''}

        <h3 class="subsection-heading">A. Kegiatan Awal (Durasi: ${p.kegiatanAwal?.durasi || "10 menit"})</h3>
        <div class="content-block">
          <ul>
            ${(p.kegiatanAwal?.kegiatan || []).map(k => `<li>${k}</li>`).join("")}
          </ul>
          ${p.kegiatanAwal?.berkesadaran ? `<p><em>Pilar Berkesadaran: "${p.kegiatanAwal.berkesadaran}"</em></p>` : ''}
          ${p.kegiatanAwal?.bermakna ? `<p><em>Pilar Bermakna: "${p.kegiatanAwal.bermakna}"</em></p>` : ''}
        </div>

        <h3 class="subsection-heading">B. Kegiatan Inti (Durasi: ${p.kegiatanInti?.durasi || "50 menit"})</h3>
        <div class="content-block">
          <!-- Memahami -->
          <p><strong>• Memahami</strong></p>
          <ul>
            <li><strong>Aktivitas Guru:</strong>
              <ul>${(p.kegiatanInti?.memahami?.kegiatanGuru || []).map(kg => `<li>${kg}</li>`).join("")}</ul>
            </li>
            <li><strong>Aktivitas Siswa:</strong>
              <ul>${(p.kegiatanInti?.memahami?.kegiatanSiswa || []).map(ks => `<li>${ks}</li>`).join("")}</ul>
            </li>
          </ul>
          ${(p.kegiatanInti?.memahami?.bermakna || p.kegiatanInti?.memahami?.menggembirakan) ? `
          <p style="font-size: 10pt; color: #334155;">
            <em>Prinsip Deep Learning: Bermakna ("${p.kegiatanInti?.memahami?.bermakna || "-"}") | Menggembirakan ("${p.kegiatanInti?.memahami?.menggembirakan || "-"}")</em>
          </p>` : ''}

          <!-- Mengaplikasikan -->
          <p style="margin-top: 8px;"><strong>• Mengaplikasikan</strong></p>
          <ul>
            <li><strong>Aktivitas Guru:</strong>
              <ul>${(p.kegiatanInti?.mengaplikasikan?.kegiatanGuru || p.kegiatanInti?.mengaplikasi?.kegiatanGuru || []).map(kg => `<li>${kg}</li>`).join("")}</ul>
            </li>
            <li><strong>Aktivitas Siswa:</strong>
              <ul>${(p.kegiatanInti?.mengaplikasikan?.kegiatanSiswa || p.kegiatanInti?.mengaplikasi?.kegiatanSiswa || []).map(ks => `<li>${ks}</li>`).join("")}</ul>
            </li>
          </ul>
          ${(p.kegiatanInti?.mengaplikasikan?.berkesadaran || p.kegiatanInti?.mengaplikasi?.berkesadaran) ? `
          <p style="font-size: 10pt; color: #334155;">
            <em>Prinsip Deep Learning: Berkesadaran ("${p.kegiatanInti?.mengaplikasikan?.berkesadaran || p.kegiatanInti?.mengaplikasi?.berkesadaran || "-"}") | Bermakna ("${p.kegiatanInti?.mengaplikasikan?.bermakna || p.kegiatanInti?.mengaplikasi?.bermakna || "-"}")</em>
          </p>` : ''}

          <!-- Merefleksikan -->
          <p style="margin-top: 8px;"><strong>• Merefleksikan</strong></p>
          <ul>
            <li><strong>Aktivitas Guru:</strong>
              <ul>${(p.kegiatanInti?.merefleksikan?.kegiatanGuru || p.kegiatanInti?.merefleksi?.kegiatanGuru || []).map(kg => `<li>${kg}</li>`).join("")}</ul>
            </li>
            <li><strong>Aktivitas Siswa:</strong>
              <ul>${(p.kegiatanInti?.merefleksikan?.kegiatanSiswa || p.kegiatanInti?.merefleksi?.kegiatanSiswa || []).map(ks => `<li>${ks}</li>`).join("")}</ul>
            </li>
          </ul>
          ${(p.kegiatanInti?.merefleksikan?.berkesadaran || p.kegiatanInti?.merefleksi?.berkesadaran) ? `
          <p style="font-size: 10pt; color: #334155;">
            <em>Prinsip Deep Learning: Berkesadaran ("${p.kegiatanInti?.merefleksikan?.berkesadaran || p.kegiatanInti?.merefleksi?.berkesadaran || "-"}") | Bermakna ("${p.kegiatanInti?.merefleksikan?.bermakna || p.kegiatanInti?.merefleksi?.bermakna || "-"}")</em>
          </p>` : ''}
        </div>

        <h3 class="subsection-heading">C. Kegiatan Penutup (Durasi: ${p.kegiatanPenutup?.durasi || "10 menit"})</h3>
        <div class="content-block">
          <ul>
            ${(p.kegiatanPenutup?.kegiatan || []).map(k => `<li>${k}</li>`).join("")}
          </ul>
          ${p.kegiatanPenutup?.berkesadaran ? `<p><em>Pilar Berkesadaran: "${p.kegiatanPenutup.berkesadaran}"</em></p>` : ''}
        </div>
      `).join("")}

      <!-- IV. ASESMEN -->
      <h2 class="section-heading">IV. ASESMEN</h2>

      <h3 class="subsection-heading">A. Asesmen Diagnostik</h3>
      <div class="content-block">
        <p><strong>Teknik:</strong> ${asesmenDiag.teknik}</p>
        <p><strong>Instrumen:</strong> ${asesmenDiag.instrumen}</p>
        <p><strong>Deskripsi Pelaksanaan:</strong> ${asesmenDiag.deskripsi || "-"}</p>
      </div>

      <h3 class="subsection-heading">B. Asesmen Formatif</h3>
      <div class="content-block">
        <p><strong>Teknik:</strong> ${asesmenForm.teknik}</p>
        <p><strong>Instrumen:</strong> ${asesmenForm.instrumen}</p>
        <p><strong>Deskripsi Pelaksanaan:</strong> ${asesmenForm.deskripsi || "-"}</p>
      </div>

      <h3 class="subsection-heading">C. Asesmen Sumatif</h3>
      <div class="content-block">
        <p><strong>Teknik:</strong> ${asesmenSum.teknik}</p>
        <p><strong>Instrumen:</strong> ${asesmenSum.instrumen}</p>
        <p><strong>Deskripsi Pelaksanaan:</strong> ${asesmenSum.deskripsi || "-"}</p>
      </div>

      <!-- LAMPIRAN -->
      ${s.lampiran?.glosarium && s.lampiran.glosarium.length > 0 ? `
      <h2 class="section-heading">LAMPIRAN: GLOSARIUM</h2>
      <div class="content-block">
        <table style="width: 100%; border-collapse: collapse; margin-top: 6px;" border="1" cellpadding="5">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="width: 30%; text-align: left;">Istilah</th>
              <th style="width: 70%; text-align: left;">Definisi / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${s.lampiran.glosarium.map(g => `
              <tr>
                <td><strong>${g.istilah}</strong></td>
                <td>${g.definisi}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>` : ''}

      <!-- TANDA TANGAN -->
      <table class="tanda-tangan">
        <tr>
          <td>
            Mengetahui,<br>
            Kepala Sekolah ${s.identitas.sekolah}<br><br><br><br>
            <strong>___________________________</strong><br>
            NIP. ..................................
          </td>
          <td>
            Makassar, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br>
            Guru Mata Pelajaran,<br><br><br><br>
            <strong>${s.identitas.namaPenyusun}</strong><br>
            NIP. ..................................
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + wordHtml], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileNameSlug = (materiPokokStr || "Perencanaan_Pembelajaran_Mendalam").replace(/[^a-zA-Z0-9]/g, "_");
  link.download = `RPP_${fileNameSlug}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
