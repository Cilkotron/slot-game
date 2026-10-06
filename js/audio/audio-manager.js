/* =========================================================
   AUDIO MANAGER
   Uses Web Audio API to generate sounds programmatically
========================================================= */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.currentMusicNodes = [];
    }

    init() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.musicGain = this.audioContext.createGain();
        this.sfxGain = this.audioContext.createGain();

        this.musicGain.gain.value = 0.1;
        this.sfxGain.gain.value = 0.2;

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
    }

    ensureContext() {
        if (!this.audioContext) {
            this.init();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /* =========================================================
       BACKGROUND MUSIC (Simple casino-style loop)
    ========================================================= */

    startBackgroundMusic() {
        this.ensureContext();
        if (!this.musicEnabled || this.isMuted) return;
        this.stopBackgroundMusic();

        const playNote = (freq, startTime, duration, type = 'sine') => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = type;
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(startTime);
            osc.stop(startTime + duration);

            this.currentMusicNodes.push(osc, gain);
        };

        const now = this.audioContext.currentTime;
        const loopDuration = 6;

        // Gentle, soothing melody
        const melody = [
            { freq: 523.25, time: 0, dur: 0.4 },      // C5
            { freq: 587.33, time: 0.6, dur: 0.4 },    // D5
            { freq: 659.25, time: 1.2, dur: 0.4 },    // E5
            { freq: 783.99, time: 1.8, dur: 0.6 },    // G5
            { freq: 659.25, time: 2.6, dur: 0.4 },    // E5
            { freq: 587.33, time: 3.2, dur: 0.4 },    // D5
            { freq: 523.25, time: 3.8, dur: 0.6 },    // C5
            { freq: 587.33, time: 4.6, dur: 0.4 },    // D5
            { freq: 659.25, time: 5.2, dur: 0.4 },    // E5
        ];

        melody.forEach(note => {
            playNote(note.freq, now + note.time, note.dur, 'sine');
        });

        // Bass line
        const bass = [
            { freq: 261.63, time: 0, dur: 0.4 },      // C4
            { freq: 261.63, time: 0.8, dur: 0.4 },    // C4
            { freq: 293.66, time: 1.6, dur: 0.4 },    // D4
            { freq: 349.23, time: 2.0, dur: 0.4 },    // F4
            { freq: 392.00, time: 2.4, dur: 0.4 },    // G4
            { freq: 349.23, time: 2.8, dur: 0.4 },    // F4
            { freq: 293.66, time: 3.2, dur: 0.4 },    // D4
            { freq: 261.63, time: 3.6, dur: 0.5 },    // C4
        ];

        bass.forEach(note => {
            playNote(note.freq, now + note.time, note.dur, 'sine');
        });

        // Loop the music
        this.musicInterval = setInterval(() => {
            if (this.musicEnabled && !this.isMuted) {
                this.startBackgroundMusic();
            }
        }, loopDuration * 1000);
    }

    stopBackgroundMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        this.currentMusicNodes.forEach(node => {
            try {
                node.stop();
            } catch (e) {}
        });
        this.currentMusicNodes = [];
    }

    /* =========================================================
       SOUND EFFECTS
    ========================================================= */

    playSpinSound() {
        this.ensureContext();
        if (!this.sfxEnabled || this.isMuted) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playWinSound() {
        this.ensureContext();
        if (!this.sfxEnabled || this.isMuted) return;

        const now = this.audioContext.currentTime;

        // Happy ascending arpeggio
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    playBigWinSound() {
        this.ensureContext();
        if (!this.sfxEnabled || this.isMuted) return;

        const now = this.audioContext.currentTime;

        // More elaborate celebration sound
        for (let i = 0; i < 3; i++) {
            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, j) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'triangle';
                osc.frequency.value = freq;

                const startTime = now + i * 0.4 + j * 0.05;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(startTime);
                osc.stop(startTime + 0.25);
            });
        }
    }

    playButtonClick() {
        this.ensureContext();
        if (!this.sfxEnabled || this.isMuted) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playScatterSound() {
        this.ensureContext();
        if (!this.sfxEnabled || this.isMuted) return;

        const now = this.audioContext.currentTime;

        // Magical twinkling sound
        for (let i = 0; i < 5; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = 800 + i * 200;

            const startTime = now + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
        }
    }

    /* =========================================================
       CONTROLS
    ========================================================= */

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
            if (this.masterGain) {
                this.masterGain.gain.value = 0;
            }
        } else {
            if (this.masterGain) {
                this.masterGain.gain.value = 1;
            }
            if (this.musicEnabled) {
                this.startBackgroundMusic();
            }
        }
        return this.isMuted;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled && !this.isMuted) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        return this.musicEnabled;
    }

    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxEnabled ? 0.5 : 0;
        }
        return this.sfxEnabled;
    }
}

export const audioManager = new AudioManager();
