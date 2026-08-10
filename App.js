import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Rocket, Shield, Dumbbell, Crosshair, Webhook, Sparkles, Cat, Wand2,
  Swords, Skull, Star, Sun, Moon, Crown, Wind, Waves, CircleDot, Cpu,
  CloudLightning, Target, Eye, Sparkle, Feather, Gavel, Timer, Wallet,
  Trophy, X, Check, RotateCcw, Settings2
} from "lucide-react";

/* ---------------------------------- DATA ---------------------------------- */

const HEROES = [
  { name: "Iron Man", universe: "Marvel", icon: Rocket, tint: "#F2A33C", stats: { strength: 65, speed: 78, intelligence: 98, durability: 72 } },
  { name: "Captain America", universe: "Marvel", icon: Shield, tint: "#4C7BD9", stats: { strength: 70, speed: 60, intelligence: 82, durability: 80 } },
  { name: "Thor", universe: "Marvel", icon: CloudLightning, tint: "#9C7BE0", stats: { strength: 98, speed: 85, intelligence: 68, durability: 96 } },
  { name: "Hulk", universe: "Marvel", icon: Dumbbell, tint: "#5FB86E", stats: { strength: 100, speed: 45, intelligence: 55, durability: 99 } },
  { name: "Black Widow", universe: "Marvel", icon: Crosshair, tint: "#C24B4B", stats: { strength: 38, speed: 62, intelligence: 88, durability: 45 } },
  { name: "Spider-Man", universe: "Marvel", icon: Webhook, tint: "#D9424B", stats: { strength: 74, speed: 88, intelligence: 84, durability: 68 } },
  { name: "Doctor Strange", universe: "Marvel", icon: Sparkles, tint: "#D9464B", stats: { strength: 40, speed: 55, intelligence: 99, durability: 60 } },
  { name: "Black Panther", universe: "Marvel", icon: Cat, tint: "#8F8F97", stats: { strength: 72, speed: 80, intelligence: 90, durability: 74 } },
  { name: "Scarlet Witch", universe: "Marvel", icon: Wand2, tint: "#C0405C", stats: { strength: 42, speed: 58, intelligence: 78, durability: 55 } },
  { name: "Wolverine", universe: "Marvel", icon: Swords, tint: "#C9A227", stats: { strength: 78, speed: 65, intelligence: 60, durability: 94 } },
  { name: "Deadpool", universe: "Marvel", icon: Skull, tint: "#8C2C36", stats: { strength: 68, speed: 63, intelligence: 50, durability: 97 } },
  { name: "Captain Marvel", universe: "Marvel", icon: Star, tint: "#D9AA3C", stats: { strength: 96, speed: 94, intelligence: 75, durability: 92 } },
  { name: "Superman", universe: "DC", icon: Sun, tint: "#D9432E", stats: { strength: 99, speed: 96, intelligence: 80, durability: 99 } },
  { name: "Batman", universe: "DC", icon: Moon, tint: "#3A3F4B", stats: { strength: 48, speed: 55, intelligence: 100, durability: 70 } },
  { name: "Wonder Woman", universe: "DC", icon: Crown, tint: "#C9A227", stats: { strength: 95, speed: 82, intelligence: 85, durability: 95 } },
  { name: "The Flash", universe: "DC", icon: Wind, tint: "#B0392E", stats: { strength: 50, speed: 100, intelligence: 72, durability: 60 } },
  { name: "Aquaman", universe: "DC", icon: Waves, tint: "#2E7DB0", stats: { strength: 85, speed: 70, intelligence: 65, durability: 88 } },
  { name: "Green Lantern", universe: "DC", icon: CircleDot, tint: "#3F9C4C", stats: { strength: 75, speed: 78, intelligence: 74, durability: 78 } },
  { name: "Cyborg", universe: "DC", icon: Cpu, tint: "#4C6B99", stats: { strength: 82, speed: 60, intelligence: 92, durability: 90 } },
  { name: "Shazam", universe: "DC", icon: Sparkle, tint: "#C9302C", stats: { strength: 92, speed: 84, intelligence: 55, durability: 90 } },
  { name: "Green Arrow", universe: "DC", icon: Target, tint: "#2E8F4E", stats: { strength: 45, speed: 58, intelligence: 76, durability: 50 } },
  { name: "Martian Manhunter", universe: "DC", icon: Eye, tint: "#2E7D5E", stats: { strength: 88, speed: 74, intelligence: 90, durability: 86 } },
  { name: "Zatanna", universe: "DC", icon: Wand2, tint: "#5C3F9C", stats: { strength: 35, speed: 50, intelligence: 86, durability: 48 } },
  { name: "Nightwing", universe: "DC", icon: Feather, tint: "#2E5C99", stats: { strength: 55, speed: 68, intelligence: 84, durability: 62 } },
];

