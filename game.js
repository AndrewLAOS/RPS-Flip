import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../App"; // Your auth context
import rockImg from "../assets/items/rock.png";
import paperImg from "../assets/items/paper.png";
import scissorsImg from "../assets/items/scissors.png";
import fireImg from "../assets/items/fire.png";
import './style.css';


// Map items to images and beats for game logic
const ITEMS = {
  rock: { name: "Rock", img: rockImg, beats: ["scissors"] },
  paper: { name: "Paper", img: paperImg, beats: ["rock"] },
  scissors: { name: "Scissors", img: scissorsImg, beats: ["paper"] },
  fire: { name: "Fire", img: fireImg, beats: ["paper", "scissors"] },
  // Add more items here...
};

// Animation variants
const cardVariants = {
  hidden: { rotateY: 0, scale: 1 },
  flipping: { rotateY: 180, scale: 1.1, transition: { duration: 0.8 } },
  flipped: { rotateY: 180, scale: 1 },
};

const containerStyle = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  marginTop: 40,
};

const buttonStyle = {
  padding: "10px 20px",
  margin: "10px",
  fontSize: 16,
  borderRadius: 8,
  cursor: "pointer",
  border: "2px solid #444",
  backgroundColor: "#eee",
  minWidth: 100,
  userSelect: "none",
};

const selectedButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#66bb6a",
  color: "white",
  borderColor: "#388e3c",
};

const scissorsCutEffect = {
  position: "absolute",
  width: 80,
  height: 80,
  top: 20,
  left: "50%",
  marginLeft: -40,
  pointerEvents: "none",
  zIndex: 10,
  animation: "cutting 0.6s ease forwards",
};

const cutAnimationStyle = `
@keyframes cutting {
  0% { opacity: 1; transform: translateX(0) rotate(0deg); }
  100% { opacity: 0; transform: translateX(40px) rotate(30deg); }
}
`;

function Game() {
  const { matchId } = useParams(); // You can later use this to load/save match data
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [showCutEffect, setShowCutEffect] = useState(false);

  // Simulate opponent random choice for demo
  useEffect(() => {
    if (playerChoice) {
      setFlipping(true);
      const opponentMove = Object.keys(ITEMS)[
        Math.floor(Math.random() * Object.keys(ITEMS).length)
      ];
      setTimeout(() => {
        setOpponentChoice(opponentMove);
        setFlipping(false);
        // Decide result
        const winner = decideWinner(playerChoice, opponentMove);
        setResult(winner);
        // Show scissors cut effect if needed
        if (
          (playerChoice === "scissors" && ITEMS[playerChoice].beats.includes(opponentMove)) ||
          (opponentMove === "scissors" && ITEMS[opponentMove].beats.includes(playerChoice))
        ) {
          setShowCutEffect(true);
          setTimeout(() => setShowCutEffect(false), 700);
        }
      }, 1500);
    }
  }, [playerChoice]);

  // Basic game logic: returns "win", "lose", or "draw"
  function decideWinner(p1, p2) {
    if (p1 === p2) return "draw";
    if (ITEMS[p1].beats.includes(p2)) return "win";
    if (ITEMS[p2].beats.includes(p1)) return "lose";
    return "draw"; // fallback if no beats info
  }

  // Reset the game
  function resetGame() {
    setPlayerChoice(null);
    setOpponentChoice(null);
    setResult(null);
  }

  // Go back to lobby
  function exitGame() {
    navigate("/lobby");
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <style>{cutAnimationStyle}</style>

      <h1 style={{ textAlign: "center", marginBottom: 20 }}>RPS Flip — Battle</h1>

      {/* Choices */}
      {!playerChoice && (
        <div style={{ textAlign: "center" }}>
          <h2>Select your item:</h2>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
            {Object.entries(ITEMS).map(([key, item]) => (
              <button
                key={key}
                style={buttonStyle}
                onClick={() => setPlayerChoice(key)}
                aria-label={`Select ${item.name}`}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  width={48}
                  height={48}
                  style={{ marginBottom: 8 }}
                />
                <br />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Battle */}
      {playerChoice && (
        <div style={containerStyle}>
          <div style={{ textAlign: "center", position: "relative" }}>
            <h3>You</h3>
            <AnimatePresence>
              <motion.img
                key={playerChoice}
                src={ITEMS[playerChoice].img}
                alt={ITEMS[playerChoice].name}
                width={120}
                height={120}
                style={{ borderRadius: 12, boxShadow: "0 0 10px #4caf50" }}
                initial={{ rotateY: 0 }}
                animate={flipping ? { rotateY: 180 } : { rotateY: 0 }}
                transition={{ duration: 0.8 }}
              />
            </AnimatePresence>
          </div>

          <div style={{ fontSize: 24, marginTop: 60 }}>
            <p>VS</p>
          </div>

          <div style={{ textAlign: "center", position: "relative" }}>
            <h3>Opponent</h3>
            <AnimatePresence>
              <motion.img
                key={opponentChoice || "back"}
                src={opponentChoice ? ITEMS[opponentChoice].img : "/card-back.png"}
                alt={opponentChoice ? ITEMS[opponentChoice].name : "Card Back"}
                width={120}
                height={120}
                style={{ borderRadius: 12, boxShadow: "0 0 10px #f44336" }}
                initial={{ rotateY: 0 }}
                animate={flipping ? { rotateY: 0 } : { rotateY: 180 }}
                transition={{ duration: 0.8 }}
              />
            </AnimatePresence>

            {/* Scissors cut effect on opponent side */}
            {showCutEffect && playerChoice === "scissors" && opponentChoice === "paper" && (
              <img
                src={scissorsImg}
                alt="Cutting effect"
                style={scissorsCutEffect}
                aria-hidden="true"
              />
            )}
            {/* Scissors cut effect on player side */}
            {showCutEffect && opponentChoice === "scissors" && playerChoice === "paper" && (
              <img
                src={scissorsImg}
                alt="Cutting effect"
                style={{ ...scissorsCutEffect, left: "25%" }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}

      {/* Result & Controls */}
      {result && (
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: 28,
            fontWeight: "bold",
            color:
              result === "win" ? "#4caf50" : result === "lose" ? "#f44336" : "#777",
          }}
          role="alert"
        >
          {result === "win" && "🎉 You Win!"}
          {result === "lose" && "😞 You Lose!"}
          {result === "draw" && "🤝 It's a Draw!"}
          <div style={{ marginTop: 20 }}>
            <button style={buttonStyle} onClick={resetGame}>
              Play Again
            </button>
            <button
              style={{ ...buttonStyle, backgroundColor: "#ef5350", color: "white" }}
              onClick={exitGame}
            >
              Exit to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
