export const MATA_PELAJARAN_OPTIONS = [
  "Pendidikan Agama Islam",
  "Pendidikan Pancasila",
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPAS",
  "Pendidikan Jasmani dan Olahraga",
  "Pendidikan Seni",
  "Bahasa Daerah Bugis Makassar"
];

export const SENI_SUB_OPTIONS = [
  "Seni Rupa",
  "Seni Tari",
  "Seni Musik"
] as const;

export type SeniSubOption = (typeof SENI_SUB_OPTIONS)[number];

export const FASE_KELAS_OPTIONS = [
  "Fase A Kelas 1-2",
  "Fase B Kelas 3-4",
  "Fase C Kelas 5-6"
];

export const MODEL_PEMBELAJARAN_OPTIONS = [
  "Project-Based Learning (PjBL)",
  "Problem-Based Learning (PBL)",
  "Discovery Learning",
  "Inquiry Learning",
  "Blended Learning",
  "Pembelajaran Berdiferensiasi (Differentiated Learning)"
];

export interface SubjectSample {
  fase: string;
  materiPokok: string;
  alokasiWaktu: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
}

export const SUBJECT_SAMPLES: Record<string, SubjectSample> = {
  "Pendidikan Agama Islam": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Kisah Keteladanan Nabi Muhammad saw. Membangun Peradaban",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu memahami kisah keteladanan Nabi Muhammad saw. dalam membangun peradaban dan perdamaian, serta menerapkannya dalam akhlak kehidupan sehari-hari.",
    tujuanPembelajaran: "Peserta didik dapat menguraikan kisah keteladanan Nabi Muhammad saw. saat membangun kerukunan di Madinah dan menyusun contoh penerapan sikap perdamaian dalam berteman."
  },
  "Pendidikan Pancasila": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Makna Simbol-Simbol Pancasila dalam Kehidupan Sehari-hari",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu mengidentifikasi dan menjelaskan makna simbol-simbol Pancasila, serta bersikap sesuai dengan nilai-nilai luhur Pancasila di lingkungan keluarga, sekolah, dan masyarakat.",
    tujuanPembelajaran: "Peserta didik dapat mengaitkan makna lima simbol sila Pancasila dengan contoh tindakan konkret yang mencerminkan nilai-nilai luhur Pancasila di lingkungan sekolah."
  },
  "Matematika": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Penjumlahan dan Pengurangan Pecahan Biasa Penyebut Sama",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik dapat memahami konsep pecahan, mengidentifikasi pecahan senilai, serta menyelesaikan operasi penjumlahan dan pengurangan pecahan biasa berpenyebut sama dalam pemecahan masalah kehidupan sehari-hari.",
    tujuanPembelajaran: "Peserta didik dapat menyelesaikan operasi penjumlahan dan pengurangan pecahan biasa berpenyebut sama secara tepat menggunakan bantuan gambar blok pecahan."
  },
  "Bahasa Indonesia": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Membaca Intensif Cerita Rakyat Sulsel dan Mengidentifikasi Tokoh",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu memahami ide pokok dari teks narasi cerita rakyat daerah Sulawesi Selatan, mengidentifikasi tokoh, watak, serta amanat cerita, dan merefleksikan nilai moral cerita rakyat tersebut.",
    tujuanPembelajaran: "Peserta didik dapat membandingkan watak tokoh-tokoh utama dari cerita rakyat Sulawesi Selatan yang dibacanya secara kritis serta menyimpulkan amanat moralnya."
  },
  "Bahasa Inggris": {
    fase: "Fase A Kelas 1-2",
    materiPokok: "Introducing Myself and Greeting Others with Polite Expressions",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu merespons instruksi lisan sederhana, memperkenalkan diri sendiri, menyapa orang lain, serta menyampaikan salam perpisahan dengan pelafalan yang tepat dan santun.",
    tujuanPembelajaran: "Peserta didik dapat memperkenalkan identitas diri secara lisan (nama, usia, hobi) serta menyapa guru dan teman menggunakan ekspresi bahasa Inggris yang sopan."
  },
  "IPAS": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Siklus Hidup Hewan dan Upaya Pelestariannya di Indonesia",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu menganalisis siklus hidup berbagai makhluk hidup di sekitarnya, memahami metamorfosis sempurna dan tidak sempurna, serta mengidentifikasi pentingnya upaya pelestarian keanekaragaman hayati.",
    tujuanPembelajaran: "Peserta didik dapat merinci perbedaan siklus hidup metamorfosis sempurna dan tidak sempurna melalui pengamatan diagram daur hidup kupu-kupu dan belalang."
  },
  "Pendidikan Jasmani dan Olahraga": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Variasi Pola Gerak Dasar Lokomotor dalam Permainan Gobak Sodor",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik dapat mempraktikkan variasi pola gerak dasar lokomotor (berlari, melompat, meluncur) secara efektif, harmonis, dan aman dalam konteks olahraga tradisional Gobak Sodor.",
    tujuanPembelajaran: "Peserta didik dapat memperagakan variasi pola gerakan berlari zig-zag dan meluncur secara lincah serta aman untuk menghindari kejaran lawan dalam permainan Gobak Sodor."
  },
  "Pendidikan Jasmani dan olahraga": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Variasi Pola Gerak Dasar Lokomotor dalam Permainan Gobak Sodor",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik dapat mempraktikkan variasi pola gerak dasar lokomotor (berlari, melompat, meluncur) secara efektif, harmonis, dan aman dalam konteks olahraga tradisional Gobak Sodor.",
    tujuanPembelajaran: "Peserta didik dapat memperagakan variasi pola gerakan berlari zig-zag dan meluncur secara lincah serta aman untuk menghindari kejaran lawan dalam permainan Gobak Sodor."
  },
  "Pendidikan Seni": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Eksplorasi Garis, Bentuk, dan Warna dalam Membuat Karya Gambar Ragam Hias Dekoratif",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu mengamati, mengenal, merekam, dan menuangkan pengalaman kesehariannya secara visual dengan memanfaatkan garis, warna, dan bentuk untuk membuat karya gambar ragam hias dekoratif secara kreatif dan percaya diri.",
    tujuanPembelajaran: "Peserta didik dapat mengombinasikan variasi unsur garis dan warna kontras untuk menciptakan pola ragam hias fauna atau flora pada media gambar dengan rapi dan harmonis."
  },
  "Pendidikan Seni - Seni Rupa": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Eksplorasi Garis, Bentuk, dan Warna dalam Membuat Karya Gambar Ragam Hias Dekoratif",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu mengamati, mengenal, merekam, dan menuangkan pengalaman kesehariannya secara visual dengan memanfaatkan garis, warna, dan bentuk untuk membuat karya gambar ragam hias dekoratif secara kreatif dan percaya diri.",
    tujuanPembelajaran: "Peserta didik dapat mengombinasikan variasi unsur garis dan warna kontras untuk menciptakan pola ragam hias fauna atau flora pada media gambar dengan rapi dan harmonis."
  },
  "Pendidikan Seni - Seni Tari": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Koordinasi Gerak Dasar Tari Tradisional Berdasarkan Irama dan Ruang",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu mengidentifikasi, memperagakan, dan mengoordinasikan gerak tari dasar (tangan, kaki, dan kepala) sesuai dengan ketukan/irama musik pengiring serta menghargai keunikan ragam gerak tari tradisi nusantara.",
    tujuanPembelajaran: "Peserta didik dapat memperagakan rangkaian 3 ragam gerak dasar tari tradisional secara serasi dan selaras dengan tempo musik pengiring secara mandiri maupun berkelompok."
  },
  "Pendidikan Seni - Seni Musik": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Eksplorasi Pola Irama Sederhana dan Melodi Lagu Daerah dengan Alat Musik Ritmis",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu mengeksplorasi dan memainkan pola irama sederhana menggunakan alat musik perkusi/ritmis atau tepukan tubuh, serta bernyanyi lagu daerah dengan intonasi dan artikulasi yang tepat secara gembira.",
    tujuanPembelajaran: "Peserta didik dapat memainkan pola ritme birama 4/4 menggunakan alat musik perkusi sederhana sembari menyanyikan bait lagu daerah secara serempak dan kompak."
  },
  "Bahasa Daerah Bugis Makassar": {
    fase: "Fase B Kelas 3-4",
    materiPokok: "Membaca dan Menulis Aksara Lontara Sederhana",
    alokasiWaktu: "4x35 menit",
    capaianPembelajaran: "Peserta didik mampu melafalkan bunyi huruf-huruf Lontara, mengidentifikasi tanda baca vokal (ana' sura'), serta membaca dan menuliskan kata maupun frasa sederhana beraksara Lontara secara tepat.",
    tujuanPembelajaran: "Peserta didik dapat merangkai aksara Lontara dasar dan tanda baca vokal (ana' sura') menjadi kata sehari-hari secara tepat dan mandiri."
  }
};
