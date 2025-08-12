import React, { useState, useEffect } from "react";

const ITEMS = {
  rock: {
    name: "Rock",
    beats: ["scissors"],
    icon: (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="#777" />
        <circle cx="32" cy="32" r="22" fill="#555" />
      </svg>
    ),
  },
  paper: {
    name: "Paper",
    beats: ["rock"],
    icon: (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="10" width="40" height="44" rx="4" fill="#eee" stroke="#333" strokeWidth="3" />
        <line x1="20" y1="20" x2="44" y2="20" stroke="#333" strokeWidth="2" />
        <line x1="20" y1="28" x2="44" y2="28" stroke="#333" strokeWidth="2" />
        <line x1="20" y1="36" x2="44" y2="36" stroke="#333" strokeWidth="2" />
        <line x1="20" y1="44" x2="44" y2="44" stroke="#333" strokeWidth="2" />
      </svg>
    ),
  },
  scissors: {
    name: "Scissors",
    beats: ["paper"],
    icon: (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="8" fill="#aaa" />
        <circle cx="44" cy="44" r="8" fill="#aaa" />
        <line x1="20" y1="20" x2="44" y2="44" stroke="#555" strokeWidth="6" strokeLinecap="round" />
        <line x1="28" y1="32" x2="36" y2="24" stroke="#555" strokeWidth="6" strokeLinecap="round" />
      </svg>
    ),
  },
  fire: {
    name: "Fire",
    beats: ["paper", "scissors"],
    icon: (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M32 4C20 20 24 32 32 40C40 48 36 56 36 60C44 52 52 44 52 32C44 20 36 12 32 4Z"
          fill="orange"
          stroke="red"
          strokeWidth="3"
        />
      </svg>
    ),
  },
};

const ITEM_ORDER = ["rock", "paper", "scissors", "fire"];

export default function App() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [showCutEffect, setShowCutEffect] = useState(false);

  useEffect(() => {
    if (playerChoice) {
      setFlipping(true);
      const opponentMove = ITEM_ORDER[Math.floor(Math.random() * ITEM_ORDER.length)];
      const flipTimeout = setTimeout(() => {
        setOpponentChoice(opponentMove);
        setFlipping(false);
        const winner = decideWinner(playerChoice, opponentMove);
        setResult(winner);
        if (
          (playerChoice === "scissors" && ITEMS[playerChoice].beats.includes(opponentMove)) ||
          (opponentMove === "scissors" && ITEMS[opponentMove].beats.includes(playerChoice))
        ) {
          setShowCutEffect(true);
          setTimeout(() => setShowCutEffect(false), 700);
        }
      }, 1500);

      return () => clearTimeout(flipTimeout);
    }
  }, [playerChoice]);

  function decideWinner(p1, p2) {
    if (p1 === p2) return "draw";
    if (ITEMS[p1].beats.includes(p2)) return "win";
    if (ITEMS[p2].beats.includes(p1)) return "lose";
    return "draw";
  }

  function resetGame() {
    setPlayerChoice(null);
    setOpponentChoice(null);
    setResult(null);
    setShowCutEffect(false);
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          user-select: none;
        }
        body {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          margin: 0; padding: 20px;
          display: flex;
          justify-content: center;
          min-height: 100vh;
          color: #222;
        }
        #root {
          width: 100%;
          max-width: 900px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          padding: 24px;
          text-align: center;
        }
        h1, h2, h3 {
          color: #42275a;
          margin-bottom: 16px;
        }
        .choices {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        button.choice {
          padding: 12px;
          border-radius: 12px;
          border: 2px solid #42275a;
          background-color: #eee;
          cursor: pointer;
          min-width: 100px;
          font-weight: 600;
          color: #42275a;
          box-shadow: 0 0 6px rgba(66,39,90,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: background-color 0.3s ease;
        }
        button.choice:hover {
          background-color: #6a11cb;
          color: white;
        }
        .game-area {
          margin-top: 40px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 40px;
          position: relative;
        }
        .player, .opponent {
          text-align: center;
          position: relative;
        }
        .card {
          border-radius: 20px;
          box-shadow: 0 0 12px #6a11cb;
          display: inline-block;
          background: #fff;
          padding: 8px;
          width: 96px;
          height: 96px;
          perspective: 600px;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        .card.flipping {
          transform: rotateY(180deg);
          box-shadow: 0 0 20px #f44336;
        }
        .card.opponent {
          box-shadow: 0 0 12px #f44336;
        }
        .result {
          margin-top: 40px;
          font-size: 28px;
          font-weight: bold;
          user-select: none;
        }
        .result.win {
          color: #4caf50;
        }
        .result.lose {
          color: #f44336;
        }
        .result.draw {
          color: #777;
        }
        button.reset {
          margin-top: 20px;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid #42275a;
          background-color: #eee;
          box-shadow: 0 0 8px rgba(66,39,90,0.3);
          transition: background-color 0.3s ease;
        }
        button.reset:hover {
          background-color: #6a11cb;
          color: white;
        }
        @keyframes cutting {
          0% {
            opacity: 1;
            transform: translateX(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateX(40px) rotate(30deg);
          }
        }
        .cut-effect {
          position: absolute;
          top: 10px;
          left: 50%;
          width: 80px;
          height: 80px;
          margin-left: -40px;
          pointer-events: none;
          z-index: 10;
          background: url('https://i.imgur.com/L4A2X6Q.png') no-repeat center / contain;
          animation: cutting 0.6s ease forwards;
        }
      `}</style>

      <h1>RPS Flip — Battle</h1>

      {!playerChoice && (
        <>
          <h2>Select your item:</h2>
          <div className="choices" role="list">
            {ITEM_ORDER.map((key) => (
              <button
                key={key}
                className="choice"
                onClick={() => setPlayerChoice(key)}
                aria-label={`Select ${ITEMS[key].name}`}
                role="listitem"
              >
                {ITEMS[key].icon}
                {ITEMS[key].name}
              </button>
            ))}
          </div>
        </>
      )}

      {playerChoice && (
        <div className="game-area">
          <div className="player" aria-label="Player choice">
            <h3>You</h3>
            <div className={`card${flipping ? " flipping" : ""}`}>{ITEMS[playerChoice].icon}</div>
          </div>

          <div style={{ fontSize: 24, marginTop: 60 }}>VS</div>

          <div className="opponent" aria-label="Opponent choice" style={{ position: "relative" }}>
            <h3>Opponent</h3>
            <div className={`card opponent${flipping ? "" : " flipping"}`}>
              {opponentChoice ? ITEMS[opponentChoice].icon : <div style={{width: 64, height: 64, backgroundColor: "#ccc", borderRadius: 12}} />}
            </div>
            {showCutEffect &&
              ((playerChoice === "scissors" && opponentChoice === "paper") ||
                (opponentChoice === "scissors" && playerChoice === "paper")) && (
                <div className="cut-effect" aria-hidden="true" />
              )}
          </div>
        </div>
      )}

      {result && (
        <div className={`result ${result}`}>
          {result === "win" && "🎉 You Win!"}
          {result === "lose" && "😞 You Lose!"}
          {result === "draw" && "🤝 It's a Draw!"}

          <button className="reset" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </>
  );
}
