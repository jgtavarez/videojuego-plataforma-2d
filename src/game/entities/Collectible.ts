import { AssetManager } from '../core/AssetManager';
import { PhysicsBody } from '../systems/Physics';

export enum CollectibleType {
    COIN = 'coin',
    ORB = 'orb',
    HEALTH_POTION = 'health_potion',
    APPLE = 'apple',
    MEAT = 'meat'
}

export class Collectible {
    private x: number;
    private y: number;
    private width: number = 16;
    private height: number = 16;
    private type: CollectibleType;
    private isCollectedFlag: boolean = false;
    private physicsBody: PhysicsBody;
    private assetManager: AssetManager;
    
    // Animation
    private currentAnimation: string = '';
    private animationTime: number = 0;
    private currentFrame: number = 0;
    
    // Floating animation
    private floatOffset: number = 0;
    private floatSpeed: number = 2;
    private floatRange: number = 5;
    private originalY: number;

    constructor(x: number, y: number, type: string, assetManager: AssetManager) {
        this.x = x;
        this.y = y;
        this.originalY = y;
        this.type = type as CollectibleType;
        this.assetManager = assetManager;
        
        // Set size based on type
        this.setSizeByType();
        
        this.physicsBody = new PhysicsBody(x, y, this.width, this.height);
        this.setAnimation();
    }

    private setSizeByType(): void {
        switch (this.type) {
            case CollectibleType.COIN:
            case CollectibleType.ORB:
                this.width = 16;
                this.height = 16;
                break;
            case CollectibleType.HEALTH_POTION:
            case CollectibleType.APPLE:
            case CollectibleType.MEAT:
                this.width = 20;
                this.height = 20;
                break;
        }
    }

    private setAnimation(): void {
        switch (this.type) {
            case CollectibleType.COIN:
                this.currentAnimation = 'coin_anim';
                break;
            case CollectibleType.ORB:
                this.currentAnimation = 'orb_anim';
                break;
            case CollectibleType.HEALTH_POTION:
                this.currentAnimation = 'health_potion';
                break;
            case CollectibleType.APPLE:
                this.currentAnimation = 'apple_item';
                break;
            case CollectibleType.MEAT:
                this.currentAnimation = 'meat_item';
                break;
        }
    }

    update(deltaTime: number): void {
        if (this.isCollectedFlag) return;

        // Update floating animation
        this.floatOffset += this.floatSpeed * deltaTime;
        this.y = this.originalY + Math.sin(this.floatOffset) * this.floatRange;
        
        // Update physics body position
        this.physicsBody.setPosition(this.x, this.y);
        
        // Update animation for animated collectibles
        if (this.type === CollectibleType.COIN || this.type === CollectibleType.ORB) {
            this.updateAnimation(deltaTime);
        }
    }

    private updateAnimation(deltaTime: number): void {
        const animation = this.assetManager.getAnimation(this.currentAnimation);
        if (!animation) return;

        this.animationTime += deltaTime * 1000;
        
        if (this.animationTime >= animation.duration) {
            this.animationTime = 0;
            this.currentFrame = (this.currentFrame + 1) % animation.frameCount;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.isCollectedFlag) return;

        // Check if we should use animation or static image
        if (this.type === CollectibleType.COIN || this.type === CollectibleType.ORB) {
            this.renderAnimated(ctx);
        } else {
            this.renderStatic(ctx);
        }
    }

    private renderAnimated(ctx: CanvasRenderingContext2D): void {
        const animation = this.assetManager.getAnimation(this.currentAnimation);
        if (animation && animation.frames && animation.frames.length > 0) {
            // Ensure we have a valid frame
            if (this.currentFrame >= animation.frames.length) {
                this.currentFrame = 0;
            }
            
            const frame = animation.frames[this.currentFrame];
            if (frame) {
                ctx.drawImage(frame, this.x, this.y, this.width, this.height);
                return;
            }
        }
        
        // Only show fallback if assets are loaded but animation is missing
        if (this.assetManager.isLoaded()) {
            this.renderFallback(ctx);
        }
    }

    private renderStatic(ctx: CanvasRenderingContext2D): void {
        const image = this.assetManager.getImage(this.currentAnimation);
        if (image && image.complete) {
            ctx.drawImage(image, this.x, this.y, this.width, this.height);
        } else if (this.assetManager.isLoaded()) {
            // Only show fallback if assets are loaded but image is missing
            this.renderFallback(ctx);
        }
    }

    private renderFallback(ctx: CanvasRenderingContext2D): void {
        let color = '#FFD700'; // Gold default
        
        switch (this.type) {
            case CollectibleType.COIN:
                color = '#FFD700'; // Gold
                break;
            case CollectibleType.ORB:
                color = '#00BFFF'; // Deep sky blue
                break;
            case CollectibleType.HEALTH_POTION:
                color = '#FF1493'; // Deep pink
                break;
            case CollectibleType.APPLE:
                color = '#FF0000'; // Red
                break;
            case CollectibleType.MEAT:
                color = '#8B4513'; // Saddle brown
                break;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a white outline for visibility
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    collect(): void {
        this.isCollectedFlag = true;
        // TODO: Play collection sound
        // TODO: Play collection effect animation
    }

    // Getters
    getX(): number { return this.x; }
    getY(): number { return this.y; }
    getWidth(): number { return this.width; }
    getHeight(): number { return this.height; }
    getType(): CollectibleType { return this.type; }
    isCollected(): boolean { return this.isCollectedFlag; }
    getPhysicsBody(): PhysicsBody { return this.physicsBody; }

    // Get score value for different collectible types
    getScoreValue(): number {
        switch (this.type) {
            case CollectibleType.COIN:
                return 100;
            case CollectibleType.ORB:
                return 250;
            case CollectibleType.HEALTH_POTION:
            case CollectibleType.APPLE:
            case CollectibleType.MEAT:
                return 50; // Health items give small score bonus
            default:
                return 0;
        }
    }
} 