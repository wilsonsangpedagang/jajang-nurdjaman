import type { ZoneResult } from "@/types";

interface ZoneBannerProps {
  zone: ZoneResult;
}

const CONFIG = {
  MERAH: {
    gradient: "bg-gradient-to-r from-red-900/80 to-red-800/60 border-b border-red-500/30",
    icon: "🚫",
    label: "Zona Merah — Jalur Hijau / RTH",
    desc: "Usaha komersial dilarang (Perda DKI No. 8/2007). Risiko penertiban Satpol PP.",
    pillClass: "bg-red-500/20 text-red-300 border border-red-500/30",
  },
  KUNING: {
    gradient: "bg-gradient-to-r from-amber-900/80 to-amber-800/60 border-b border-amber-500/30",
    icon: "⚠️",
    label: "Zona Kuning — Penggunaan Campuran",
    desc: "Izin usaha komersial bersyarat. Pastikan IMB dan izin usaha sesuai peruntukan.",
    pillClass: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  },
  HIJAU: {
    gradient: "bg-gradient-to-r from-emerald-900/80 to-emerald-800/60 border-b border-emerald-500/30",
    icon: "✅",
    label: "Zona Hijau — Kawasan Komersial",
    desc: "Lokasi ini sesuai RDTR untuk usaha perdagangan dan jasa. Aman dari risiko zonasi.",
    pillClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  },
  UNKNOWN: {
    gradient: "bg-gradient-to-r from-slate-800/80 to-slate-700/60 border-b border-white/10",
    icon: "ℹ️",
    label: "Validasi Zonasi RDTR",
    desc: "Data zonasi tidak tersedia. Verifikasi manual di portal RDTR Jakarta.",
    pillClass: "bg-white/10 text-slate-300 border border-white/20",
  },
} as const;

export default function ZoneBanner({ zone }: ZoneBannerProps) {
  const cfg = CONFIG[zone.zone_label] ?? CONFIG.UNKNOWN;

  return (
    <div className={`${cfg.gradient} py-3 px-6`}>
      <div className="container flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{cfg.icon}</span>
          <div>
            <span className="font-bold text-white text-sm">{cfg.label}</span>
            {zone.zone_name && zone.zone_name !== "Tidak Ada Data" && (
              <span className="ml-2 text-xs text-white/60">· {zone.zone_name}</span>
            )}
            <p className="text-xs text-white/70 mt-0.5">{cfg.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.pillClass}`}>
            RTH {Math.round(zone.green_zone_ratio * 100)}%
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.pillClass}`}>
            Komersial {Math.round(zone.commercial_ratio * 100)}%
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.pillClass}`}>
            Campuran {Math.round(zone.mixed_use_ratio * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
