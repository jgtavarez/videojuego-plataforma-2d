import { AssetManager } from '../core/AssetManager';
import { PhysicsBody } from '../systems/Physics';

export class Platform {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private type: string;
    private physicsBody: PhysicsBody;
    private assetManager: AssetManager;
    
    // Tile size for tileset rendering
    private readonly TILE_SIZE = 32;

    constructor(x: number, y: number, width: number, height: number, type: string, assetManager: AssetManager) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.assetManager = assetManager;
        this.physicsBody = new PhysicsBody(x, y, width, height);
    }

    render(ctx: CanvasRenderingContext2D): void {
        const tileset = this.assetManager.getImage('tileset_32');
        
        if (tileset) {
            this.renderTiledPlatform(ctx, tileset);
        } else {
            this.renderFallbackPlatform(ctx);
        }
    }

    private renderTiledPlatform(ctx: CanvasRenderingContext2D, tileset: HTMLImageElement): void {
        // Calculate how many tiles we need
        const tilesX = Math.ceil(this.width / this.TILE_SIZE);
        const tilesY = Math.ceil(this.height / this.TILE_SIZE);
        
        // Different tile types based on platform type
        let tileSourceX = 0;
        let tileSourceY = 0;
        
        switch (this.type) {
            case 'ground':
                tileSourceX = 0;
                tileSourceY = 0;
                break;
            case 'stone':
                tileSourceX = 32;
                tileSourceY = 0;
                break;
            case 'wood':
                tileSourceX = 64;
                tileSourceY = 0;
                break;
            default:
                tileSourceX = 0;
                tileSourceY = 0;
        }

        for (let x = 0; x < tilesX; x++) {
            for (let y = 0; y < tilesY; y++) {
                const destX = this.x + (x * this.TILE_SIZE);
                const destY = this.y + (y * this.TILE_SIZE);
                
                // Calculate the actual size to draw (in case of partial tiles)
                const drawWidth = Math.min(this.TILE_SIZE, this.width - (x * this.TILE_SIZE));
                const drawHeight = Math.min(this.TILE_SIZE, this.height - (y * this.TILE_SIZE));
                
                ctx.drawImage(
                    tileset,
                    tileSourceX, tileSourceY, drawWidth, drawHeight,
                    destX, destY, drawWidth, drawHeight
                );
            }
        }
    }

    private renderFallbackPlatform(ctx: CanvasRenderingContext2D): void {
        // Fallback rendering with solid colors
        let color = '#8B4513'; // Brown default
        
        switch (this.type) {
            case 'ground':
                color = '#654321';
                break;
            case 'stone':
                color = '#696969';
                break;
            case 'wood':
                color = '#8B4513';
                break;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a border for better visibility
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    // Getters
    getX(): number { return this.x; }
    getY(): number { return this.y; }
    getWidth(): number { return this.width; }
    getHeight(): number { return this.height; }
    getType(): string { return this.type; }
    getPhysicsBody(): PhysicsBody { return this.physicsBody; }
} 