// src/components/RadioBubbleLocal.jsx
import { useEffect, useRef, useState } from "react";
import { Music2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Shuffle, Repeat } from "lucide-react";

// Auto-import de todos los audios dentro de src/assets/music/ (CRA/Webpack)
const ctx = require.context("../assets/music", false, /\.(mp3|ogg|m4a|wav)$/i);
const ALL_TRACKS = ctx.keys().map((k) => {
  const url = ctx(k);                    // URL servida por webpack
  const file = k.replace("./", "");      // p.ej. "tema-01.mp3"
  const title = file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
  return { title, src: url };
});

export default function RadioBubble() {
  const audioRef = useRef(null);
  const [open, setOpen] = useState(false);

  const [tracks] = useState(ALL_TRACKS); // lista fija del build
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(true); // ← on por defecto
  const [repeat, setRepeat] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const current = tracks[index] || null;
  const src = current?.src;

  // Al montar: seleccionar pista aleatoria y reproducir (si el navegador lo permite)
  useEffect(() => {
    if (!tracks.length) return;
    const rnd = Math.floor(Math.random() * tracks.length);
    setIndex(rnd);
    setIsPlaying(true);
  }, [tracks.length]);

  // Cuando cambia de pista
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    audio.volume = muted ? 0 : volume;
    setCurrentTime(0);
    setDuration(0);
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false)); // autoplay puede bloquearse
    }
  }, [src]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Handlers audio
  const onTimeUpdate = () => setCurrentTime(audioRef.current?.currentTime || 0);
  const onLoadedMetadata = () => setDuration(audioRef.current?.duration || 0);
  const onEnded = () => {
    if (repeat) {
      audioRef.current?.play();
      return;
    }
    next();
  };

  // Controles
  const playPause = async () => {
    if (!current || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try { await audioRef.current.play(); setIsPlaying(true); }
      catch { /* autoplay bloqueado */ }
    }
  };
  const prev = () => {
    if (!tracks.length) return;
    setIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };
  const next = () => {
    if (!tracks.length) return;
    if (shuffle && tracks.length > 1) {
      let j;
      do { j = Math.floor(Math.random() * tracks.length); } while (j === index);
      setIndex(j);
    } else {
      setIndex((i) => (i + 1) % tracks.length);
    }
    setIsPlaying(true);
  };
  const seek = (v) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = v;
    setCurrentTime(v);
  };

  const fmt = (sec) => {
    const s = Math.floor(sec || 0), m = Math.floor(s / 60), r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const playing = isPlaying && !!current;

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Burbuja */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed right-4 bottom-24 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 shadow-lg
                   flex items-center justify-center text-white hover:scale-105 active:scale-95 transition"
        title={open ? "Ocultar radio" : "Abrir radio"}
      >
        {playing ? (
          <span className="flex gap-[3px] items-end h-5" aria-hidden>
            <span className="w-[3px] h-3 bg-white animate-[eq_1s_ease-in-out_infinite]" />
            <span className="w-[3px] h-5 bg-white animate-[eq_1.1s_ease-in-out_infinite]" />
            <span className="w-[3px] h-4 bg-white animate-[eq_0.9s_ease-in-out_infinite]" />
            <span className="w-[3px] h-6 bg-white animate-[eq_1.05s_ease-in-out_infinite]" />
          </span>
        ) : (
          <Music2 size={22} />
        )}
      </button>

      {open && (
        <div className="fixed left-2 right-2 bottom-2 md:left-auto md:right-2 md:w-[480px] z-50
                        rounded-2xl border border-white/10 bg-neutral-900/90 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-white">
            <div className="flex items-center gap-2">
              <Music2 size={18} />
              <span className="text-sm font-medium">Radio local</span>
              {current && <span className="text-xs text-white/60">— {current.title}</span>}
            </div>
            <button className="p-1 rounded hover:bg-white/10" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="px-3 pt-3 text-white">
            <div className="flex items-center gap-2">
              <button onClick={prev} className="p-2 rounded hover:bg-white/10"><SkipBack size={18} /></button>
              <button onClick={playPause} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" disabled={!current}>
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={next} className="p-2 rounded hover:bg-white/10"><SkipForward size={18} /></button>

              <button onClick={() => setShuffle(s => !s)} className={`p-2 rounded hover:bg-white/10 ml-1 ${shuffle ? "text-emerald-400" : ""}`} title="Shuffle">
                <Shuffle size={18} />
              </button>
              <button onClick={() => setRepeat(r => !r)} className={`p-2 rounded hover:bg-white/10 ${repeat ? "text-emerald-400" : ""}`} title="Repeat">
                <Repeat size={18} />
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setMuted(m => !m)} className="p-2 rounded hover:bg-white/10">
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range" min={0} max={1} step={0.01}
                  value={muted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-blue-500"
                />
              </div>
            </div>

            {/* progress */}
            <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
              <span className="tabular-nums">{fmt(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="tabular-nums">{fmt(duration)}</span>
            </div>

            {/* lista de temas */}
            <div className="mt-2 max-h-48 overflow-y-auto">
              {tracks.length === 0 ? (
                <div className="px-1 py-3 text-white/60 text-sm">
                  Coloca audios en <code>src/assets/music/</code>.
                </div>
              ) : (
                <ul className="px-1 py-1">
                  {tracks.map((t, i) => {
                    const active = i === index;
                    return (
                      <li
                        key={`${t.src}-${i}`}
                        onClick={() => { setIndex(i); setIsPlaying(true); }}
                        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer
                                    ${active ? "bg-blue-600/20 border border-blue-500/30" : "hover:bg-white/5"}`}
                      >
                        <span className="text-xs text-white/80 truncate">{t.title}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes eq { 0%{transform:scaleY(.4)}50%{transform:scaleY(1)}100%{transform:scaleY(.4)} }
      `}</style>
    </>
  );
}
