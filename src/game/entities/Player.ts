import { AssetManager, SpriteAnimation } from '../core/AssetManager';
import { InputManager, InputState } from '../core/InputManager';
import { Level } from '../levels/Level';
import { PhysicsBody } from '../systems/Physics';

export enum PlayerState {
    IDLE,
    RUNNING,
    JUMPING,
    FALLING,
    ATTACKING,
    HIT,
    DEAD
}

export class Player {
    private x: number;
    private y: number;
    private width: number = 32;
    private height: number = 32;
    private velocityX: number = 0;
    private velocityY: number = 0;
    private speed: number = 200; // pixels per second
    private jumpPower: number = 400;
    private gravity: number = 1200;
    private health: number = 3;
    private maxHealth: number = 3;
    private isOnGround: boolean = false;
    private facingRight: boolean = true;
    private state: PlayerState = PlayerState.IDLE;
    private invulnerable: boolean = false;
    private invulnerabilityTime: number = 0;
    private maxInvulnerabilityTime: number = 1.5; // seconds
    
    // Hit state management
    private hitTime: number = 0;
    private maxHitTime: number = 0.3; // seconds - how long the hit state lasts
    
    // Animation
    private currentAnimation: string = 'hero_idle';
    private animationTime: number = 0;
    private currentFrame: number = 0;
    private isAttacking: boolean = false;
    private attackTime: number = 0;
    private attackDuration: number = 0.4; // seconds
    
    // Physics body for collision detection
    private physicsBody: PhysicsBody;
    
    // Starting position for respawn
    private spawnX: number;
    private spawnY: number;

    constructor(x: number, y: number, private assetManager: AssetManager) {
        this.x = x;
        this.y = y;
        this.spawnX = x;
        this.spawnY = y;
        
        this.physicsBody = new PhysicsBody(x, y, this.width, this.height);
    }

    update(deltaTime: number, inputManager: InputManager, level: Level): void {
        if (this.state === PlayerState.DEAD) return;

        const input = inputManager.getInputState();
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update hit state
        if (this.state === PlayerState.HIT) {
            this.hitTime -= deltaTime;
            if (this.hitTime <= 0) {
                this.setState(PlayerState.IDLE);
            }
        }
        
        // Update attack state
        if (this.isAttacking) {
            this.attackTime -= deltaTime;
            if (this.attackTime <= 0) {
                this.isAttacking = false;
                this.state = PlayerState.IDLE;
            }
        }

        // Handle input and movement
        this.handleInput(input, deltaTime);
        
        // Apply physics
        this.applyPhysics(deltaTime);
        
        // Update position
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Update physics body
        this.physicsBody.setPosition(this.x, this.y);
        
        // Check collisions with level
        this.handleLevelCollisions(level);
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Check if player fell off the level
        if (this.y > level.getHeight() + 100) {
            this.takeDamage(this.health); // Instant death
        }
    }

    private handleInput(input: InputState, deltaTime: number): void {
        if (this.isAttacking) return;
        
        // Allow some movement during hit state, but with reduced control
        const movementMultiplier = this.state === PlayerState.HIT ? 0.3 : 1.0;

        // Horizontal movement
        if (input.left) {
            this.velocityX = -this.speed * movementMultiplier;
            this.facingRight = false;
            if (this.isOnGround && this.state !== PlayerState.HIT) {
                this.setState(PlayerState.RUNNING);
            }
        } else if (input.right) {
            this.velocityX = this.speed * movementMultiplier;
            this.facingRight = true;
            if (this.isOnGround && this.state !== PlayerState.HIT) {
                this.setState(PlayerState.RUNNING);
            }
        } else {
            // Only stop horizontal movement if not in hit state (allow knockback to continue)
            if (this.state !== PlayerState.HIT) {
                this.velocityX = 0;
                if (this.isOnGround && this.state !== PlayerState.ATTACKING) {
                    this.setState(PlayerState.IDLE);
                }
            }
        }

        // Jumping (allow jumping even during hit state to recover)
        if (input.jump && this.isOnGround && this.state !== PlayerState.ATTACKING) {
            this.velocityY = -this.jumpPower;
            this.isOnGround = false;
            this.setState(PlayerState.JUMPING);
            // TODO: Play jump sound
        }

        // Attacking (disable attacking during hit state)
        if (input.attack && !this.isAttacking && this.isOnGround && this.state !== PlayerState.HIT) {
            this.attack();
        }
    }

    private applyPhysics(deltaTime: number): void {
        // Apply gravity
        if (!this.isOnGround) {
            this.velocityY += this.gravity * deltaTime;
            
            // Update jump/fall state
            if (this.velocityY > 0 && this.state === PlayerState.JUMPING) {
                this.setState(PlayerState.FALLING);
            }
        }
        
        // Terminal velocity
        if (this.velocityY > 600) {
            this.velocityY = 600;
        }
    }

