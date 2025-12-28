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
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <Link href="/" className="text-sky-400 hover:text-sky-300 text-sm md:text-base">
              ← Back to Game
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-white">How to Play </span>
            <span className="text-sky-400">Coastle</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl mb-12">
            A daily geography game about finding coastal locations
          </p>

          <div className="space-y-8">
            <section className="bg-zinc-900 rounded-xl p-6 md:p-8 border-2 border-zinc-800">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-sky-400">
                Objective
              </h2>
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed">
                Find the real location of a mystery coastal spot somewhere in the world.
                You begin very zoomed in and can zoom out a few times to see more of the area.
                When you are ready, place a pin on the world map to make your guess.
              </p>
            </section>

            <section className="bg-zinc-900 rounded-xl p-6 md:p-8 border-2 border-zinc-800">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-sky-400">
                How to Play
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-900 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Look at the image
                    </h3>
                    <p className="text-zinc-400">
                      Study the coastline, land, water, buildings, and terrain.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-900 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Zoom out when needed
                    </h3>
                    <p className="text-zinc-400">
                      You can zoom out a limited number of times to see more of the area.
                      Using fewer zooms gives more points.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-900 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Open the world map
                    </h3>
                    <p className="text-zinc-400">
                      Open the small world map to see the full globe.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-900 rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Place your guess
                    </h3>
                    <p className="text-zinc-400">
                      Click on the map to drop a pin where you think the location is.
                      You can move and zoom the map for accuracy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Submit your guess
                    </h3>
                    <p className="text-zinc-400">
                      Submit your guess to see how close you were and your score.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-zinc-900 rounded-xl p-6 md:p-8 border-2 border-zinc-800">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-sky-400">
                Scoring
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 text-green-400">
                    Base Points
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        4000
                      </div>
                      <div className="text-xs text-zinc-400">
                        First turn
                      </div>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        3000
                      </div>
                      <div className="text-xs text-zinc-400">
                        Second turn
                      </div>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        2000
                      </div>
                      <div className="text-xs text-zinc-400">
                        Third turn
                      </div>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        1000
                      </div>
                      <div className="text-xs text-zinc-400">
                        Fourth turn
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 text-red-400">
                    Distance Penalty
                  </h3>

                  <div className="bg-zinc-800 rounded-lg p-4">
                    <p className="text-zinc-300 mb-3">
                      You lose 1000 points for every 200 miles your guess is away from the correct location.
                    </p>

                    <div className="space-y-2 text-sm text-zinc-400">
                      <div className="flex justify-between">
                        <span>Within 200 miles</span>
                        <span className="text-green-400 font-bold">
                          No penalty
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>200 to 400 miles</span>
                        <span className="text-yellow-400">
                          -1000 points
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>400 to 600 miles</span>
                        <span className="text-orange-400">
                          -2000 points
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>More than 600 miles</span>
                        <span className="text-red-400">
                          -3000 points or more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="font-bold mb-2">
                    Example
                  </h3>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-zinc-300">
                      <span>Third turn guess</span>
                      <span className="text-green-400">
                        +2000
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-300">
                      <span>450 miles away</span>
                      <span className="text-red-400">
                        -2000
                      </span>
                    </div>

                    <div className="border-t border-zinc-700 my-2"></div>

                    <div className="flex justify-between font-bold text-lg">
                      <span>Final score</span>
                      <span className="text-white">
                        0
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-sky-900 hover:bg-sky-800 text-white font-bold text-lg rounded-lg transition-colors"
            >
              Start Playing →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
