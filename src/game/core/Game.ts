import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';
import { AssetManager } from './AssetManager';
import { LevelManager } from '../levels/LevelManager';
import { AudioManager } from '../systems/AudioManager';
import { Player } from '../entities/Player';
import { HUD } from '../ui/HUD';

export enum GameState {
    MENU,
    PLAYING,
    PAUSED,
    GAME_OVER,
    LOADING
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameLoop: GameLoop;
    private inputManager: InputManager;
    private assetManager: AssetManager;
    private levelManager: LevelManager;
    private audioManager: AudioManager;
    private player: Player;
    private hud: HUD;
    
    private gameState: GameState = GameState.MENU;
    private lives: number = 3;
    private score: number = 0;
    private currentLevel: number = 1;
    
    // Menu elements
    private menuElement!: HTMLElement;
    private gameOverMenuElement!: HTMLElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        // Initialize core systems
        this.inputManager = new InputManager();
        this.assetManager = new AssetManager();
        this.audioManager = new AudioManager();
        this.levelManager = new LevelManager(this.assetManager);
        this.player = new Player(100, 400, this.assetManager);
        this.hud = new HUD();
        
        // Initialize game loop
        this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));
        
        // Get menu elements
        this.menuElement = document.getElementById('menu')!;
        this.gameOverMenuElement = document.getElementById('gameOverMenu')!;
    }

    async init(): Promise<void> {
        this.gameState = GameState.LOADING;
        
        // Load all assets
        await this.assetManager.loadAllAssets();
        
        // Initialize audio system
        this.audioManager.init();
        
        // Initialize levels
        this.levelManager.init();
        
        // Set initial state
        this.gameState = GameState.MENU;
        this.showMainMenu();
    }

    startGame(): void {
        this.gameState = GameState.PLAYING;
        this.hideAllMenus();
        
        // Reset game state
        this.lives = 3;
        this.score = 0;
        this.currentLevel = 1;
        
        // Load first level
        this.levelManager.loadLevel(this.currentLevel);
        this.player.reset(100, 400);
        
        // Start background music
        this.audioManager.playBackgroundMusic();
        
        // Start game loop
        this.gameLoop.start();
    }

    restartGame(): void {
        this.startGame();
    }

    showMainMenu(): void {
        this.gameState = GameState.MENU;
        this.gameLoop.stop();
        this.audioManager.stopAllSounds();
        this.menuElement.classList.remove('hidden');
        this.gameOverMenuElement.classList.add('hidden');
    }

    showGameOverMenu(): void {
        this.gameState = GameState.GAME_OVER;
        this.gameLoop.stop();
        this.audioManager.stopAllSounds();
        this.audioManager.playGameOverSound();
        this.menuElement.classList.add('hidden');
        this.gameOverMenuElement.classList.remove('hidden');
    }

    private hideAllMenus(): void {
        this.menuElement.classList.add('hidden');
        this.gameOverMenuElement.classList.add('hidden');
    }

    private update(deltaTime: number): void {
        if (this.gameState !== GameState.PLAYING) return;

        // Update player
        const currentLevel = this.levelManager.getCurrentLevel();
        if (currentLevel) {
            this.player.update(deltaTime, this.inputManager, currentLevel);
        }
        
        // Update current level and handle collectibles
        const levelUpdate = this.levelManager.update(deltaTime, this.player);
        if (levelUpdate?.scoreValue) {
            this.addScore(levelUpdate.scoreValue);
        }
        
        // Check for player death
        if (this.player.isDead()) {
            this.lives--;
            if (this.lives <= 0) {
                this.showGameOverMenu();
                return;
            } else {
                // Respawn player at level start or checkpoint
                this.player.respawn();
                this.audioManager.playDeathSound();
            }
        }
        
        // Check for level completion
        if (this.levelManager.isLevelComplete()) {
            this.handleLevelComplete();
        }
        
        // Update HUD
        this.hud.update(this.lives, this.score, this.currentLevel);
    }

    private render(): void {
        // Clear canvas completely
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        
        if (this.gameState === GameState.PLAYING) {
            // Render level background
            this.levelManager.renderBackground(this.ctx);
            
            // Render level elements
            this.levelManager.render(this.ctx);
            
            // Render player
            this.player.render(this.ctx);
            
            // Render HUD
            this.hud.render(this.ctx);
        } else if (this.gameState === GameState.LOADING) {
            // Render loading screen
            this.renderLoadingScreen();
        }
    }

    private handleLevelComplete(): void {
        this.currentLevel++;
        
        // Level progression logic
        if (this.currentLevel === 2) {
            // Just completed level 1, go to level 2
            this.levelManager.loadLevel(2);
            this.player.reset(100, 400);
        } else if (this.currentLevel === 3) {
            // Just completed level 2, go to boss level
            this.levelManager.loadLevel(3);
            this.player.reset(100, 400);
            this.audioManager.playBossMusic();
        } else if (this.currentLevel === 4) {
            // Beat the boss, continue with remaining levels
            this.levelManager.loadLevel(4);
            this.player.reset(100, 400);
            this.audioManager.playBackgroundMusic();
        } else if (this.currentLevel > 5) {
            // Game completed!
            this.showGameCompletedMenu();
        } else {
            // Continue to next level
            this.levelManager.loadLevel(this.currentLevel);
            this.player.reset(100, 400);
        }
    }

    private showGameCompletedMenu(): void {
        // TODO: Implement game completion screen
        this.showMainMenu();
    }

    private renderLoadingScreen(): void {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Cargando...', this.canvas.width / 2, this.canvas.height / 2);
    }

    // Public getters for other systems
    public getScore(): number { return this.score; }
    public addScore(points: number): void { this.score += points; }
    public getCurrentLevel(): number { return this.currentLevel; }
    public getAudioManager(): AudioManager { return this.audioManager; }
} 