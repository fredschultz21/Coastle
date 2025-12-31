import Head from "next/head";
import Link from "next/link";

export default function HowToPlay() {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
          <div className="mb-12">
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors font-medium text-sm tracking-wide">
              ← BACK
            </Link>
          </div>

          <div className="mb-16">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
              coastle
            </h1>
            <p className="text-zinc-500 text-lg tracking-wide">
              A daily geography challenge
            </p>
          </div>

          <div className="space-y-16">
            <section className="max-w-2xl mx-auto">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 mb-6">
                OBJECTIVE
              </h2>
              <p className="text-zinc-300 text-lg md:text-xl leading-relaxed">
                Identify a coastal location from satellite imagery. Start with a close view and zoom out strategically to reveal more context. Accuracy and efficiency determine your score.
              </p>
            </section>

            <section className="max-w-2xl mx-auto">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 mb-8">
                GAMEPLAY
              </h2>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 border border-zinc-700 rounded-full flex items-center justify-center font-bold text-sm text-zinc-400">
                    1
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Examine the imagery
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      Study the coastline, terrain features, and any visible landmarks or structures.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 border border-zinc-700 rounded-full flex items-center justify-center font-bold text-sm text-zinc-400">
                    2
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Zoom out strategically
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      You have limited zoom-outs. Each level reveals more area but reduces your potential score.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 border border-zinc-700 rounded-full flex items-center justify-center font-bold text-sm text-zinc-400">
                    3
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Place your marker
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      Open the world map, navigate to your predicted location, and drop a pin.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 border border-zinc-700 rounded-full flex items-center justify-center font-bold text-sm text-zinc-400">
                    4
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Submit and review
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      See your distance from the target and your final score breakdown.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-2xl mx-auto">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 mb-8">
                SCORING SYSTEM
              </h2>

              <div className="space-y-10">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">
                    Base Points by Turn
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { turn: 1, points: 4000 },
                      { turn: 2, points: 3000 },
                      { turn: 3, points: 2000 },
                      { turn: 4, points: 1000 }
                    ].map(({ turn, points }) => (
                      <div key={turn} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {points.toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-500 font-medium tracking-wide">
                          TURN {turn}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">
                    Distance Penalties
                  </h3>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
                    {[
                      { range: "0–200 mi", penalty: "0", color: "text-green-400", borderColor: "border-l-green-400" },
                      { range: "200–400 mi", penalty: "1,000", color: "text-yellow-400", borderColor: "border-l-yellow-400" },
                      { range: "400–600 mi", penalty: "2,000", color: "text-orange-400", borderColor: "border-l-orange-400" },
                      { range: "600+ mi", penalty: "3,000+", color: "text-red-400", borderColor: "border-l-red-400" }
                    ].map(({ range, penalty, color, borderColor }) => (
                      <div key={range} className={`flex justify-between px-4 py-3 border-l-4 ${borderColor}`}>
                        <span className="text-zinc-400 text-sm">{range}</span>
                        <span className={`${color} text-sm font-semibold`}>
                          {penalty === "0" ? "—" : `−${penalty}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-zinc-500 text-sm mt-3">
                    Penalty increases by 1,000 points for every 200 miles of error.
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">Turn 2 base</span>
                      <span className="text-white font-medium">3,000</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">Distance penalty (450 mi)</span>
                      <span className="text-white font-medium">−2,000</span>
                    </div>
                    <div className="border-t border-zinc-800 pt-3 mt-3 flex justify-between items-center">
                      <span className="text-white font-semibold">Final Score</span>
                      <span className="text-white font-bold text-xl">1,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-zinc-900 text-center">
            <Link
              href="/"
              className="inline-block px-10 py-4 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-bold text-sm tracking-wider rounded-lg transition-colors"
            >
              START GAME
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}