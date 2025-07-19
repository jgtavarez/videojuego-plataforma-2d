import { AssetManager } from '../core/AssetManager';
import { PhysicsBody } from '../systems/Physics';
import { Level } from '../levels/Level';

export enum EnemyType {
    SLIME = 'slime',
    GOBLIN = 'goblin',
    FLY_BLUE = 'fly_blue',
    FLY_ORANGE = 'fly_orange',
    MUSHROOM = 'mushroom',
    WORM = 'worm',
    BOMBER_GOBLIN = 'bomber_goblin'
}

export enum EnemyState {
    IDLE,
    MOVING,
    ATTACKING,
    DEAD
}

export abstract class Enemy {
    protected x: number;
    protected y: number;
    protected width: number = 32;
    protected height: number = 32;
    protected velocityX: number = 0;
    protected velocityY: number = 0;
    protected health: number = 1;
    protected maxHealth: number = 1;
    protected speed: number = 50;
    protected state: EnemyState = EnemyState.IDLE;
    protected facingRight: boolean = true;
    protected isAliveFlag: boolean = true;
    
    // Animation
    protected currentAnimation: string = '';
    protected animationTime: number = 0;
    protected currentFrame: number = 0;
    
    // Physics
    protected physicsBody: PhysicsBody;
    protected assetManager: AssetManager;
    
    // AI behavior
    protected aiTimer: number = 0;
    protected directionChangeTime: number = 2; // seconds

    constructor(x: number, y: number, assetManager: AssetManager) {
        this.x = x;
        this.y = y;
        this.assetManager = assetManager;
        this.physicsBody = new PhysicsBody(x, y, this.width, this.height);
        this.initialize();
    }

    protected abstract initialize(): void;
    protected abstract updateAI(deltaTime: number, level: Level): void;

    update(deltaTime: number, level: Level): void {
        if (!this.isAliveFlag) return;

        // Update AI behavior
        this.updateAI(deltaTime, level);
        
        // Apply movement
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Update physics body
        this.physicsBody.setPosition(this.x, this.y);
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Update AI timer
        this.aiTimer += deltaTime;
    }

    protected updateAnimation(deltaTime: number): void {
        const animation = this.assetManager.getAnimation(this.currentAnimation);
        if (!animation) return;

        this.animationTime += deltaTime * 1000;
        
        if (this.animationTime >= animation.duration) {
            this.animationTime = 0;
            this.currentFrame = (this.currentFrame + 1) % animation.frameCount;
        }
    }

    protected setAnimation(animationName: string): void {
        if (this.currentAnimation === animationName) return;
        
        this.currentAnimation = animationName;
        this.animationTime = 0;
        this.currentFrame = 0;
    }

    takeDamage(damage: number): void {
        if (!this.isAliveFlag) return;

        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.isAliveFlag = false;
            this.state = EnemyState.DEAD;
            // TODO: Play death sound and animation
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.isAliveFlag) return;

        const animation = this.assetManager.getAnimation(this.currentAnimation);
        
        // Only render if we have a valid animation with frames
        if (!animation || !animation.frames || animation.frames.length === 0) {
            // If assets aren't loaded yet, wait instead of showing fallback
            if (!this.assetManager.isLoaded()) {
                return; // Don't render anything until assets are loaded
            }
            
            // Fallback rendering only if assets are loaded but animation is missing
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        // Ensure we have a valid frame
        if (this.currentFrame >= animation.frames.length) {
            this.currentFrame = 0;
        }

        const frame = animation.frames[this.currentFrame];
        if (!frame) return; // Safety check
        
        ctx.save();
        
        // Render sprite (no flipping for now)
        ctx.drawImage(frame, this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }

    // Getters
    getX(): number { return this.x; }
    getY(): number { return this.y; }
    getWidth(): number { return this.width; }
    getHeight(): number { return this.height; }
    getPhysicsBody(): PhysicsBody { return this.physicsBody; }
    isAlive(): boolean { return this.isAliveFlag; }
    getHealth(): number { return this.health; }

    // Factory method
    static createEnemy(type: string, x: number, y: number, assetManager: AssetManager): Enemy {
        switch (type) {
            case EnemyType.SLIME:
                return new SlimeEnemy(x, y, assetManager);
            case EnemyType.GOBLIN:
                return new GoblinEnemy(x, y, assetManager);
            case EnemyType.FLY_BLUE:
                return new FlyEnemy(x, y, assetManager, true);
            case EnemyType.FLY_ORANGE:
                return new FlyEnemy(x, y, assetManager, false);
            case EnemyType.MUSHROOM:
                return new MushroomEnemy(x, y, assetManager);
            case EnemyType.WORM:
                return new WormEnemy(x, y, assetManager);
            case EnemyType.BOMBER_GOBLIN:
                return new BomberGoblinEnemy(x, y, assetManager);
            default:
                return new SlimeEnemy(x, y, assetManager);
        }
    }
}

// Slime Enemy - Basic ground enemy
export class SlimeEnemy extends Enemy {
    protected initialize(): void {
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 30;
        this.setAnimation('slime_walk');
        this.velocityX = this.speed;
    }

