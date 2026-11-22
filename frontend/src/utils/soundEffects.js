/**
 * soundEffects.js
 * Synthesizes clear, reliable audio chimes using the browser's native Web Audio API.
 * Benefits: Zero external mp3 dependencies, 0ms latency, zero 404/CORS errors,
 * and high compatibility across mobile and desktop browsers.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Unlock AudioContext on user interaction
 */
export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch {}
}

/**
 * Play a bell tone with pleasant harmonic decay
 */
function playTone(freq, startTime, duration, gainValue = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // فحص سياسة التشغيل التلقائي (Autoplay Policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
    if (ctx.state === 'suspended') {
      return; // المتصفح معلق للصوت لحين أول نقرة من المستخدم
    }
  }

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(gainValue, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (err) {
    // الصمت بأمان في حال اعتراض المتصفح للصوت
  }
}

/**
 * Play Restaurant Order Bell (Vendor Chime 🔔)
 * Cheerful, urgent 3-tone ascending bell pattern (E5 -> G#5 -> B5) repeated twice.
 */
export function playNewOrderSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Chime 1
    playTone(659.25, now + 0.00, 0.25, 0.35); // E5
    playTone(830.61, now + 0.12, 0.25, 0.35); // G#5
    playTone(987.77, now + 0.24, 0.50, 0.40); // B5

    // Chime 2 (repeat for attention)
    playTone(659.25, now + 0.55, 0.25, 0.35);
    playTone(830.61, now + 0.67, 0.25, 0.35);
    playTone(987.77, now + 0.79, 0.65, 0.40);
  } catch (err) {
    console.warn('Could not play order sound:', err);
  }
}

/**
 * Play Order Status Updated Sound (Customer Chime 🛵)
 * Gentle, pleasant 2-tone melodic notification (C5 -> G5).
 */
export function playOrderStatusSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    playTone(523.25, now + 0.00, 0.25, 0.25); // C5
    playTone(783.99, now + 0.15, 0.45, 0.30); // G5
  } catch (err) {
    console.warn('Could not play status sound:', err);
  }
}
