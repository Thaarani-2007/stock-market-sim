import { useEffect, useState } from "react"
import { makeRequest } from "../../lib/utils"

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<{name: string, value: number}[]>([])

  useEffect(() => {
    makeRequest('leaderboard', 'GET', undefined, true)
      .then(data => {
        const list: { name: string, value: number }[] = []
        Object.keys(data).forEach((key) => {
          list.push({ name: key, value: data[key] })
        })

        list.sort((a, b) => b.value - a.value)
        setLeaderboard(list)
      })
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#050617] via-gray-900 to-black text-gray-300">

      
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,white,transparent)] opacity-40 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_70%_60%,white,transparent)] opacity-30 animate-ping" />
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_40%_80%,white,transparent)] opacity-20" />

      
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-5xl mx-auto">

          
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
            Leaderboard
          </h1>
          <p className="text-gray-400 mb-8">
            Ranked by total profit in the stock market simulation
          </p>

          
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/60 backdrop-blur-xl shadow-2xl">

            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="p-5 text-left">Rank</th>
                  <th className="p-5 text-left">Trader</th>
                  <th className="p-5 text-right">Profit (₹)</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((user, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition"
                  >
                    <td className="p-5 font-semibold">
                      {index+1 <= 3 ? (
                        <span className="text-[#9291ca]">#{index+1}</span>
                      ) : (
                        <span className="text-gray-400">#{index+1}</span>
                      )}
                    </td>

                    <td className="p-5 text-gray-200">
                      {user.name}
                    </td>

                    <td
                      className={`p-5 text-right font-semibold ${
                        user.value >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {user.value >= 0 ? "+" : ""}
                      {user.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard