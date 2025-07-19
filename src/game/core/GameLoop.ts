export class GameLoop {
    private updateCallback: (deltaTime: number) => void;
    private renderCallback: () => void;
    private isRunning: boolean = false;
    private lastFrameTime: number = 0;
    private animationFrameId: number = 0;
    
    // Target 60 FPS
    private readonly targetFPS: number = 60;
    private readonly maxDeltaTime: number = 1000 / this.targetFPS;

    constructor(updateCallback: (deltaTime: number) => void, renderCallback: () => void) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
    }

    start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    stop(): void {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    private gameLoop = (): void => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        let deltaTime = currentTime - this.lastFrameTime;
        
        // Cap delta time to prevent large jumps
        deltaTime = Math.min(deltaTime, this.maxDeltaTime);
        
        // Convert to seconds
        deltaTime = deltaTime / 1000;

        // Update and render
        this.updateCallback(deltaTime);
        this.renderCallback();

        this.lastFrameTime = currentTime;
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };
} 