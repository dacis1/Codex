import { useEffect, useMemo, useState } from "react";

export default function App() {
  // Steps: 1..5
  const [step, setStep] = useState(1);
  const [numPlayers, setNumPlayers] = useState(3);
  const playerOptions = useMemo(() => Array.from({ length: 20 }, (_, i) => i + 2), []);
  const [players, setPlayers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [remainingRoles, setRemainingRoles] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [assigned, setAssigned] = useState([]); // {player, role}[]
  const [marked, setMarked] = useState(new Set());
  const [spinDeg, setSpinDeg] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");
  const [roleInputs, setRoleInputs] = useState([]);

  // Available roles with pixel-style icons
  const availableRoles = [
    { name: "Báo Vệ", icon: "🛡️" },
    { name: "Thợ Săn", icon: "🏹" },
    { name: "Tiên Tri", icon: "🔮" },
    { name: "Phù Thủy", icon: "🧙‍♀️" },
    { name: "Cupid", icon: "💘" },
    { name: "Người phù phép", icon: "✨" },
    { name: "Dân Làng", icon: "👨‍🌾" },
    { name: "Sói", icon: "🐺" },
    { name: "Sói Con", icon: "🐻‍❄️" },
    { name: "Sói đầu đàn", icon: "🐩" },
    { name: "Bán Sói", icon: "🎭" },
    { name: "Kẻ phản bội", icon: "🔪" },
    { name: "Thằng Khờ", icon: "🤡" }
  ];

  // Pixel clouds animation
  const [cloudOffset, setCloudOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCloudOffset(prev => (prev + 1) % 200);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Derived conic-gradient for wheel
  const wheelBackground = useMemo(() => {
    const n = Math.max(remainingRoles.length, 1);
    const step = 360 / n;
    const slices = [];
    const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
    for (let i = 0; i < n; i++) {
      const color = colors[i % colors.length];
      slices.push(`${color} ${i * step}deg ${(i + 1) * step}deg`);
    }
    return `conic-gradient(${slices.join(",")})`;
  }, [remainingRoles]);

  const goStep1 = () => {
    setStep(1);
    setNumPlayers(3);
    setPlayers([]);
    setRoles([]);
    setRoleInputs([]);
    setRemainingRoles([]);
    setCurrentPlayer(0);
    setAssigned([]);
    setMarked(new Set());
    setSpinDeg(0);
    setSpinning(false);
    setResult("");
  };

  const toStep2 = () => {
    const names = Array.from({ length: numPlayers }, (_, i) => players[i] || "");
    setPlayers(names);
    setStep(2);
  };

  const submitNames = () => {
    const names = players.map((n, i) => (n && n.trim()) ? n.trim() : `Người chơi ${i + 1}`);
    setPlayers(names);
    setRoleInputs(Array(names.length).fill(""));
    setStep(3);
  };

  const startRoles = () => {
    const list = roleInputs.map(r => r.trim()).filter(Boolean);
    if (list.length === 0) {
      alert("Vui lòng chọn ít nhất một vai trò!");
      return;
    }
    setRoles(list);
    setRemainingRoles([...list]);
    setCurrentPlayer(0);
    setAssigned([]);
    setMarked(new Set());
    setStep(4);
    setSpinDeg(0);
    setResult("");
  };

  const backTo3 = () => {
    setRemainingRoles([...roles]);
    setCurrentPlayer(0);
    setAssigned([]);
    setMarked(new Set());
    setSpinDeg(0);
    setResult("");
    setStep(3);
  };

  const restartGame = () => {
    setRemainingRoles([...roles]);
    setCurrentPlayer(0);
    setAssigned([]);
    setMarked(new Set());
    setSpinDeg(0);
    setResult("");
    setStep(4);
  };

  const autoAssignRoles = () => {
    const nonVillagerRoles = availableRoles.filter(role => role.name !== "Dân Làng");
    const shuffledRoles = [...nonVillagerRoles].sort(() => Math.random() - 0.5);

    const newRoleInputs = [];
    for (let i = 0; i < numPlayers; i++) {
      if (i < shuffledRoles.length) {
        newRoleInputs.push(shuffledRoles[i].name);
      } else {
        newRoleInputs.push("Dân Làng");
      }
    }

    setRoleInputs(newRoleInputs);
  };

  const spin = () => {
    if (spinning || remainingRoles.length === 0) return;
    setResult("");
    setSpinning(true);

    const spinDuration = 3000 + Math.random() * 2000;
    const rotations = 5 + Math.random() * 3;
    const finalAngle = Math.random() * 360;
    const totalDegrees = 360 * rotations + finalAngle;

    setSpinDeg(prev => prev + totalDegrees);

    setTimeout(() => {
      const idx = Math.floor(Math.random() * remainingRoles.length);
      const pick = remainingRoles[idx];
      const rest = remainingRoles.filter((_, i) => i !== idx);
      setRemainingRoles(rest);
      setAssigned(a => [...a, { player: players[currentPlayer], role: pick }]);

      const roleIcon = availableRoles.find(r => r.name === pick)?.icon || "";
      setResult(`${players[currentPlayer]} → ${roleIcon} ${pick}`);
      setSpinning(false);
    }, spinDuration);
  };

  const nextAfterSpin = () => {
    if (!result) return;
    const next = currentPlayer + 1;
    if (next < players.length) {
      setCurrentPlayer(next);
      setResult("");
    } else {
      setStep(5);
    }
  };

  const autoSpin = () => {
    if (spinning) return;

    const shuffledRoles = [...remainingRoles];

    for (let i = shuffledRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
    }

    const newAssignments = [];
    for (let i = currentPlayer; i < players.length; i++) {
      const roleIndex = i - currentPlayer;
      if (roleIndex < shuffledRoles.length) {
        newAssignments.push({
          player: players[i],
          role: shuffledRoles[roleIndex]
        });
      }
    }
    setAssigned(prev => [...prev, ...newAssignments]);
    setRemainingRoles([]);
    setResult("");

    setStep(5);
  };

  const toggleMark = (index) => {
    setMarked(prev => {
      const cp = new Set(prev);
      if (cp.has(index)) cp.delete(index);
      else cp.add(index);
      return cp;
    });
  };

  return (
    <div style={styles.container}>
      {/* Pixel Clouds */}
      <div style={{...styles.cloud, ...styles.cloud1, left: `${-100 + cloudOffset}px`}}>☁️</div>
      <div style={{...styles.cloud, ...styles.cloud2, left: `${100 + cloudOffset * 0.8}px`}}>☁️</div>
      <div style={{...styles.cloud, ...styles.cloud3, right: `${-50 + cloudOffset * 0.6}px`}}>☁️</div>
      
      {/* Pixel Cacti */}
      <div style={styles.cactus1}>🌵</div>
      <div style={styles.cactus2}>🌵</div>
      
      {/* Trophy for title */}
      {step === 1 && <div style={styles.trophy}>⚔️</div>}

      {step === 1 && (
        <section style={styles.step}>
          <h1 style={styles.gameTitle}>WOLVESVILLE</h1>
          <div style={styles.subtitle}>⭐Powered by Chi Pham⭐</div>
          
          <div style={styles.pixelBox}>
            <h3 style={styles.heading}>💎 Chọn số người chơi 💎</h3>
            <select
              style={styles.select}
              value={numPlayers}
              onChange={e => setNumPlayers(parseInt(e.target.value, 10))}
            >
              {playerOptions.map(n => <option key={n} value={n}>{n} người</option>)}
            </select>
          </div>
          
          <div style={styles.healthBar}>
            <div style={styles.healthFill}></div>
          </div>
          
          <div style={styles.navigation_step1}>
            <button style={styles.pixelButton} onClick={toStep2}>
              ▶ TIẾP TỤC
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section style={styles.step}>
          <div style={styles.pixelBox}>
            <h2 style={styles.heading}>📋 Nhập tên người chơi</h2>
            <div style={styles.inputContainer}>
              {players.map((name, i) => (
                <input
                  key={i}
                  style={styles.pixelInput}
                  placeholder={`Người chơi ${i + 1}`}
                  value={name}
                  onChange={e => {
                    const arr = [...players];
                    arr[i] = e.target.value;
                    setPlayers(arr);
                  }}
                />
              ))}
            </div>
          </div>
          
          <div style={styles.navigation}>
            <button style={styles.pixelBackButton} onClick={() => setStep(1)}>
              ◀ QUAY LẠI
            </button>
            <button style={styles.pixelButton} onClick={submitNames}>
              TIẾP TỤC ▶
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section style={styles.step}>
          <div style={styles.pixelBox}>
            <h2 style={styles.heading}>🪄 Thiết lập vai trò</h2>

            <div style={styles.inputContainer}>
              {players.map((p, i) => (
                <div key={i} style={styles.roleSelectContainer}>
                  <label style={styles.roleLabel}>Player {i + 1}:</label>
                  <select
                    style={styles.pixelSelect}
                    value={roleInputs[i] || ""}
                    onChange={e => {
                      const arr = [...roleInputs];
                      arr[i] = e.target.value;
                      setRoleInputs(arr);
                    }}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {availableRoles.map((role, idx) => (
                      <option key={idx} value={role.name}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div style={styles.actionButtons}>
              <button style={styles.pixelSpecialButton} onClick={autoAssignRoles}>
                ⚡ GIAO VAI TRÒ NHANH
              </button>
            </div>
          </div>

          <div style={styles.navigation}>
            <button style={styles.pixelBackButton} onClick={() => setStep(2)}>
              ◀ QUAY LẠI
            </button>
            <button style={styles.pixelButton} onClick={startRoles}>
              BẮT ĐẦU 🎯
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section style={styles.step}>
          <div style={styles.pixelBox}>
            <h2 style={styles.heading}>
              🎲 Đang quay cho: <span style={styles.currentPlayer}>{players[currentPlayer]}</span>
            </h2>

            <div style={styles.gameInfo}>
              <div style={styles.statBox}>
                <span>Người chơi: {currentPlayer + 1}/{players.length}</span>
                <span>Role còn lại: {remainingRoles.length}</span>
              </div>
            </div>

            <div style={styles.wheelContainer}>
              <div
                style={{
                  ...styles.pixelWheel,
                  background: wheelBackground,
                  transform: `rotate(${spinDeg}deg)`,
                  transition: spinning ? "transform 4s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
                }}
              />
              <div style={styles.pixelPointer}>▼</div>
            </div>

            {!spinning && !result && (
              <div style={styles.actionButtons}>
                <button
                  style={styles.pixelButton}
                  onClick={spin}
                  disabled={remainingRoles.length === 0}
                >
                  🎰 QUAY
                </button>
                <button
                  style={styles.pixelSpecialButton}
                  onClick={autoSpin}
                  disabled={remainingRoles.length === 0}
                >
                  ⚡ TỰ ĐỘNG
                </button>
              </div>
            )}

            {spinning && (
              <div style={styles.spinningText}>
                ✨ ĐANG QUAY... ✨
              </div>
            )}

            {result && (
              <div style={styles.pixelResultBox}>
                <div style={styles.resultText}>{result}</div>
                <button style={styles.pixelButton} onClick={nextAfterSpin}>
                  {currentPlayer + 1 < players.length ? "TIẾP THEO ▶" : "HOÀN THÀNH ✅"}
                </button>
              </div>
            )}
          </div>

          <div style={styles.navigation}>
            <button style={styles.pixelBackButton} onClick={backTo3}>
              ◀ QUAY LẠI
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section style={styles.step}>
          <div style={styles.pixelBox}>
            <h2 style={styles.heading}>🏆 Kết quả phân vai</h2>
            <div style={styles.playerList}>
              {assigned.map((a, idx) => {
                const roleIcon = availableRoles.find(r => r.name === a.role)?.icon || "";
                return (
                  <div
                    key={idx}
                    style={{
                      ...styles.pixelPlayerItem,
                      ...(marked.has(idx) ? styles.markedPixelItem : {})
                    }}
                    onClick={() => toggleMark(idx)}
                  >
                    <span style={styles.playerName}>{a.player}</span>
                    <span style={styles.playerRole}>{roleIcon} {a.role}</span>
                  </div>
                );
              })}
            </div>
            <div style={styles.finalStats}>
              <div style={styles.statBox}>
                <span>✅ Tổng số người chơi: {assigned.length}</span>
                <span>🔴 Đã loại: {marked.size} người</span>
              </div>
            </div>
          </div>
          
          <div style={styles.navigation_step1_5}>
            <button style={styles.pixelRestartButton} onClick={restartGame}>
              🔄 CHƠI LẠI
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Courier New', monospace",
    textAlign: "center",
    margin: 0,
    padding: "20px",
    background: "linear-gradient(180deg, #2c1810 0%, #8B4513 50%, #DAA520 100%)",
    minHeight: "100vh",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    imageRendering: "pixelated",
  },

  // Animated elements
  cloud: {
    position: "absolute",
    fontSize: "2em",
    zIndex: 1,
    filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.3))",
    animation: "float 3s ease-in-out infinite",
  },

  cloud1: {
    top: "10%",
    animationDelay: "0s",
  },

  cloud2: {
    top: "20%",
    animationDelay: "1s",
  },

  cloud3: {
    top: "15%",
    animationDelay: "2s",
  },

  cactus1: {
    position: "absolute",
    bottom: "20px",
    left: "50px",
    fontSize: "3em",
    zIndex: 1,
    filter: "drop-shadow(3px 3px 0px rgba(0,0,0,0.5))",
  },

  cactus2: {
    position: "absolute",
    bottom: "20px",
    right: "50px",
    fontSize: "2.5em",
    zIndex: 1,
    filter: "drop-shadow(3px 3px 0px rgba(0,0,0,0.5))",
  },

  trophy: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "4em",
    zIndex: 10,
    filter: "drop-shadow(3px 3px 0px rgba(0,0,0,0.5))",
    animation: "bounce 2s ease-in-out infinite",
  },

  gameTitle: {
    fontSize: "3em",
    fontWeight: "bold",
    color: "#FFD700",
    textShadow: "4px 4px 0px #8B4513, 8px 8px 0px #654321",
    marginBottom: "10px",
    letterSpacing: "4px",
  },

  subtitle: {
    fontSize: "1.2em",
    color: "#98FB98",
    textShadow: "2px 2px 0px #006400",
    marginBottom: "30px",
    letterSpacing: "2px",
  },

  step: {
    background: "rgba(0, 0, 0, 0.8)",
    border: "4px solid #FFD700",
    borderRadius: "0px",
    padding: "20px",
    width: "100%",
    marginBottom: "100px",
    maxWidth: "500px",
    boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.5)",
    position: "relative",
    zIndex: 5,
    imageRendering: "pixelated",
  },

  pixelBox: {
    background: "rgba(139, 69, 19, 0.9)",
    border: "3px solid #FFD700",
    padding: "20px",
    margin: "10px 0",
    position: "relative",
  },

  heading: {
    marginBottom: "20px",
    fontSize: "1.2em",
    color: "#FFD700",
    textShadow: "2px 2px 0px #8B4513",
    fontWeight: "bold",
  },

  select: {
    display: "block",
    margin: "20px auto",
    padding: "12px 16px",
    border: "3px solid #FFD700",
    borderRadius: "0px",
    fontSize: "16px",
    width: "100%",
    maxWidth: "250px",
    background: "#2F1B14",
    color: "#FFD700",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    fontWeight: "bold",
  },

  pixelInput: {
    display: "block",
    margin: "10px auto",
    padding: "12px 16px",
    border: "3px solid #FFD700",
    borderRadius: "0px",
    fontSize: "16px",
    width: "calc(100% - 40px)",
    maxWidth: "300px",
    background: "#2F1B14",
    color: "#FFD700",
    fontFamily: "'Courier New', monospace",
    fontWeight: "bold",
    boxSizing: "border-box",
  },

  pixelSelect: {
    width: "100%",
    padding: "10px 12px",
    border: "3px solid #FFD700",
    borderRadius: "0px",
    fontSize: "14px",
    background: "#2F1B14",
    color: "#FFD700",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    fontWeight: "bold",
  },

  pixelButton: {
    background: "linear-gradient(180deg, #FF6B6B 0%, #E55656 100%)",
    color: "white",
    border: "3px solid #FFD700",
    padding: "12px 20px",
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    textShadow: "1px 1px 0px rgba(0,0,0,0.5)",
    boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.3)",
    transition: "all 0.1s ease",
    letterSpacing: "1px",
  },

  pixelBackButton: {
    background: "linear-gradient(180deg, #4ECDC4 0%, #44A08D 100%)",
    color: "white",
    border: "3px solid #FFD700",
    padding: "12px 20px",
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    textShadow: "1px 1px 0px rgba(0,0,0,0.5)",
    boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.3)",
    transition: "all 0.1s ease",
    letterSpacing: "1px",
  },

  pixelRestartButton: {
    background: "linear-gradient(180deg, #F7DC6F 0%, #F4D03F 100%)",
    color: "#8B4513",
    border: "3px solid #FFD700",
    padding: "12px 20px",
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    textShadow: "1px 1px 0px rgba(255,255,255,0.5)",
    boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.3)",
    transition: "all 0.1s ease",
    letterSpacing: "1px",
  },

  pixelSpecialButton: {
    background: "linear-gradient(180deg, #A29BFE 0%, #6C5CE7 100%)",
    color: "white",
    border: "3px solid #FFD700",
    padding: "10px 16px",
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    fontFamily: "'Courier New', monospace",
    textShadow: "1px 1px 0px rgba(0,0,0,0.5)",
    boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.3)",
    margin: "5px",
    letterSpacing: "1px",
  },

  inputContainer: {
    marginBottom: "20px",
  },

  roleSelectContainer: {
    margin: "10px 0",
    textAlign: "left",
  },

  roleLabel: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#FFD700",
    textShadow: "1px 1px 0px rgba(0,0,0,0.5)",
  },

  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    gap: "10px",
    flexWrap: "wrap",
  },

  navigation_step1_5: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  },

  actionButtons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "15px 0",
    flexWrap: "wrap",
    gap: "10px",
  },

  currentPlayer: {
    color: "#98FB98",
    textShadow: "2px 2px 0px #006400",
    animation: "glow 2s ease-in-out infinite alternate",
  },

  gameInfo: {
    margin: "15px 0",
  },

  statBox: {
    background: "rgba(47, 27, 20, 0.9)",
    border: "2px solid #FFD700",
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    fontWeight: "bold",
  },

  wheelContainer: {
    position: "relative",
    margin: "20px auto",
    width: "200px",
    height: "200px",
  },

  pixelWheel: {
    width: "100%",
    height: "100%",
    border: "4px solid #FFD700",
    borderRadius: "50%", // Thêm borderRadius để làm tròn
    position: "relative",
    boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
    imageRendering: "pixelated",
  },

  pixelPointer: {
    position: "absolute",
    top: "-20px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "24px",
    color: "#FF6B6B",
    filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.5))",
    zIndex: 10,
  },

  spinningText: {
    fontSize: "1.2em",
    fontWeight: "bold",
    margin: "15px 0",
    color: "#98FB98",
    textShadow: "2px 2px 0px #006400",
    animation: "pulse 1s infinite",
  },

  pixelResultBox: {
    background: "rgba(47, 27, 20, 0.9)",
    border: "3px solid #FFD700",
    padding: "15px",
    margin: "15px 0",
  },

  resultText: {
    fontSize: "1.1em",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#98FB98",
    textShadow: "1px 1px 0px #006400",
  },

  playerList: {
    maxHeight: "300px",
    overflowY: "auto",
    margin: "5px 0",
  },

  pixelPlayerItem: {
    background: "linear-gradient(180deg, #98FB98 0%, #90EE90 100%)",
    color: "#2F1B14",
    margin: "5px 0",
    padding: "10px 15px",
    border: "2px solid #FFD700",
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.3)",
    userSelect: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.1s ease",
  },

  markedPixelItem: {
    background: "linear-gradient(180deg, #FFB6C1 0%, #FFA0B4 100%)",
    textDecoration: "line-through",
    color: "#8B4513",
    opacity: "0.7",
  },

  playerName: {
    fontWeight: "bold",
  },

  playerRole: {
    fontStyle: "italic",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  finalStats: {
    margin: "15px 0",
  },
};