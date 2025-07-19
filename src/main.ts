import { Game } from './game/core/Game';

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    const game = new Game(canvas);
    
    // Setup menu event listeners
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const mainMenuButton = document.getElementById('mainMenuButton');
    
    startButton?.addEventListener('click', () => game.startGame());
    restartButton?.addEventListener('click', () => game.restartGame());
    mainMenuButton?.addEventListener('click', () => game.showMainMenu());
    
    // Start the game initialization
    game.init();
}); 