export function animateChoice(playerBtn, botBtn, playerChoice, botChoice) {
  const resetStyle = (btn) => {
    btn.style.animation = 'none';
    btn.style.filter = 'none';
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = 'none';
  };
  resetStyle(playerBtn);
  resetStyle(botBtn);

  function addAnimation(btn, animName) {
    return new Promise((resolve) => {
      btn.style.animation = `${animName} 0.7s ease forwards`;
      btn.addEventListener('animationend', () => {
        btn.style.animation = 'none';
        resolve();
      }, { once: true });
    });
  }

  const animationsMap = {
    rock: 'rockShake',
    paper: 'paperFlutter',
    scissors: 'scissorsCut',
    fire: 'fireFlicker',
    water: 'waterSplash',
    robot: 'robotBlink',
    lightning: 'lightningStrike',
    wind: 'windBlow',
    earth: 'earthPulse',
    wizard: 'wizardGlow',
    dragon: 'dragonFire',
  };

  const playerAnim = animationsMap[playerChoice] || 'pulse';
  const botAnim = animationsMap[botChoice] || 'pulse';

  playerBtn.style.transform = 'scale(1.3)';
  playerBtn.style.boxShadow = `0 0 20px 6px #4CAF50`;

  botBtn.style.transform = 'scale(1.3)';
  botBtn.style.boxShadow = `0 0 20px 6px #f44336`;

  return Promise.all([
    addAnimation(playerBtn, playerAnim),
    addAnimation(botBtn, botAnim)
  ]).then(() => {
    playerBtn.style.transform = 'scale(1)';
    playerBtn.style.boxShadow = 'none';
    botBtn.style.transform = 'scale(1)';
    botBtn.style.boxShadow = 'none';
  });
}
