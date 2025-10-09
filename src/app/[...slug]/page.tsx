import ComingSoon from "@/components/ComingSoon";

export const dynamic = "force-static"; // opsional, kalau mau statis

export default function CatchAll() {
  // Perhatian: file ini akan menangkap semua rute yang tidak match
  // semua route spesifik yang sudah ada tetap akan diprioritaskan.
  return <ComingSoon />;
}
