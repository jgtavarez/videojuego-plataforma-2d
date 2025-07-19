export class HUD {
    private lives: number = 3;
    private score: number = 0;
    private level: number = 1;
    // private canvas: HTMLCanvasElement | null = null;
    
    // HUD layout constants
    private readonly MARGIN = 20;
    private readonly HEART_SIZE = 24;
    private readonly HEART_SPACING = 28;
    private readonly FONT_SIZE = 18;
    private readonly FONT_FAMILY = 'Courier New, monospace';

    constructor() {
        // HUD will be drawn on the game canvas
    }

    update(lives: number, score: number, level: number): void {
        this.lives = lives;
        this.score = score;
        this.level = level;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Set font for text rendering
        ctx.font = `${this.FONT_SIZE}px ${this.FONT_FAMILY}`;
        ctx.textAlign = 'left';
        
        // Render lives/hearts
        this.renderLives(ctx);
        
        // Render score
        this.renderScore(ctx);
        
        // Render level info
        this.renderLevel(ctx);
        
        ctx.restore();
    }

    private renderLives(ctx: CanvasRenderingContext2D): void {
        const heartY = this.MARGIN;
        
        // Draw hearts for remaining lives
        for (let i = 0; i < 3; i++) {
            const heartX = this.MARGIN + (i * this.HEART_SPACING);
            
            if (i < this.lives) {
                // Draw filled heart
                this.drawHeart(ctx, heartX, heartY, '#FF1493', true);
            } else {
                // Draw empty heart
                this.drawHeart(ctx, heartX, heartY, '#666666', false);
            }
        }
    }

    private drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, filled: boolean): void {
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Simple heart shape using paths
        ctx.beginPath();
        const heartSize = this.HEART_SIZE * 0.8;
        
        // Create a simple heart shape
        ctx.moveTo(x + heartSize/2, y + heartSize/4);
        ctx.bezierCurveTo(x, y, x, y + heartSize/2, x + heartSize/4, y + heartSize/2);
        ctx.bezierCurveTo(x + heartSize/2, y + heartSize/4, x + heartSize/2, y + heartSize/4, x + heartSize/2, y + heartSize);
        ctx.bezierCurveTo(x + heartSize/2, y + heartSize/4, x + heartSize/2, y + heartSize/4, x + 3*heartSize/4, y + heartSize/2);
        ctx.bezierCurveTo(x + heartSize, y + heartSize/2, x + heartSize, y, x + heartSize/2, y + heartSize/4);
        
        if (filled) {
            ctx.fill();
        }
        ctx.stroke();
        
        ctx.restore();
    }

    private renderScore(ctx: CanvasRenderingContext2D): void {
        const scoreText = `Score: ${this.score.toLocaleString()}`;
        const scoreX = ctx.canvas.width - this.MARGIN;
        const scoreY = this.MARGIN + this.FONT_SIZE;
        
        ctx.textAlign = 'right';
        
        // Draw text shadow
        ctx.fillStyle = '#000000';
        ctx.fillText(scoreText, scoreX + 2, scoreY + 2);
        
        // Draw main text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(scoreText, scoreX, scoreY);
    }

    private renderLevel(ctx: CanvasRenderingContext2D): void {
        const levelText = `Level ${this.level}`;
        const levelX = ctx.canvas.width / 2;
        const levelY = this.MARGIN + this.FONT_SIZE;
        
        ctx.textAlign = 'center';
        
        // Draw text shadow
        ctx.fillStyle = '#000000';
        ctx.fillText(levelText, levelX + 2, levelY + 2);
        
        // Draw main text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(levelText, levelX, levelY);
    }

    // Additional HUD elements for special situations
    renderLevelComplete(ctx: CanvasRenderingContext2D): void {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        
        ctx.save();
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Level complete text
        ctx.font = `36px ${this.FONT_FAMILY}`;
        ctx.textAlign = 'center';
        
        // Text shadow
        ctx.fillStyle = '#000000';
        ctx.fillText('LEVEL COMPLETE!', centerX + 3, centerY + 3);
        
        // Main text
        ctx.fillStyle = '#00FF00';
        ctx.fillText('LEVEL COMPLETE!', centerX, centerY);
        
        ctx.restore();
    }

    renderBossWarning(ctx: CanvasRenderingContext2D): void {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 3;
        
        ctx.save();
        
        // Warning text
        ctx.font = `32px ${this.FONT_FAMILY}`;
        ctx.textAlign = 'center';
        
        // Flashing effect
        const alpha = Math.sin(Date.now() * 0.01) > 0 ? 1 : 0.5;
        
        // Text shadow
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillText('BOSS BATTLE!', centerX + 3, centerY + 3);
        
        // Main text
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.fillText('BOSS BATTLE!', centerX, centerY);
        
        ctx.restore();
    }

    renderPaused(ctx: CanvasRenderingContext2D): void {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        
        ctx.save();
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Paused text
        ctx.font = `48px ${this.FONT_FAMILY}`;
        ctx.textAlign = 'center';
        
        // Text shadow
        ctx.fillStyle = '#000000';
        ctx.fillText('PAUSED', centerX + 3, centerY + 3);
        
        // Main text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('PAUSED', centerX, centerY);
        
        // Instructions
        ctx.font = `18px ${this.FONT_FAMILY}`;
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText('Press ESC to resume', centerX, centerY + 50);
        
        ctx.restore();
    }

    // Debug information (for development)
    renderDebugInfo(ctx: CanvasRenderingContext2D, debugData: any): void {
        if (process.env.NODE_ENV !== 'development') return;
        
        ctx.save();
        
        ctx.font = `12px ${this.FONT_FAMILY}`;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#00FF00';
        
        const debugLines = [
            `FPS: ${debugData.fps || 'N/A'}`,
            `Player X: ${debugData.playerX || 'N/A'}`,
            `Player Y: ${debugData.playerY || 'N/A'}`,
            `Enemies: ${debugData.enemyCount || 'N/A'}`,
            `Collectibles: ${debugData.collectibleCount || 'N/A'}`
        ];
        
        debugLines.forEach((line, index) => {
            ctx.fillText(line, 10, ctx.canvas.height - 80 + (index * 15));
        });
        
        ctx.restore();
    }
} 