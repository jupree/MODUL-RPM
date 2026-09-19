export interface IdentitasRPP {
  namaPenyusun: string;
  sekolah: string; // Satuan pendidikan
  tahunPelajaran: string;
  mataPelajaran: string;
  fase: string;
  kelasSemester: string; // Kelas/semester
  materiPokok?: string;
  alokasiWaktu: string;
  modelPembelajaran: string;
}

export interface KesiapanPesertaDidik {
  pengetahuanAwal: string;
  keterampilanDasar: string;
  kesulitanBelajar: string;
  deskripsiUmum?: string;
}

export interface IdentifikasiRPP {
  kesiapanPesertaDidik?: KesiapanPesertaDidik;
  murid?: KesiapanPesertaDidik; // backwards compatibility
  materiPelajaran: string; // Deskripsi materi pokok/pembahasan
  dimensiProfilLulusan: string[]; // Dimensi Profil Pelajar Pancasila / DPL
}

export interface DesainPembelajaran {
  capaianPembelajaran?: string;
  tujuanPembelajaran: string;
  alurTujuanPembelajaran?: string[];
  topikPembelajaran?: string;
  lintasDisiplinIlmu?: string;
  praktikPedagogis?: string; // Penerapan praktik pedagogis
  praktekPaedagogik?: string; // alias
  kemitraanPembelajaran?: string[]; // Mitra pembelajaran
  mitraPembelajaran?: string[]; // alias
  lingkunganPembelajaran?: string; // Lingkungan pembelajaran
  lingkupPembelajaran?: string; // alias
  pemanfaatanDigital: string;
}

export interface KegiatanIntiTahap {
  kegiatanGuru: string[];
  kegiatanSiswa: string[];
  bermakna?: string;
  berkesadaran?: string;
  menggembirakan?: string;
}

export interface PertemuanBelajar {
  pertemuanKe: number;
  alokasiWaktu: string;
  fokusMateri: string;
  kegiatanAwal: {
    durasi: string;
    kegiatan: string[];
    berkesadaran: string;
    bermakna: string;
  };
  kegiatanInti: {
    durasi: string;
    memahami: KegiatanIntiTahap; // bermakna, menggembirakan
    mengaplikasikan?: KegiatanIntiTahap; // berkesadaran, bermakna
    mengaplikasi?: KegiatanIntiTahap; // alias
    merefleksikan?: KegiatanIntiTahap; // berkesadaran, bermakna
    merefleksi?: KegiatanIntiTahap; // alias
  };
  kegiatanPenutup: {
    durasi: string;
    kegiatan: string[];
    berkesadaran: string;
  };
}

export interface PengalamanBelajar {
  // Daftar pertemuan jika pembelajaran terdiri dari 2 atau 3 pertemuan
  pertemuan?: PertemuanBelajar[];
  // Struktur tunggal untuk kompatibilitas / 1 pertemuan
  kegiatanAwal?: {
    durasi: string;
    kegiatan: string[];
    berkesadaran: string;
    bermakna: string;
  };
  kegiatanInti?: {
    durasi: string;
    memahami: KegiatanIntiTahap; // bermakna, menggembirakan
    mengaplikasikan?: KegiatanIntiTahap;
    mengaplikasi?: KegiatanIntiTahap;
    merefleksikan?: KegiatanIntiTahap;
    merefleksi?: KegiatanIntiTahap;
  };
  kegiatanPenutup?: {
    durasi: string;
    kegiatan: string[];
    berkesadaran: string;
  };
}

export interface AsesmenItem {
  teknik: string;
  instrumen: string;
  deskripsi?: string;
  keterangan?: string;
}

export interface AsesmenRPP {
  asesmenDiagnostik: AsesmenItem;
  asesmenFormatif: AsesmenItem;
  asesmenSumatif: AsesmenItem;
}

export interface AsesmenDetail {
  jenis: string;
  teknik: string;
  instrumen: string;
}

export interface GlosariumItem {
  istilah: string;
  definisi: string;
}

export interface LampiranRPP {
  asesmenPembelajaran?: AsesmenDetail[];
  glosarium: GlosariumItem[];
}

export interface RPPData {
  identitas: IdentitasRPP;
  identifikasi: IdentifikasiRPP;
  desainPembelajaran: DesainPembelajaran;
  pengalamanBelajar: PengalamanBelajar;
  asesmen: AsesmenRPP;
  lampiran?: LampiranRPP;
}

