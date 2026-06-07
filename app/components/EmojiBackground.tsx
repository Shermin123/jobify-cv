export default function EmojiBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100" />

      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-200 opacity-35 blur-[150px]" />
      <div className="absolute -bottom-44 -right-40 h-[620px] w-[620px] rounded-full bg-purple-200 opacity-30 blur-[180px]" />
      <div className="absolute left-[45%] top-[35%] h-[360px] w-[360px] rounded-full bg-cyan-100 opacity-25 blur-[130px]" />

      <div className="absolute top-20 left-8 text-4xl opacity-10 animate-float">
        🚀
      </div>
      <div className="absolute top-28 right-10 text-4xl opacity-10 animate-float">
        📄
      </div>
      <div className="absolute top-52 left-[22%] text-4xl opacity-10 animate-float">
        🤖
      </div>
      <div className="absolute top-[42%] right-[18%] text-4xl opacity-10 animate-float">
        🎯
      </div>
      <div className="absolute bottom-40 left-12 text-4xl opacity-10 animate-float">
        💼
      </div>
      <div className="absolute bottom-28 right-16 text-4xl opacity-10 animate-float">
        ✨
      </div>
      <div className="absolute bottom-16 left-[38%] text-4xl opacity-10 animate-float">
        🧠
      </div>
      <div className="absolute top-[65%] left-[10%] text-4xl opacity-10 animate-float">
        ⚡
      </div>
    </div>
  );
}