const BUDGET_OPTIONS = [10, 20, 50, 100, 500, 1000, 10000, 100000];
const INCREMENT_OPTIONS = [1, 2, 5, 10, 25, 50, 100];
const ROSTER_SIZE = 5;
const START_TIME = 15;
const BID_RESET_TIME = 8;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(n) {
  return "$" + n.toLocaleString("en-US");
}

/* ---------------------------------- FONTS / GLOBAL STYLE ---------------------------------- */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');

    .sha-root {
      font-family: 'Inter', sans-serif;
      background: #090A0D;
      color: #ECE9E1;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
    .sha-root::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
      background-size: 14px 14px;
      z-index: 0;
    }
    .sha-display {
      font-family: 'Anton', sans-serif;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .sha-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    @keyframes sha-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes sha-card-in { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes sha-stamp-in { from { opacity: 0; transform: scale(2.2) rotate(-18deg); } to { opacity: 1; transform: scale(1) rotate(-8deg); } }
    @keyframes sha-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
    @keyframes sha-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes sha-glow-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .sha-anim-card { animation: sha-card-in 0.4s cubic-bezier(.2,.8,.3,1); }
    .sha-anim-stamp { animation: sha-stamp-in 0.5s cubic-bezier(.2,.8,.3,1.4); }
    .sha-anim-fadeup { animation: sha-fade-up 0.5s ease both; }
    .sha-anim-glow { animation: sha-glow-in 0.6s cubic-bezier(.2,.8,.3,1) both; }
    .sha-scrollbar::-webkit-scrollbar { width: 6px; }
    .sha-scrollbar::-webkit-scrollbar-thumb { background: #2A2E38; border-radius: 3px; }
    button.sha-btn { cursor: pointer; transition: transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease; }
    button.sha-btn:active:not(:disabled) { transform: scale(0.96); }
    button.sha-btn:hover:not(:disabled) { filter: brightness(1.12); }
    button.sha-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    button.sha-opt { transition: all 0.15s ease; cursor: pointer; }
  `}</style>
);

/* ---------------------------------- SETUP SCREEN ---------------------------------- */

function SetupScreen({ onStart }) {
  const [budget, setBudget] = useState(20);
  const [increment, setIncrement] = useState(1);
  const [customBudget, setCustomBudget] = useState("");
  const [customIncrement, setCustomIncrement] = useState("");

  const effectiveBudget = customBudget !== "" ? Number(customBudget) : budget;
  const effectiveIncrement = customIncrement !== "" ? Number(customIncrement) : increment;
  const valid = effectiveBudget >= 10 && effectiveBudget <= 100000 && effectiveIncrement >= 1 && effectiveIncrement <= effectiveBudget;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative", zIndex: 1 }}>
      <div className="sha-anim-glow" style={{ width: "100%", maxWidth: 620 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="sha-mono" style={{ color: "#D4AF37", fontSize: 13, letterSpacing: "0.35em", marginBottom: 14 }}>
            LOT 01 &mdash; 24 &middot; LIVE DRAFT NIGHT
          </div>
          <h1 className="sha-display" style={{ fontSize: "clamp(40px, 8vw, 68px)", margin: 0, lineHeight: 0.95 }}>
            The Superhero<br /><span style={{ color: "#D4AF37" }}>Auction House</span>
          </h1>
          <p style={{ color: "#8B8F98", marginTop: 16, fontSize: 15, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
            Two collectors. One podium. Twenty-four legends from Marvel and DC cross the block &mdash; outbid your rival before the gavel falls.
          </p>
        </div>

        <div style={{ background: "#12151C", border: "1px solid #232732", borderRadius: 16, padding: "28px 28px 32px" }}>
          <SetupField
            label="Starting budget"
            hint="Per player, $10 &ndash; $100,000"
            options={BUDGET_OPTIONS}
            selected={customBudget === "" ? budget : null}
            onSelect={(v) => { setBudget(v); setCustomBudget(""); }}
            customValue={customBudget}
            onCustomChange={setCustomBudget}
            format={(v) => fmt(v)}
            placeholder="Custom amount"
          />

          <div style={{ height: 22 }} />

          <SetupField
            label="Bid increment"
            hint="How much each bid raises the price"
            options={INCREMENT_OPTIONS}
            selected={customIncrement === "" ? increment : null}
            onSelect={(v) => { setIncrement(v); setCustomIncrement(""); }}
            customValue={customIncrement}
            onCustomChange={setCustomIncrement}
            format={(v) => "+" + fmt(v)}
            placeholder="Custom step"
          />

          <button
            className="sha-btn"
            disabled={!valid}
            onClick={() => onStart({ budget: effectiveBudget, increment: effectiveIncrement })}
            style={{
              marginTop: 30, width: "100%", padding: "16px", borderRadius: 10, border: "none",
              background: valid ? "linear-gradient(180deg, #F2C94C, #D4AF37)" : "#2A2E38",
              color: valid ? "#12151C" : "#5C606B",
              fontFamily: "'Anton', sans-serif", fontSize: 20, letterSpacing: "0.06em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10
            }}
          >
            <Gavel size={20} /> START THE AUCTION
          </button>
          {!valid && (
            <div style={{ textAlign: "center", color: "#C0405C", fontSize: 12, marginTop: 10 }}>
              Budget must be $10&ndash;$100,000 and the increment can't exceed the budget.
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 22, color: "#5C606B", fontSize: 12 }} className="sha-mono">
          <span>24 HEROES</span><span>&middot;</span><span>5 SLOTS EACH</span><span>&middot;</span><span>2 PLAYERS</span>
        </div>
      </div>
    </div>
  );
}

function SetupField({ label, hint, options, selected, onSelect, customValue, onCustomChange, format, placeholder }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <label style={{ fontSize: 14, fontWeight: 600 }}>{label}</label>
        <span style={{ fontSize: 12, color: "#5C606B" }}>{hint}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((v) => (
          <button
            key={v}
            className="sha-opt"
            onClick={() => onSelect(v)}
            style={{
              padding: "9px 14px", borderRadius: 8,
              border: selected === v ? "1px solid #D4AF37" : "1px solid #232732",
              background: selected === v ? "rgba(212,175,55,0.14)" : "#171B24",
              color: selected === v ? "#F2C94C" : "#ECE9E1",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 500
            }}
          >
            {format(v)}
          </button>
        ))}
        <input
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder={placeholder}
          style={{
            padding: "9px 14px", borderRadius: 8, width: 140,
            border: customValue !== "" ? "1px solid #D4AF37" : "1px solid #232732",
            background: "#171B24", color: "#ECE9E1", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: "none"
          }}
        />
      </div>
    </div>
  );
}

/* ---------------------------------- HERO CARD ---------------------------------- */

function HeroPortrait({ hero, size = 96 }) {
  const Icon = hero.icon;
  return (
    <div style={{
      width: size, height: size, borderRadius: 14, position: "relative", overflow: "hidden",
      background: `linear-gradient(155deg, ${hero.tint}33, #0A0C10 78%)`,
      border: `1px solid ${hero.tint}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(${hero.tint}22 1px, transparent 1px)`,
        backgroundSize: "8px 8px"
      }} />
      <Icon size={size * 0.46} color={hero.tint} strokeWidth={1.6} style={{ position: "relative" }} />
    </div>
  );
}

