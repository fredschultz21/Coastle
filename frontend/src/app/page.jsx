import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-4">
        <img 
          src="https://jddbikgujwntbkabchjw.supabase.co/storage/v1/object/public/map-images/daily/zoom_7_2025-12-18T17-50-19-724Z.png"
          alt="Map"
          className="max-w-full h-auto"
        />
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          © Mapbox © OpenStreetMap contributors
        </p>
      </main>
    </div>
  );
}