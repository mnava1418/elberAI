import Image from "next/image";

type Line = { from: "user" | "elber"; text: string };

const lines: Line[] = [
  { from: "user", text: "¿cómo va el clima en Bogotá mañana?" },
  {
    from: "elber",
    text: "Va a llover por la tarde, 18°C. ¿Te recuerdo de la chaqueta cuando salgas?",
  },
  { from: "user", text: "sí, gracias. y agéndame el dentista" },
  {
    from: "elber",
    text: "Hecho. Mañana 4pm. (sé que odias el dentista — te mando un GIF de apoyo)",
  },
];

export default function Demo() {
  return (
    <section
      id="demo"
      className="relative overflow-hidden border-t border-[var(--color-border)] px-5 sm:px-10 lg:px-16 py-14 sm:py-20 lg:py-24"
      style={{ background: "var(--color-bg-2)" }}
    >
      <span
        aria-hidden
        className="orb"
        style={{
          width: 500,
          height: 500,
          top: "50%",
          left: "10%",
          transform: "translate(-50%, -50%)",
          opacity: 0.1,
          background:
            "radial-gradient(circle, var(--color-cyan) 0%, var(--color-violet) 35%, transparent 65%)",
        }}
      />

      <div className="relative z-10 text-center mb-10">
        <span
          className="glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.12em]"
          style={{
            color: "var(--color-violet)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span
            className="w-[5px] h-[5px] rounded-full"
            style={{
              background: "var(--color-violet)",
              boxShadow: "0 0 10px var(--color-violet)",
            }}
          />
          una conversación cualquiera
        </span>
        <h2
          className="mt-4 text-4xl sm:text-5xl lg:text-[56px] font-medium tracking-[-0.03em] leading-[1.05] text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Así <span className="italic text-[var(--color-cyan)]">suena</span>{" "}
          Elber.
        </h2>
      </div>

      <div
        className="relative z-10 max-w-[680px] mx-auto rounded-2xl p-5 sm:p-6 border"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border-strong)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(125,249,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[var(--color-border)]">
          <Image
            src="/logo-elber.png"
            alt=""
            width={28}
            height={28}
            className="opacity-95"
          />
          <span
            className="italic text-lg text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Elber
          </span>
          <span
            className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--color-dim)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--color-cyan)",
                boxShadow: "0 0 8px var(--color-cyan)",
              }}
            />
            escribiendo...
          </span>
        </div>

        {/* Messages */}
        <div className="pt-4 flex flex-col gap-2.5">
          {lines.map((l, i) => {
            const isUser = l.from === "user";
            return (
              <div
                key={i}
                className={`max-w-[82%] px-3.5 py-2.5 text-[14.5px] leading-snug ${
                  isUser ? "self-end font-medium" : "self-start"
                }`}
                style={{
                  background: isUser
                    ? "linear-gradient(135deg, var(--color-cyan), var(--color-violet))"
                    : "var(--color-panel)",
                  color: isUser ? "var(--color-bg)" : "var(--color-text)",
                  border: isUser
                    ? "none"
                    : "1px solid var(--color-border)",
                  borderRadius: 16,
                  borderBottomRightRadius: isUser ? 4 : 16,
                  borderBottomLeftRadius: isUser ? 16 : 4,
                  backdropFilter: isUser ? undefined : "blur(20px)",
                }}
              >
                {l.text}
              </div>
            );
          })}
          {/* Typing dots */}
          <div className="self-start flex gap-1 px-3 py-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full anim-pulse"
              style={{ background: "var(--color-cyan)" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full anim-pulse"
              style={{
                background: "var(--color-cyan)",
                animationDelay: "0.2s",
              }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full anim-pulse"
              style={{
                background: "var(--color-cyan)",
                animationDelay: "0.4s",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
