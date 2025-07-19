export class AudioManager {
    private backgroundMusic: HTMLAudioElement | null = null;
    private bossMusic: HTMLAudioElement | null = null;
    private soundEffects: Map<string, HTMLAudioElement> = new Map();
    private masterVolume: number = 0.7;
    private musicVolume: number = 0.5;
    private sfxVolume: number = 0.8;

    init(): void {
        // Initialize background music
        // TODO: Add actual audio files - these are placeholder paths
        this.loadMusic();
        this.loadSoundEffects();
    }

    private loadMusic(): void {
        // Background music paths (to be added later)
        // this.backgroundMusic = this.createAudio('/sounds/music/background_music.mp3', true);
        // this.bossMusic = this.createAudio('/sounds/music/boss_music.mp3', true);
        
        console.log('Audio: Music files should be added to /public/sounds/music/');
        console.log('- background_music.mp3 (looping background music)');
        console.log('- boss_music.mp3 (boss battle music)');
    }

    private loadSoundEffects(): void {
        // Sound effect paths (to be added later)
        const soundList = [
            'jump',           // '/sounds/sfx/jump.wav'
            'land',           // '/sounds/sfx/land.wav'
            'attack',         // '/sounds/sfx/attack.wav'
            'hit_enemy',      // '/sounds/sfx/hit_enemy.wav'
            'take_damage',    // '/sounds/sfx/take_damage.wav'
            'death',          // '/sounds/sfx/death.wav'
            'coin_collect',   // '/sounds/sfx/coin_collect.wav'
            'orb_collect',    // '/sounds/sfx/orb_collect.wav'
            'potion_drink',   // '/sounds/sfx/potion_drink.wav'
            'enemy_death',    // '/sounds/sfx/enemy_death.wav'
            'explosion',      // '/sounds/sfx/explosion.wav'
            'level_complete', // '/sounds/sfx/level_complete.wav'
            'game_over',      // '/sounds/sfx/game_over.wav'
            'menu_select',    // '/sounds/sfx/menu_select.wav'
            'door_open',      // '/sounds/sfx/door_open.wav'
            'save_point'      // '/sounds/sfx/save_point.wav'
        ];

        console.log('Audio: Sound effect files should be added to /public/sounds/sfx/');
        soundList.forEach(sound => {
            console.log(`- ${sound}.wav`);
            // this.soundEffects.set(sound, this.createAudio(`/sounds/sfx/${sound}.wav`, false));
        });
    }

    private createAudio(src: string, loop: boolean = false): HTMLAudioElement {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.preload = 'auto';
        
        // Handle loading errors gracefully
        audio.addEventListener('error', () => {
            console.warn(`Failed to load audio: ${src}`);
        });
        
        return audio;
    }

    // Music controls
    playBackgroundMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume * this.masterVolume;
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(e => console.warn('Could not play background music:', e));
        }
    }

    playBossMusic(): void {
        this.stopBackgroundMusic();
        if (this.bossMusic) {
            this.bossMusic.volume = this.musicVolume * this.masterVolume;
            this.bossMusic.currentTime = 0;
            this.bossMusic.play().catch(e => console.warn('Could not play boss music:', e));
        }
    }

    stopBackgroundMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    stopBossMusic(): void {
        if (this.bossMusic) {
            this.bossMusic.pause();
        }
    }

    stopAllSounds(): void {
        this.stopBackgroundMusic();
        this.stopBossMusic();
        this.soundEffects.forEach(audio => audio.pause());
    }

    // Sound effects
    playJumpSound(): void {
        this.playSoundEffect('jump');
    }

    playLandSound(): void {
        this.playSoundEffect('land');
    }

    playAttackSound(): void {
        this.playSoundEffect('attack');
    }

    playHitEnemySound(): void {
        this.playSoundEffect('hit_enemy');
    }

    playTakeDamageSound(): void {
        this.playSoundEffect('take_damage');
    }

    playDeathSound(): void {
        this.playSoundEffect('death');
    }

    playCoinCollectSound(): void {
        this.playSoundEffect('coin_collect');
    }

    playOrbCollectSound(): void {
        this.playSoundEffect('orb_collect');
    }

    playPotionDrinkSound(): void {
        this.playSoundEffect('potion_drink');
    }

    playEnemyDeathSound(): void {
        this.playSoundEffect('enemy_death');
    }

    playExplosionSound(): void {
        this.playSoundEffect('explosion');
    }

    playLevelCompleteSound(): void {
        this.playSoundEffect('level_complete');
    }

    playGameOverSound(): void {
        this.playSoundEffect('game_over');
    }

    playMenuSelectSound(): void {
        this.playSoundEffect('menu_select');
    }

    playDoorOpenSound(): void {
        this.playSoundEffect('door_open');
    }

    playSavePointSound(): void {
        this.playSoundEffect('save_point');
    }

    private playSoundEffect(name: string): void {
        const audio = this.soundEffects.get(name);
        if (audio) {
            audio.volume = this.sfxVolume * this.masterVolume;
            audio.currentTime = 0;
            audio.play().catch(e => console.warn(`Could not play sound effect ${name}:`, e));
        }
    }

    // Volume controls
    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume * this.masterVolume;
        }
        if (this.bossMusic) {
            this.bossMusic.volume = this.musicVolume * this.masterVolume;
        }
    }

    setSfxVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
} 