function StatBar({ label, value, tint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="sha-mono" style={{ fontSize: 10, color: "#8B8F98", width: 26 }}>{label}</span>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#1D212A", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: tint, borderRadius: 3 }} />
      </div>
      <span className="sha-mono" style={{ fontSize: 10, color: "#ECE9E1", width: 22, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ---------------------------------- ROSTER SLOT ---------------------------------- */

function RosterSlot({ hero }) {
  if (!hero) {
    return (
      <div style={{
        border: "1px dashed #232732", borderRadius: 10, padding: "8px 10px",
        display: "flex", alignItems: "center", gap: 10, minHeight: 52
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#171B24", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#3A3E48" }}>Empty slot</span>
      </div>
    );
  }
  const Icon = hero.icon;
  return (
    <div className="sha-anim-fadeup" style={{
      border: "1px solid #232732", borderRadius: 10, padding: "8px 10px",
      display: "flex", alignItems: "center", gap: 10, background: "#171B24", minHeight: 52
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: `${hero.tint}22`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        <Icon size={17} color={hero.tint} strokeWidth={1.8} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hero.name}</div>
        <div className="sha-mono" style={{ fontSize: 10, color: "#D4AF37" }}>{fmt(hero.paid)}</div>
      </div>
    </div>
  );
}

/* ---------------------------------- PLAYER PANEL ---------------------------------- */

function PlayerPanel({ player, side, isLeader, isOut, minBidAmount, onBid, onPass, canAct, actionsDisabled }) {
  const align = side === "left" ? "flex-start" : "flex-end";
  return (
    <div className="sha-scrollbar" style={{
      background: "#12151C", border: `1px solid ${isLeader ? "#D4AF37" : "#232732"}`,
      borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 14,
      transition: "border-color 0.2s ease", height: "100%"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="sha-mono" style={{ fontSize: 11, color: "#5C606B", letterSpacing: "0.1em" }}>
            {player.label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{player.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", color: "#5C606B", fontSize: 10 }}>
            <Wallet size={11} /> BUDGET
          </div>
          <div className="sha-mono" style={{ fontSize: 20, fontWeight: 700, color: player.budget < minBidAmount ? "#C0405C" : "#F2C94C" }}>
            {fmt(player.budget)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {[0, 1, 2, 3, 4].map((i) => <RosterSlot key={i} hero={player.roster[i]} />)}
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
        <button
          className="sha-btn"
          disabled={actionsDisabled || !canAct}
          onClick={onBid}
          style={{
            flex: 2, padding: "12px 8px", borderRadius: 9, border: "none",
            background: "linear-gradient(180deg,#F2C94C,#D4AF37)", color: "#12151C",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13
          }}
        >
          BID {fmt(minBidAmount)}
        </button>
        <button
          className="sha-btn"
          disabled={actionsDisabled || !canAct}
          onClick={onPass}
          style={{
            flex: 1, padding: "12px 8px", borderRadius: 9, border: "1px solid #2A2E38",
            background: "#171B24", color: "#8B8F98", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13
          }}
        >
          PASS
        </button>
      </div>
      {isOut && <div style={{ textAlign: "center", fontSize: 11, color: "#5C606B" }}>
        {player.roster.length >= ROSTER_SIZE ? "Roster full" : "Out of usable budget"}
      </div>}
    </div>
  );
}

/* ---------------------------------- MAIN GAME ---------------------------------- */

function GameScreen({ config, onEnd }) {
  const [pool, setPool] = useState(() => shuffle(HEROES));
  const [lotNumber, setLotNumber] = useState(1);
  const [current, setCurrent] = useState(pool[0]);
  const [bid, setBid] = useState(0);
  const [leader, setLeader] = useState(null);
  const [passed, setPassed] = useState([false, false]);
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [players, setPlayers] = useState([
    { name: "Player 1", label: "COLLECTOR 01", budget: config.budget, roster: [] },
    { name: "Player 2", label: "COLLECTOR 02", budget: config.budget, roster: [] },
  ]);
  const [resolution, setResolution] = useState(null); // { winnerIdx, hero, price } | { unsold: true, hero }
  const resolvingRef = useRef(false);

  const remainingPoolRef = useRef(pool.slice(1));

  const isOut = useCallback((p) => p.roster.length >= ROSTER_SIZE || p.budget < config.increment, [config.increment]);

  const nextBidAmount = bid === 0 ? config.increment : bid + config.increment;

  const resolveLot = useCallback(() => {
    if (resolvingRef.current) return;
    resolvingRef.current = true;

    setPlayers((prev) => {
      if (leader === null) {
        setResolution({ unsold: true, hero: current });
        return prev;
      }
      const updated = prev.map((p, i) => {
        if (i !== leader) return p;
        return { ...p, budget: p.budget - bid, roster: [...p.roster, { ...current, paid: bid }] };
      });
      setResolution({ winnerIdx: leader, hero: current, price: bid });
      return updated;
    });
  }, [leader, bid, current]);

  // timer
  useEffect(() => {
    if (resolution) return;
    if (timeLeft <= 0) { resolveLot(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, resolution, resolveLot]);

  // auto-resolve if both effectively passed/out
  useEffect(() => {
    if (resolution) return;
    const eff0 = passed[0] || isOut(players[0]);
    const eff1 = passed[1] || isOut(players[1]);
    if (eff0 && eff1) resolveLot();
  }, [passed, players, isOut, resolution, resolveLot]);

  // advance after resolution shown
  useEffect(() => {
    if (!resolution) return;
    const t = setTimeout(() => {
      setPlayers((latestPlayers) => {
        const bothFull = latestPlayers.every((p) => p.roster.length >= ROSTER_SIZE);
        const bothBroke = latestPlayers.every((p) => p.budget < config.increment);
        const poolEmpty = remainingPoolRef.current.length === 0;

        if (bothFull || bothBroke || poolEmpty) {
          onEnd(latestPlayers);
          return latestPlayers;
        }
        const nextHero = remainingPoolRef.current[0];
        remainingPoolRef.current = remainingPoolRef.current.slice(1);
        setLotNumber((n) => n + 1);
        setCurrent(nextHero);
        setBid(0);
        setLeader(null);
        setPassed([false, false]);
        setTimeLeft(START_TIME);
        setResolution(null);
        resolvingRef.current = false;
        return latestPlayers;
      });
    }, 2200);
    return () => clearTimeout(t);
  }, [resolution, config.increment, onEnd]);

  function placeBid(idx) {
    if (resolution) return;
    const amt = bid === 0 ? config.increment : bid + config.increment;
    if (players[idx].budget < amt || players[idx].roster.length >= ROSTER_SIZE || passed[idx]) return;
    setBid(amt);
    setLeader(idx);
    setPassed([false, false]);
    setTimeLeft(BID_RESET_TIME);
  }

  function passLot(idx) {
    if (resolution) return;
    setPassed((prev) => prev.map((v, i) => (i === idx ? true : v)));
  }

  const totalLots = HEROES.length;

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1, paddingBottom: 24 }}>
      {/* ticker */}
      <div style={{ background: "#12151C", borderBottom: "1px solid #232732", overflow: "hidden", height: 34, display: "flex", alignItems: "center" }}>
        <div className="sha-mono" style={{
          whiteSpace: "nowrap", animation: "sha-ticker 22s linear infinite", display: "inline-block", fontSize: 12, color: "#D4AF37"
        }}>
          {Array(4).fill(`LOT ${String(lotNumber).padStart(2, "0")} OF ${totalLots} \u00b7 ON THE BLOCK: ${current.name.toUpperCase()} \u00b7 UNIVERSE: ${current.universe.toUpperCase()} \u00b7 CURRENT BID ${fmt(bid)} \u00b7 INCREMENT ${fmt(config.increment)} \u00b7\u00a0\u00a0\u00a0`).join("")}
        </div>
      </div>

      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "22px 18px 0",
        display: "grid", gridTemplateColumns: "1fr", gap: 18
      }}>
        <div className="sha-panels" style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", gap: 18, alignItems: "stretch" }}>
          <PlayerPanel
            player={players[0]} side="left" isLeader={leader === 0} isOut={isOut(players[0])}
            minBidAmount={nextBidAmount} onBid={() => placeBid(0)} onPass={() => passLot(0)}
            canAct={!isOut(players[0]) && !passed[0] && players[0].budget >= nextBidAmount}
            actionsDisabled={!!resolution}
          />

          {/* center auction */}
          <div style={{ background: "#12151C", border: "1px solid #232732", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#5C606B", fontSize: 11 }} className="sha-mono">
              <Timer size={13} />
              <span style={{ color: timeLeft <= 4 ? "#C0405C" : "#8B8F98", animation: timeLeft <= 4 ? "sha-pulse 0.8s infinite" : "none" }}>
                {timeLeft}s TO ACT
              </span>
            </div>

            <div key={current.name} className="sha-anim-card" style={{ marginTop: 14, textAlign: "center" }}>
              <HeroPortrait hero={current} size={140} />
              <div style={{
                display: "inline-block", marginTop: 14, fontSize: 10, letterSpacing: "0.15em", padding: "3px 10px", borderRadius: 4,
                background: current.universe === "Marvel" ? "rgba(228,38,44,0.15)" : "rgba(15,111,224,0.15)",
                color: current.universe === "Marvel" ? "#E4262C" : "#4C9BF0"
              }} className="sha-mono">
                {current.universe.toUpperCase()}
              </div>
              <h2 className="sha-display" style={{ fontSize: 30, margin: "8px 0 4px" }}>{current.name}</h2>
            </div>

            <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
              <StatBar label="STR" value={current.stats.strength} tint={current.tint} />
              <StatBar label="SPD" value={current.stats.speed} tint={current.tint} />
              <StatBar label="INT" value={current.stats.intelligence} tint={current.tint} />
              <StatBar label="DUR" value={current.stats.durability} tint={current.tint} />
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <div className="sha-mono" style={{ fontSize: 11, color: "#5C606B" }}>CURRENT BID</div>
              <div className="sha-mono sha-display" style={{ fontSize: 40, color: "#F2C94C", lineHeight: 1 }}>{fmt(bid)}</div>
              <div style={{ fontSize: 12, color: "#8B8F98", marginTop: 4 }}>
                {leader === null ? "No bids yet" : `Leading: ${players[leader].name}`}
              </div>
            </div>

            {resolution && (
              <div className="sha-anim-stamp" style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(9,10,13,0.72)", borderRadius: 16
              }}>
                <div style={{
                  border: `4px solid ${resolution.unsold ? "#8B8F98" : "#D4AF37"}`, borderRadius: 10,
                  padding: "14px 34px", transform: "rotate(-8deg)"
                }}>
                  <div className="sha-display" style={{ fontSize: 34, color: resolution.unsold ? "#8B8F98" : "#F2C94C" }}>
                    {resolution.unsold ? "UNSOLD" : "SOLD"}
                  </div>
                  {!resolution.unsold && (
                    <div className="sha-mono" style={{ textAlign: "center", fontSize: 12, color: "#ECE9E1", marginTop: 2 }}>
                      {players[resolution.winnerIdx].name} &middot; {fmt(resolution.price)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <PlayerPanel
            player={players[1]} side="right" isLeader={leader === 1} isOut={isOut(players[1])}
            minBidAmount={nextBidAmount} onBid={() => placeBid(1)} onPass={() => passLot(1)}
            canAct={!isOut(players[1]) && !passed[1] && players[1].budget >= nextBidAmount}
            actionsDisabled={!!resolution}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sha-panels { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------- END SCREEN ---------------------------------- */

function EndScreen({ players, config, onRestart }) {
  const totalStats = (roster) => roster.reduce((sum, h) => sum + h.stats.strength + h.stats.speed + h.stats.intelligence + h.stats.durability, 0);
  const totalSpent = (roster) => roster.reduce((sum, h) => sum + h.paid, 0);
  const scores = players.map((p) => totalStats(p.roster));
  const winnerIdx = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 18px", position: "relative", zIndex: 1 }}>
      <div className="sha-anim-glow" style={{ width: "100%", maxWidth: 900 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Gavel size={30} color="#D4AF37" style={{ marginBottom: 10 }} />
          <h1 className="sha-display" style={{ fontSize: "clamp(32px,6vw,52px)", margin: 0 }}>Auction Closed</h1>
          <p style={{ color: "#8B8F98", marginTop: 8 }}>
            {winnerIdx === null ? "Both rosters are evenly matched on power." : `${players[winnerIdx].name} fields the stronger roster by total power.`}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="sha-panels-end">
          {players.map((p, i) => (
            <div key={i} style={{
              background: "#12151C", border: `1px solid ${winnerIdx === i ? "#D4AF37" : "#232732"}`, borderRadius: 16, padding: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div className="sha-mono" style={{ fontSize: 11, color: "#5C606B" }}>{p.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    {p.name}{winnerIdx === i && <Trophy size={16} color="#D4AF37" />}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="sha-mono" style={{ fontSize: 11, color: "#5C606B" }}>REMAINING</div>
                  <div className="sha-mono" style={{ fontSize: 16, color: "#F2C94C" }}>{fmt(p.budget)}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[0, 1, 2, 3, 4].map((idx) => <RosterSlot key={idx} hero={p.roster[idx]} />)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 12, color: "#8B8F98" }} className="sha-mono">
                <span>SPENT {fmt(totalSpent(p.roster))}</span>
                <span>POWER {scores[i]}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="sha-btn" onClick={onRestart} style={{
          margin: "28px auto 0", display: "flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10,
          border: "1px solid #2A2E38", background: "#171B24", color: "#ECE9E1", fontFamily: "'JetBrains Mono', monospace", fontSize: 13
        }}>
          <RotateCcw size={15} /> NEW AUCTION
        </button>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .sha-panels-end { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------- APP ---------------------------------- */

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [config, setConfig] = useState({ budget: 20, increment: 1 });
  const [finalPlayers, setFinalPlayers] = useState(null);
  const [gameKey, setGameKey] = useState(0);

  function startGame(cfg) {
    setConfig(cfg);
    setPhase("auction");
  }
  function endGame(players) {
    setFinalPlayers(players);
    setPhase("ended");
  }
  function restart() {
    setGameKey((k) => k + 1);
    setPhase("setup");
  }

  return (
    <div className="sha-root">
      <GlobalStyle />
      {phase === "setup" && <SetupScreen onStart={startGame} />}
      {phase === "auction" && <GameScreen key={gameKey} config={config} onEnd={endGame} />}
      {phase === "ended" && finalPlayers && <EndScreen players={finalPlayers} config={config} onRestart={restart} />}
    </div>
  );
}
