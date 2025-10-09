// "use client";

// import React from "react";
// import Image from "next/image";

// export default function ComingSoon() {
//   return (
//     <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
//       <div className="max-w-4xl w-full text-center relative">
//         {/* confetti/background decorative images (letakkan di public/images/) */}
//         <Image
//           src="/icons/confetti/Confetti Triangle.svg"
//           alt=""
//           width={100}
//           height={100}
//           className="pointer-events-none absolute left-44 top-8 w-8 opacity-80"
//         />
//         <Image
//           src="/icons/confetti/Confetti Dot.svg"
//           alt=""
//           width={100}
//           height={100}
//           className="pointer-events-none absolute left-35 top-38 w-5 opacity-80"
//         />
//         <Image
//           src="/icons/confetti/Confetti Badge.svg"
//           alt=""
//           width={100}
//           height={100}
//           className="pointer-events-none absolute -left-20 top-58 w-12 opacity-80"
//         />
        
//         <Image
//           src="/icons/confetti/Confetti Square.svg"
//           alt=""
//           width={100}
//           height={100}
//           className="pointer-events-none absolute bottom-10 left-0 w-7 opacity-80"
//         />

//         <Image
//           src="/icons/confetti/Confetti Arch.svg"
//           alt=""
//           width={100}
//           height={100}
//           className="pointer-events-none absolute right-36 top-16 w-12 opacity-80"
//         />
//         <Image
//           src="/icons/confetti/Confetti Ribbon.svg"
//           alt=""
//           width={100}
//           height={100}
//           className="pointer-events-none absolute -right-5 top-56 w-10 opacity-80"
//         />
        
//         <Image
//           src="/icons/confetti/Confetti Circle.svg"
//           alt=""
//           width={100}
//           height={100}
//           className="pointer-events-none absolute -bottom-10 right-0 w-8 opacity-80"
//         />

//         <div className="mb-6">
//           <Image src="/images/Logo etm.png" width={1000}
//           height={1000} alt="logo" className="mx-auto w-28" />
//         </div>

//         <h1 className="text-2xl sm:text-3xl font-semibold mb-2 font-poppins">This page is under construction</h1>
//         <p className="text-sm text-gray-500 mb-6 font-montserrat">
//           We&apos;re working on it!
//         </p>

//         <div className="mx-auto mb-6">
//           {/* ilustrasi utama */}
//           <Image
//             src="/icons/underConstruction.svg"
//             width={1000}
//             height={1000}
//             alt="coming soon illustration"
//             className="mx-auto w-full max-w-lg"
//           />
//         </div>


//         <footer className="mt-8 text-xs text-gray-400">
//           © {new Date().getFullYear()} Ekatunggal Group | All Rights Reserved
//         </footer>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

export default function ComingSoon() {
  const timersRef = useRef<number[]>([]);
  const confettiInstanceRef = useRef<ReturnType<typeof import("canvas-confetti").create> | null>(null);

  useEffect(() => {
    // Jangan jalankan confetti di server / mobile kecil
    if (typeof window === "undefined") return;
    if (window.innerWidth < 640) return; // skip on small screens for perf

    let stopped = false;

    (async function runConfetti() {
      try {
        const mod = await import("canvas-confetti");
        const confettiLib: typeof import("canvas-confetti") = (mod.default ?? mod);

        // buat instance yang resize otomatis dan gunakan worker bila tersedia
        const confetti = confettiLib.create(undefined, {
          resize: true,
          useWorker: true,
        });

        confettiInstanceRef.current = confetti;

        // Durasi total confetti (ms)
        const duration = 2000;
        const end = Date.now() + duration;

        // fungsi rekursif untuk beberapa burst
        const frame = () => {
          if (stopped) return;
          // burst acak kecil untuk terlihat natural
          confetti({
            particleCount: 20,
            spread: 55,
            ticks: 120,
            origin: { x: Math.random(), y: Math.random() * 0.6 },
          });

          // jadwalkan next burst selama durasi belum habis
          if (Date.now() < end) {
            const id = window.setTimeout(frame, 250);
            timersRef.current.push(id);
          }
        };

        // jalankan frame pertama
        frame();
      } catch (err) {
        // jangan crash kalau import gagal
        // (mis. package belum terinstall)
        // eslint-disable-next-line no-console
        console.warn("Failed to load canvas-confetti:", err);
      }
    })();

    return () => {
      stopped = true;
      // clear semua timeout
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      confettiInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full text-center relative">
        {/* confetti/background decorative images (letakkan di public/icons/confetti/) */}
        <Image
          src="/icons/confetti/Confetti Triangle.svg"
          alt=""
          width={100}
          height={100}
          className="pointer-events-none absolute left-44 top-8 w-8 opacity-80"
        />
        <Image
          src="/icons/confetti/Confetti Dot.svg"
          alt=""
          width={100}
          height={100}
          className="pointer-events-none absolute left-35 top-38 w-5 opacity-80"
        />
        <Image
          src="/icons/confetti/Confetti Badge.svg"
          alt=""
          width={100}
          height={100}
          className="pointer-events-none absolute -left-20 top-58 w-12 opacity-80"
        />

        <Image
          src="/icons/confetti/Confetti Square.svg"
          alt=""
          width={100}
          height={100}
          className="pointer-events-none absolute bottom-10 left-0 w-7 opacity-80"
        />

        <Image
          src="/icons/confetti/Confetti Arch.svg"
          alt=""
          width={100}
          height={100}
          className="pointer-events-none absolute right-36 top-16 w-12 opacity-80"
        />
        <Image
          src="/icons/confetti/Confetti Ribbon.svg"
          alt=""
          width={100}
          height={100}
          className="pointer-events-none absolute -right-5 top-56 w-10 opacity-80"
        />

        <Image
          src="/icons/confetti/Confetti Circle.svg"
          alt=""
          width={100}
          height={100}
          className="pointer-events-none absolute -bottom-10 right-0 w-8 opacity-80"
        />

        <div className="mb-6">
          <Image
            src="/images/logo_etm.png"
            width={100}
            height={100}
            alt="logo"
            className="mx-auto w-28"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 font-poppins">
          This page is under construction
        </h1>
        <p className="text-sm text-gray-500 mb-6 font-montserrat">
          We&apos;re working on it!
        </p>

        <div className="mx-auto mb-6">
          {/* ilustrasi utama */}
          <Image
            src="/icons/underConstruction.svg"
            width={1000}
            height={1000}
            alt="coming soon illustration"
            className="mx-auto w-full max-w-lg"
          />
        </div>

        <footer className="mt-8 text-xs text-gray-400">
          © {new Date().getFullYear()} Ekatunggal Group | All Rights Reserved
        </footer>
      </div>
    </div>
  );
}
