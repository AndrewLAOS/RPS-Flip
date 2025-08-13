// animations.js
import { items } from './items.js';

/**
 * Canvas-based, cinematic, item-specific animations
 * for Ultimate Rock Paper Scissors Flip — Deluxe
 * All animations run centered in the battle stage
 */

const battleStage = document.getElementById('battle-stage');

function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = battleStage.clientWidth;
  canvas.height = battleStage.clientHeight;
  canvas.style.position = 'absolute';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.pointerEvents = 'none';
  battleStage.appendChild(canvas);
  return canvas.getContext('2d');
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function animateBattle(playerCard, playerKey, botCard, botKey) {
  return new Promise((resolve) => {
    const ctx = createCanvas();
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
          case 'thorn':
            ctx.translate(it.x, it.y - 50 * t);
            ctx.rotate(Math.sin(t * Math.PI * 3) * 0.5);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'tide':
            ctx.translate(it.x, it.y + Math.sin(t * Math.PI * 4) * 40);
            ctx.rotate(Math.sin(t * Math.PI * 2) * 0.3);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'vine':
            ctx.translate(it.x, it.y);
            ctx.rotate(Math.sin(t * Math.PI * 4) * 0.6);
            ctx.fillText(it.emoji, Math.sin(t * Math.PI * 6) * 30, Math.cos(t * Math.PI * 6) * 30);
            break;
          case 'spock':
            ctx.translate(it.x, it.y);
            ctx.rotate(Math.sin(t * Math.PI * 3) * 0.5);
            ctx.fillText(it.emoji, Math.cos(t * Math.PI * 4) * 40, Math.sin(t * Math.PI * 4) * 40);
            break;
          case 'dagger':
            ctx.translate(it.x + t * 50 * it.dir, it.y - t * 50);
            ctx.rotate(Math.sin(t * Math.PI * 5) * 0.7);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'magnet':
            ctx.translate(it.x, it.y);
            ctx.rotate(Math.sin(t * Math.PI * 3) * 0.4);
            ctx.fillText(it.emoji, Math.sin(t * Math.PI * 8) * 40, 0);
            break;
          case 'mirror':
            ctx.translate(it.x, it.y);
            ctx.scale(Math.sin(t * Math.PI * 2) * 0.5 + 1, 1);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'bomb':
            ctx.translate(it.x, it.y - 50 * t);
            ctx.rotate(t * Math.PI * 8);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'earth':
            ctx.translate(it.x, it.y);
            ctx.rotate(t * Math.PI * 4);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'robot':
            ctx.translate(it.x + Math.sin(t * Math.PI * 4) * 50, it.y);
            ctx.rotate(Math.sin(t * Math.PI * 2) * 0.3);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'shield':
            ctx.translate(it.x, it.y + Math.sin(t * Math.PI * 3) * 20);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'prism':
            ctx.translate(it.x + Math.sin(t * Math.PI * 6) * 30, it.y + Math.cos(t * Math.PI * 6) * 30);
            ctx.rotate(t * Math.PI * 2);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'ice_beam':
            ctx.translate(it.x, it.y);
            ctx.fillText(it.emoji, 0, -t * 100);
            break;
          case 'clock':
            ctx.translate(it.x, it.y);
            ctx.rotate(t * Math.PI * 4);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'storm':
            ctx.translate(it.x + Math.sin(t * Math.PI * 6) * 50, it.y - t * 50);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'thunder':
            ctx.translate(it.x, it.y - t * 80);
            ctx.rotate(Math.sin(t * Math.PI * 4));
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'comet':
            ctx.translate(it.x + t * 200 * it.dir, it.y - t * 100);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'phoenix':
            ctx.translate(it.x + Math.sin(t * Math.PI * 6) * 60, it.y - t * 50);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'eclipse':
            ctx.translate(it.x, it.y);
            ctx.scale(1 - t * 0.5, 1 - t * 0.5);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'storm_king':
            ctx.translate(it.x + Math.sin(t * Math.PI * 4) * 50, it.y - t * 60);
            ctx.fillText(it.emoji, 0, 0);
            break;
          case 'thunder_god':
            ctx.translate(it.x, it.y - t * 100);
            ctx.rotate(Math.sin(t * Math.PI * 8));
            ctx.fillText(it.emoji, 0, 0);
            break;
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
        battleStage.removeChild(ctx.canvas);
        resolve();
      }
    }

    requestAnimationFrame(draw);
  });
}

export { animateBattle };
