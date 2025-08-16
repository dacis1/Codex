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

  // Available roles with icons placeholder
  const availableRoles = [
    { name: "Bảo Vệ", icon: "🛡️" },
    { name: "Thợ Săn", icon: "🏹" },
    { name: "Tiên Tri", icon: "🔮" },
    { name: "Phù Thủy", icon: "🧙‍♀️" },
    { name: "Cupid", icon: "💘" },
    { name: "Người phù phép", icon: "✨" },
    { name: "Dân Làng", icon: "👨‍🌾" },
    { name: "Sói", icon: "🐺" },
    { name: "Sói Con", icon: "🐻‍❄️" },
    { name: "Sói đầu đàng", icon: "🐕‍🦺" },
    { name: "Bán Sói", icon: "🌗" },
    { name: "Kẻ phản bội", icon: "🔪" },
    { name: "Thằng Khờ", icon: "🤡" }
  ];

  // Derived conic-gradient for wheel (simple color wheel without role labels)
  const wheelBackground = useMemo(() => {
    const n = Math.max(remainingRoles.length, 1);
    const step = 360 / n;
    const slices = [];
    for (let i = 0; i < n; i++) {
      const hue = (i * 360 / n) % 360;
      slices.push(`hsl(${hue}, 70%, 60%) ${i * step}deg ${(i + 1) * step}deg`);
    }
    return `conic-gradient(${slices.join(",")})`;
  }, [remainingRoles]);

  // Preset roles for quick setup - removed as requested

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

    // More varied spin duration
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
      {step === 1 && (
        <section style={styles.step}>
          <h2 style={styles.heading}>🎮 Chọn số người chơi</h2>
          <select
            style={styles.select}
            value={numPlayers}
            onChange={e => setNumPlayers(parseInt(e.target.value, 10))}
          >
            {playerOptions.map(n => <option key={n} value={n}>{n} người</option>)}
          </select>
          <div style={styles.navigation_step1}>
            <button style={styles.button} onClick={toStep2}>
              Tiếp tục →
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section style={styles.step}>
          <h2 style={styles.heading}>👥 Nhập tên người chơi</h2>
          <div style={styles.inputContainer}>
            {players.map((name, i) => (
              <input
                key={i}
                style={styles.input}
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
          <div style={styles.navigation}>
            <button style={styles.backButton} onClick={() => setStep(1)}>
              ← Quay lại
            </button>
            <button style={styles.button} onClick={submitNames}>
              Tiếp tục →
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section style={styles.step}>
          <h2 style={styles.heading}>🎭 Thiết lập vai trò</h2>

          <div style={styles.inputContainer}>
            {players.map((p, i) => (
              <div key={i} style={styles.roleSelectContainer}>
                <label style={styles.roleLabel}>Người chơi {i + 1}:</label>
                <select
                  style={styles.roleSelect}
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
            <button style={styles.autoAssignButton} onClick={autoAssignRoles}>
              ⚡ Gán vai trò nhanh
            </button>
          </div>

          <div style={styles.navigation}>
            <button style={styles.backButton} onClick={() => setStep(2)}>
              ← Quay lại
            </button>
            <button style={styles.button} onClick={startRoles}>
              Bắt đầu 🎯
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section style={styles.step}>
          <h2 style={styles.heading}>
            🎲 Đang quay cho: <span style={styles.currentPlayer}>{players[currentPlayer]}</span>
          </h2>

          <div style={styles.gameInfo}>
            <p>Người chơi: {currentPlayer + 1}/{players.length}</p>
            <p>Vai trò còn lại: {remainingRoles.length}</p>
          </div>

          <div style={styles.wheelContainer}>
            <div
              style={{
                ...styles.wheel,
                background: wheelBackground,
                transform: `rotate(${spinDeg}deg)`,
                transition: spinning ? "transform 4s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
              }}
            />
            <div style={styles.pointer}></div>
          </div>

          {!spinning && !result && (
            <div style={styles.actionButtons}>
              <button
                style={styles.button}
                onClick={spin}
                disabled={remainingRoles.length === 0}
              >
                🎰 Quay
              </button>
              <button
                style={styles.autoSpinButton}
                onClick={autoSpin}
                disabled={remainingRoles.length === 0}
              >
                ⚡ Quay tự động
              </button>
            </div>
          )}

          {spinning && (
            <div style={styles.spinningText}>
              🌟 Đang quay... 🌟
            </div>
          )}

          {result && (
            <div style={styles.result}>
              <div style={styles.resultText}>{result}</div>
              <button style={styles.button} onClick={nextAfterSpin}>
                {currentPlayer + 1 < players.length ? "Tiếp theo →" : "Hoàn thành ✅"}
              </button>
            </div>
          )}

          <div style={styles.navigation}>
            <button style={styles.backButton} onClick={backTo3}>
              ← Quay lại
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section style={styles.step}>
          <h2 style={styles.heading}>🏆 Kết quả phân vai</h2>
          <div style={styles.playerList}>
            {assigned.map((a, idx) => {
              const roleIcon = availableRoles.find(r => r.name === a.role)?.icon || "";
              return (
                <div
                  key={idx}
                  style={{
                    ...styles.playerItem,
                    ...(marked.has(idx) ? styles.markedItem : {})
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
            <p>✅ Tổng số người chơi: {assigned.length}</p>
            <p>🔴 Đã loại: {marked.size} người</p>
          </div>
          <div style={styles.navigation}>
            <button style={styles.restartButton} onClick={restartGame}>
              🔄 Chơi lại
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    textAlign: "center",
    margin: 0,
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  step: {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "25px",
    padding: "30px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },

  heading: {
    marginBottom: "25px",
    fontSize: "1.8em",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
    fontWeight: "600",
    lineHeight: "1.3",
  },

  subHeading: {
    fontSize: "1.1em",
    marginBottom: "15px",
    color: "rgba(255, 255, 255, 0.9)",
  },

  select: {
    display: "block",
    margin: "20px auto",
    padding: "18px 24px",
    border: "none",
    borderRadius: "15px",
    fontSize: "18px",
    width: "100%",
    maxWidth: "300px",
    background: "rgba(255, 255, 255, 0.95)",
    color: "#333",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },

  inputContainer: {
    marginBottom: "20px",
  },

  input: {
    display: "block",
    margin: "15px auto",
    padding: "18px 24px",
    border: "none",
    borderRadius: "15px",
    fontSize: "16px",
    width: "100%",
    maxWidth: "300px",
    background: "rgba(255, 255, 255, 0.95)",
    color: "#333",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },

  roleSelectContainer: {
    margin: "15px 0",
    textAlign: "left",
  },

  roleLabel: {
    display: "block",
    marginBottom: "8px",
    fontSize: "16px",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },

  roleSelect: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    background: "rgba(255, 255, 255, 0.95)",
    color: "#333",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  button: {
    background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
    color: "white",
    border: "none",
    padding: "16px 28px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    minWidth: "120px",
    transition: "all 0.3s ease",
  },

  backButton: {
    background: "linear-gradient(45deg, #74b9ff, #0984e3)",
    color: "white",
    border: "none",
    padding: "16px 28px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    minWidth: "120px",
    transition: "all 0.3s ease",
  },

  restartButton: {
    background: "linear-gradient(45deg, #fdcb6e, #e17055)",
    color: "white",
    border: "none",
    padding: "16px 28px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    minWidth: "120px",
    transition: "all 0.3s ease",
  },

  autoAssignButton: {
    background: "linear-gradient(45deg, #00cec9, #55a3ff)",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    margin: "10px",
  },

  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "30px",
    gap: "15px",
    flexWrap: "wrap",
  },
  navigation_step1: {
    display: "center",
    alignItems: "center",
    marginTop: "30px",
    gap: "15px",
    flexWrap: "wrap",
  },

  actionButtons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "20px 0",
    flexWrap: "wrap",
  },

  currentPlayer: {
    color: "#ffeaa7",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  },

  gameInfo: {
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "15px",
    padding: "15px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  wheelContainer: {
    position: "relative",
    margin: "30px auto",
    width: "280px",
    height: "280px",
  },

  wheel: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "4px solid #fff",
    position: "relative",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },

  pointer: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "0",
    height: "0",
    borderLeft: "18px solid transparent",
    borderRight: "18px solid transparent",
    borderBottom: "30px solid #ff6b6b",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
    zIndex: 10,
  },

  spinningText: {
    fontSize: "1.2em",
    fontWeight: "bold",
    margin: "20px 0",
    animation: "pulse 1s infinite",
  },

  result: {
    marginTop: "25px",
  },

  resultText: {
    fontSize: "1.3em",
    fontWeight: "bold",
    background: "rgba(255, 255, 255, 0.2)",
    padding: "20px",
    borderRadius: "15px",
    backdropFilter: "blur(10px)",
    marginBottom: "15px",
    lineHeight: "1.4",
  },

  playerList: {
    maxHeight: "400px",
    overflowY: "auto",
    marginTop: "20px",
  },

  playerItem: {
    background: "rgba(144, 238, 144, 0.8)",
    color: "#333",
    margin: "10px 0",
    padding: "15px 20px",
    borderRadius: "15px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "2px solid transparent",
    userSelect: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
  },

  markedItem: {
    background: "rgba(255, 182, 193, 0.8)",
    textDecoration: "line-through",
    borderColor: "rgba(255, 99, 132, 0.5)",
    color: "#666",
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
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "15px",
    padding: "15px",
    margin: "20px 0",
    fontSize: "14px",
  },
  autoSpinButton: {
    background: "linear-gradient(45deg, #a29bfe, #6c5ce7)",
    color: "white",
    border: "none",
    padding: "16px 28px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    minWidth: "120px",
    transition: "all 0.3s ease",
    margin: "0 10px",
  },
};