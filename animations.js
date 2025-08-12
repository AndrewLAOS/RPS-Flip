export function animateChoice(playerBtn, botBtn, playerChoice, botChoice) {
  // Reset styles
  const resetStyle = (btn) => {
    btn.style.animation = 'none';
    btn.style.filter = 'none';
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = 'none';
  };
  resetStyle(playerBtn);
  resetStyle(botBtn);

  // Helper: add animation and return a Promise for end of animation
  function addAnimation(btn, animName) {
    return new Promise((resolve) => {
      btn.style.animation = `${animName} 0.7s ease forwards`;
      btn.addEventListener('animationend', () => {
        btn.style.animation = 'none';
        resolve();
      }, { once: true });
    });
  }

  // Map item name to CSS animation names
  const animationsMap = {
    rock: 'rockShake',
    paper: 'paperFlutter',
    scissors: 'scissorsCut',
    fire: 'fireFlicker',
    water: 'waterSplash',
    robot: 'robotBlink',
  };

  // Player animations
  const playerAnim = animationsMap[playerChoice] || 'pulse';
  // Bot animations
  const botAnim = animationsMap[botChoice] || 'pulse';

  // Scale and shadow colors
  playerBtn.style.transform = 'scale(1.3)';
  playerBtn.style.boxShadow = '0 0 15px 5px #4CAF50';
  botBtn.style.transform = 'scale(1.3)';
  botBtn.style.boxShadow = '0 0 15px 5px #f44336';

  // Run animations simultaneously, then reset scale and shadow after done
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
