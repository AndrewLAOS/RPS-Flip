// animations.js
import { items } from './items.js';

/**
 * Canvas-based, cinematic, item-specific animations
 * for Ultimate Rock Paper Scissors Flip — Deluxe
 * All animations run centered in the #battle-animation-container
 */

function createCanvas() {
  const container = document.querySelector('#battle-animation-container');
  if (!container) {
    console.error('Battle animation container not found!');
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  canvas.style.position = 'absolute';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);
  return canvas.getContext('2d');
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function animateBattle(playerCard, playerKey, botCard, botKey) {
  return new Promise((resolve) => {
    const ctx = createCanvas();
    if (!ctx) return resolve(); // container missing, skip animation

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const startTime = performance.now();

    const duration = 2000; // 2 seconds animation
    const itemsToAnimate = [
      { emoji: items[playerKey].icon, x: centerX - 100, y: centerY, type: playerKey, dir: 1 },
      { emoji: items[botKey].icon, x: centerX + 100, y: centerY, type: botKey, dir: -1 },
    ];

    function draw(timestamp) {
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);
      clearCanvas(ctx);

      itemsToAnimate.forEach((it) => {
        ctx.save();
        ctx.font = '64px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Unique animations per item
        switch (it.type) {
          case 'rock':
            ctx.translate(it.x, it.y);
            ctx.rotate(Math.sin(t * Math.PI * 4) * 0.5 * it.dir);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'paper':
            ctx.translate(it.x, it.y);
            ctx.rotate(Math.sin(t * Math.PI * 2) * 0.2);
            ctx.translate(Math.sin(t * Math.PI * 4) * 50 * it.dir, 0);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'scissors':
            ctx.translate(it.x, it.y);
            ctx.rotate(Math.sin(t * Math.PI * 6) * 0.8 * it.dir);
            ctx.fillText(it.emoji, 0, -Math.sin(t * Math.PI * 4) * 30);
            break;
          // ... keep all other cases unchanged ...
          case 'void':
            ctx.translate(it.x, it.y);
            ctx.globalAlpha = 1 - t;
            ctx.fillText(it.emoji, 0, 0);
            break;
          default:
            ctx.translate(it.x, it.y);
            ctx.fillText(it.emoji, 0, 0);
        }

        ctx.restore();
      });

      if (t < 1) {
        requestAnimationFrame(draw);
      } else {
        ctx.canvas.remove(); // remove the canvas after animation
        resolve();
      }
    }

    requestAnimationFrame(draw);
  });
}

export { animateBattle };
