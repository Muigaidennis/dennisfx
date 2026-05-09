interface BotCardProps {
  bot: {
    name: string
    desc: string
  }
}

export default function BotCard({ bot }: BotCardProps) {
  return (
    <div className="card p-6 hover:border-pink-500 transition-all group">
      <h3 className="text-lg font-bold text-cyan-400 mb-2 group-hover:text-pink-500 transition-colors">
        {bot.name}
      </h3>
      <p className="text-gray-400 font-mono text-sm mb-4">{bot.desc}</p>
      <button className="w-full px-4 py-2 border-2 border-cyan-400 text-cyan-400 font-bold hover:bg-cyan-400 hover:text-black transition-all">
        Load Bot
      </button>
    </div>
  )
}