    private handleLevelCollisions(level: Level): void {
        // Reset ground state
        this.isOnGround = false;
        
        // Check collision with platforms
        const platforms = level.getPlatforms();
        
        for (const platform of platforms) {
            if (this.physicsBody.intersects(platform.getPhysicsBody())) {
                const overlap = this.physicsBody.getOverlap(platform.getPhysicsBody());
                
                // Determine collision direction and resolve
                if (overlap.y > overlap.x) {
                    // Horizontal collision
                    if (this.x < platform.getX()) {
                        // Hit from left
                        this.x = platform.getX() - this.width;
                        this.velocityX = 0;
                    } else {
                        // Hit from right
                        this.x = platform.getX() + platform.getWidth();
                        this.velocityX = 0;
                    }
                } else {
                    // Vertical collision
                    if (this.y < platform.getY()) {
                        // Landing on top
                        this.y = platform.getY() - this.height;
                        this.velocityY = 0;
                        this.isOnGround = true;
                        
                        if (this.state === PlayerState.FALLING) {
                            this.setState(PlayerState.IDLE);
                            // TODO: Play land sound
                        }
                    } else {
                        // Hit from below
                        this.y = platform.getY() + platform.getHeight();
                        this.velocityY = 0;
                    }
                }
                
                // Update physics body position
                this.physicsBody.setPosition(this.x, this.y);
            }
        }
    }

    private attack(): void {
        this.isAttacking = true;
        this.attackTime = this.attackDuration;
        this.setState(PlayerState.ATTACKING);
        // TODO: Play attack sound
        
        // Check for enemies in attack range
        // This will be handled by the level manager
    }

    private setState(newState: PlayerState): void {
        if (this.state === newState) return;
        
        this.state = newState;
        
        // Set appropriate animation
        switch (newState) {
            case PlayerState.IDLE:
                this.setAnimation('hero_idle');
                break;
            case PlayerState.RUNNING:
                this.setAnimation('hero_run');
                break;
            case PlayerState.JUMPING:
                this.setAnimation('hero_jump_up');
                break;
            case PlayerState.FALLING:
                this.setAnimation('hero_jump_down');
                break;
            case PlayerState.ATTACKING:
                this.setAnimation('hero_attack');
                break;
            case PlayerState.HIT:
                this.setAnimation('hero_hit');
                break;
            case PlayerState.DEAD:
                this.setAnimation('hero_death');
                break;
        }
    }

    private setAnimation(animationName: string): void {
        if (this.currentAnimation === animationName) return;
        
        this.currentAnimation = animationName;
        this.animationTime = 0;
        this.currentFrame = 0;
    }

    private updateAnimation(deltaTime: number): void {
        const animation = this.assetManager.getAnimation(this.currentAnimation);
        if (!animation) return;

        this.animationTime += deltaTime * 1000; // Convert to milliseconds
        
        if (this.animationTime >= animation.duration) {
            this.animationTime = 0;
            this.currentFrame = (this.currentFrame + 1) % animation.frameCount;
        }
    }

    takeDamage(damage: number): void {
        if (this.invulnerable || this.state === PlayerState.DEAD) return;

        this.health -= damage;
        // TODO: Play take damage sound
        
        if (this.health <= 0) {
            this.health = 0;
            this.setState(PlayerState.DEAD);
            // TODO: Play death sound
        } else {
            this.setState(PlayerState.HIT);
            this.invulnerable = true;
            this.invulnerabilityTime = this.maxInvulnerabilityTime;
            this.hitTime = this.maxHitTime;
            
            // Reduced knockback for better control
            this.velocityY = -150;
            this.velocityX = this.facingRight ? -80 : 80;
        }
    }

    heal(amount: number): void {
        this.health = Math.min(this.maxHealth, this.health + amount);
        // TODO: Play heal sound
    }

    render(ctx: CanvasRenderingContext2D): void {
        const animation = this.assetManager.getAnimation(this.currentAnimation);
        
        // Only render if we have a valid animation with frames
        if (!animation || !animation.frames || animation.frames.length === 0) {
            // If assets aren't loaded yet, wait instead of showing fallback
            if (!this.assetManager.isLoaded()) {
                return; // Don't render anything until assets are loaded
            }
            
            // Fallback: draw a simple rectangle only if assets are loaded but animation is missing
            ctx.fillStyle = this.invulnerable ? 'rgba(255, 0, 0, 0.5)' : '#00AA00';
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
        
        // Apply invulnerability flashing effect
        if (this.invulnerable) {
            ctx.globalAlpha = Math.sin(this.invulnerabilityTime * 10) > 0 ? 1 : 0.3;
        }
        
        // Render sprite (no flipping for now)
        ctx.drawImage(frame, this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }

    // Getters
    getX(): number { return this.x; }
    getY(): number { return this.y; }
    getWidth(): number { return this.width; }
    getHeight(): number { return this.height; }
    getHealth(): number { return this.health; }
    getMaxHealth(): number { return this.maxHealth; }
    isAlive(): boolean { return this.health > 0; }
    isDead(): boolean { return this.state === PlayerState.DEAD; }
    isInvulnerable(): boolean { return this.invulnerable; }
    getPhysicsBody(): PhysicsBody { return this.physicsBody; }
    isFacingRight(): boolean { return this.facingRight; }
    isCurrentlyAttacking(): boolean { return this.isAttacking; }
    getState(): PlayerState { return this.state; }

    // Attack range for enemy collision detection
    getAttackBounds(): {x: number, y: number, width: number, height: number} {
        const attackWidth = 40;
        const attackHeight = 32;
        
        return {
            x: this.facingRight ? this.x + this.width : this.x - attackWidth,
            y: this.y,
            width: attackWidth,
            height: attackHeight
        };
    }

    reset(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.spawnX = x;
        this.spawnY = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = this.maxHealth;
        this.isOnGround = false;
        this.facingRight = true;
        this.state = PlayerState.IDLE;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.isAttacking = false;
        this.attackTime = 0;
        this.hitTime = 0;
        this.setAnimation('hero_idle');
        this.physicsBody.setPosition(x, y);
    }

    respawn(): void {
        this.reset(this.spawnX, this.spawnY);
    }
} 