    protected updateAI(_deltaTime: number, _level: Level): void {
        // Simple back and forth movement
        if (this.aiTimer >= this.directionChangeTime) {
            this.velocityX = -this.velocityX;
            this.facingRight = this.velocityX > 0;
            this.aiTimer = 0;
        }
    }
}

// Goblin Enemy - Aggressive ground enemy
export class GoblinEnemy extends Enemy {
    protected initialize(): void {
        this.health = 2;
        this.maxHealth = 2;
        this.speed = 60;
        this.setAnimation('goblin_run');
        this.velocityX = this.speed;
        this.directionChangeTime = 3;
    }

    protected updateAI(_deltaTime: number, _level: Level): void {
        // More aggressive movement pattern
        if (this.aiTimer >= this.directionChangeTime) {
            this.velocityX = -this.velocityX;
            this.facingRight = this.velocityX > 0;
            this.aiTimer = 0;
        }
    }
}

// Fly Enemy - Flying enemy
export class FlyEnemy extends Enemy {
    private isBlue: boolean;
    // private verticalDirection: number = 1;
    private verticalSpeed: number = 40;

    constructor(x: number, y: number, assetManager: AssetManager, isBlue: boolean = true) {
        super(x, y, assetManager);
        this.isBlue = isBlue;
    }

    protected initialize(): void {
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 40;
        this.setAnimation(this.isBlue ? 'blue_fly_flying' : 'orange_fly_flying');
        this.velocityX = this.speed;
        this.directionChangeTime = 2.5;
    }

    protected updateAI(_deltaTime: number, _level: Level): void {
        // Flying movement with vertical bobbing
        if (this.aiTimer >= this.directionChangeTime) {
            this.velocityX = -this.velocityX;
            this.facingRight = this.velocityX > 0;
            this.aiTimer = 0;
        }
        
        // Vertical bobbing motion
        this.velocityY = Math.sin(this.aiTimer * 3) * this.verticalSpeed;
    }
}

// Mushroom Enemy - Slow but sturdy
export class MushroomEnemy extends Enemy {
    protected initialize(): void {
        this.health = 3;
        this.maxHealth = 3;
        this.speed = 20;
        this.setAnimation('mushroom_walk');
        this.velocityX = this.speed;
        this.directionChangeTime = 4;
    }

    protected updateAI(_deltaTime: number, _level: Level): void {
        // Slow, steady movement
        if (this.aiTimer >= this.directionChangeTime) {
            this.velocityX = -this.velocityX;
            this.facingRight = this.velocityX > 0;
            this.aiTimer = 0;
        }
    }
}

// Worm Enemy - Fast ground enemy
export class WormEnemy extends Enemy {
    protected initialize(): void {
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 80;
        this.setAnimation('worm_walk');
        this.velocityX = this.speed;
        this.directionChangeTime = 1.5;
    }

    protected updateAI(_deltaTime: number, _level: Level): void {
        // Fast, erratic movement
        if (this.aiTimer >= this.directionChangeTime) {
            this.velocityX = -this.velocityX;
            this.facingRight = this.velocityX > 0;
            this.aiTimer = 0;
            // Random direction change time for more erratic behavior
            this.directionChangeTime = 1 + Math.random() * 2;
        }
    }
}

// Bomber Goblin - Boss enemy
export class BomberGoblinEnemy extends Enemy {
    private attackTimer: number = 0;
    private attackCooldown: number = 3; // seconds

    protected initialize(): void {
        this.health = 5;
        this.maxHealth = 5;
        this.speed = 40;
        this.width = 40; // Larger boss enemy
        this.height = 40;
        this.setAnimation('goblin_run'); // Use goblin animation for now
        this.velocityX = this.speed;
        this.directionChangeTime = 2;
    }

    protected updateAI(deltaTime: number, _level: Level): void {
        // Boss movement and attack pattern
        if (this.aiTimer >= this.directionChangeTime) {
            this.velocityX = -this.velocityX;
            this.facingRight = this.velocityX > 0;
            this.aiTimer = 0;
        }
        
        // Attack timer (for future bomb throwing implementation)
        this.attackTimer += deltaTime;
        if (this.attackTimer >= this.attackCooldown) {
            // TODO: Implement bomb throwing
            this.attackTimer = 0;
        }
    }
} 