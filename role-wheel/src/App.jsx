import { useEffect, useMemo, useState } from "react";
import "./App.css";

export default function App() {
  // Steps: 1..5
  const [step, setStep] = useState(1);
  const [numPlayers, setNumPlayers] = useState(1);
  const playerOptions = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);
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

  // Derived conic-gradient for wheel
  const wheelBackground = useMemo(() => {
    const n = Math.max(remainingRoles.length, 1);
    const step = 360 / n;
    const slices = [];
    for (let i = 0; i < n; i++) {
      slices.push(`hsl(${(i * step) % 360},70%,60%) ${i * step}deg ${(i + 1) * step}deg`);
    }
    return `conic-gradient(${slices.join(",")})`;
  }, [remainingRoles.length]);

  const goStep1 = () => {
    setStep(1);
    setNumPlayers(1);
    setPlayers([]);
    setRoles([]);
    setRolesInput("");
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

  const backTo1 = () => setStep(1);

  const startRoles = () => {
    const list = roleInputs.map(r => r.trim()).filter(Boolean);
    setRoles(list);
    setRemainingRoles(list.slice());
    setCurrentPlayer(0);
    setAssigned([]);
    setMarked(new Set());
    setStep(4);
    setSpinDeg(0);
    setResult("");
  };

  const backTo3 = () => {
    setRemainingRoles(roles.slice());
    setCurrentPlayer(0);
    setAssigned([]);
    setMarked(new Set());
    setSpinDeg(0);
    setResult("");
    setStep(3);
  };

  const restartGame = () => {
    setRemainingRoles(roles.slice());
    setCurrentPlayer(0);
    setAssigned([]);
    setMarked(new Set());
    setSpinDeg(0);
    setResult("");
    setStep(4);
  };

  const spin = () => {
  if (spinning || remainingRoles.length === 0) return;
  setResult("");
  setSpinning(true);

  const nd = 360 * 4 + Math.random() * 360;
  setSpinDeg(nd);

  setTimeout(() => {
    const idx = Math.floor(Math.random() * remainingRoles.length);
    const pick = remainingRoles[idx];
    const rest = remainingRoles.filter((_, i) => i !== idx);
    setRemainingRoles(rest);
    setAssigned(a => [...a, { player: players[currentPlayer], role: pick }]);

    setResult(`${players[currentPlayer]} - ${pick}`);
    setSpinning(false);                              
  }, 4000);
};


  const nextAfterSpin = () => {
  if (!result) return;
  const next = currentPlayer + 1;
  if (next < players.length) {
    setCurrentPlayer(next);
    setResult("");
    setSpinDeg(0);
  } else {
    setStep(5);
  }
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
    <div className="container">
      {step === 1 && (
        <section className="step">
          <h2>Chọn số người chơi</h2>
          <select value={numPlayers} onChange={e => setNumPlayers(parseInt(e.target.value, 10))}>
            {playerOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <div className="navigation center">
            <button onClick={toStep2}>Tiếp tục</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="step">
          <h2>Nhập tên người chơi</h2>
          <form className="nameForm" onSubmit={(e) => e.preventDefault()}>
            {players.map((name, i) => (
              <input
                key={i}
                placeholder={`Người chơi ${i + 1}`}
                value={name}
                onChange={e => {
                  const arr = [...players];
                  arr[i] = e.target.value;
                  setPlayers(arr);
                }}
              />
            ))}
          </form>
          <div className="navigation">
            <button className="back-btn" onClick={backTo1}>Quay lại</button>
            <button onClick={submitNames}>Tiếp tục</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="step">
          <h2>Nhập vai trò cho từng người chơi</h2>
          <form className="nameForm" onSubmit={(e) => e.preventDefault()}>
            {players.map((p, i) => (
              <input
                key={i}
                placeholder={`Vai trò của ${p}`}
                value={roleInputs[i] || ""}
                onChange={e => {
                  const arr = [...roleInputs];
                  arr[i] = e.target.value;
                  setRoleInputs(arr);
                }}
              />
            ))}
          </form>
          <div className="navigation">
            <button className="back-btn" onClick={() => setStep(2)}>Quay lại</button>
            <button onClick={startRoles}>Bắt đầu</button>
          </div>
        </section>
      )}


      {step === 4 && (
        <section className="step">
          <h2>Đang quay cho: <span id="currentPlayer">{players[currentPlayer]}</span></h2>
          <div id="wheelContainer">
            <div
              id="wheel"
              style={{
                background: wheelBackground,
                transform: `rotate(${spinDeg}deg)`,
                transition: spinning ? "transform 4s ease-out" : "none",
              }}
            />
            <div id="pointer"></div>
          </div>
          {/* Ẩn nút Quay khi đang quay hoặc đã có kết quả; chỉ hiện khi chưa quay và chưa có result */}
          {(!spinning && !result) && (
            <button id="spin" onClick={spin} disabled={remainingRoles.length === 0}>
              Quay
            </button>
          )}
          <button id="spin" onClick={spin} disabled={spinning || remainingRoles.length === 0}>Quay</button>
          <div id="result">{result}</div>
          {Boolean(result) && (
            <button id="next" onClick={nextAfterSpin}>
              OK
            </button>
          )}
          <div className="navigation" style={{ marginTop: 30 }}>
            <button className="back-btn" onClick={backTo3}>Quay lại</button>
            <button className="back-btn" onClick={restartGame}>Chơi lại</button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="step">
          <h2>Danh sách người chơi</h2>
          <div className="player-list">
            {assigned.map((a, idx) => (
              <div
                key={idx}
                className={`player-item ${marked.has(idx) ? "marked" : ""}`}
                onClick={() => toggleMark(idx)}
              >
                {a.player} - {a.role}
              </div>
            ))}
          </div>
          <div className="navigation center">
            <button className="back-btn" onClick={goStep1}>Chơi lại</button>
          </div>
        </section>
      )}
    </div>
  );
}