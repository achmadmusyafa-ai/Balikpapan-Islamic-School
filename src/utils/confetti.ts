import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    // Left side burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6'],
    });
    // Right side burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6'],
    });
  } catch {
    // Ignore fallback
  }
}

export function fireBigWinConfetti() {
  try {
    const end = Date.now() + 1000;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F43F5E'],
      });
    }, 200);
  } catch {
    // Ignore
  }
}

export function fireStarSparkle(x = 0.5, y = 0.5) {
  try {
    confetti({
      particleCount: 20,
      spread: 40,
      startVelocity: 15,
      origin: { x, y },
      colors: ['#FBBF24', '#F59E0B', '#FDE047'],
      shapes: ['star', 'circle'],
    });
  } catch {
    // Ignore
  }
}
