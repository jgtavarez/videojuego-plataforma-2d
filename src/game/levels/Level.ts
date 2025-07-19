import { AssetManager } from '../core/AssetManager';
import { PhysicsBody } from '../systems/Physics';
import { Enemy } from '../entities/Enemy';
import { Collectible } from '../entities/Collectible';
import { Platform } from '../entities/Platform';

export interface LevelData {
    id: number;
    name: string;
    background: string;
    platforms: Array<{x: number, y: number, width: number, height: number, type: string}>;
    enemies: Array<{x: number, y: number, type: string}>;
    collectibles: Array<{x: number, y: number, type: string}>;
    goal: {x: number, y: number, width: number, height: number};
    spawnPoint: {x: number, y: number};
    width: number;
    height: number;
}

export class Level {
    private data: LevelData;
    private platforms: Platform[] = [];
    private enemies: Enemy[] = [];
    private collectibles: Collectible[] = [];
    private goalZone: PhysicsBody;
    private isCompleted: boolean = false;
    private assetManager: AssetManager;
    
    constructor(data: LevelData, assetManager: AssetManager) {
        this.data = data;
        this.assetManager = assetManager;
        this.goalZone = new PhysicsBody(
            data.goal.x, 
            data.goal.y, 
            data.goal.width, 
            data.goal.height
        );
        this.initializeLevel();
    }

    private initializeLevel(): void {
        // Clear existing entities first
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
        
        // Create platforms
        this.platforms = this.data.platforms.map(platformData => 
            new Platform(
                platformData.x, 
                platformData.y, 
                platformData.width, 
                platformData.height, 
                platformData.type,
                this.assetManager
            )
        );

        // Create enemies
        this.enemies = this.data.enemies.map(enemyData =>
            Enemy.createEnemy(
                enemyData.type,
                enemyData.x,
                enemyData.y,
                this.assetManager
            )
        );

        // Create collectibles
        this.collectibles = this.data.collectibles.map(collectibleData =>
            new Collectible(
                collectibleData.x,
                collectibleData.y,
                collectibleData.type,
                this.assetManager
            )
        );
    }

    update(deltaTime: number): void {
        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isAlive()) {
                enemy.update(deltaTime, this);
                return true;
            }
            return false;
        });

        // Update collectibles
        this.collectibles.forEach(collectible => {
            collectible.update(deltaTime);
        });
    }

    render(ctx: CanvasRenderingContext2D): void {
        // Render platforms
        this.platforms.forEach(platform => platform.render(ctx));
        
        // Render collectibles
        this.collectibles.forEach(collectible => collectible.render(ctx));
        
        // Render enemies
        this.enemies.forEach(enemy => enemy.render(ctx));
        
        // Render goal zone (for debugging)
        if (process.env.NODE_ENV === 'development') {
            ctx.strokeStyle = 'gold';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.goalZone.getX(),
                this.goalZone.getY(),
                this.goalZone.getWidth(),
                this.goalZone.getHeight()
            );
        }
    }

    renderBackground(ctx: CanvasRenderingContext2D): void {
        const bgImage = this.assetManager.getImage(this.data.background);
        if (bgImage) {
            // Scale background to fit the canvas
            ctx.drawImage(bgImage, 0, 0, this.data.width, this.data.height);
        } else {
            // Fallback gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, this.data.height);
            gradient.addColorStop(0, '#87CEEB');  // Sky blue
            gradient.addColorStop(1, '#98FB98');  // Pale green
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.data.width, this.data.height);
        }
    }

    checkGoalReached(playerBody: PhysicsBody): boolean {
        if (this.goalZone.intersects(playerBody)) {
            this.isCompleted = true;
            return true;
        }
        return false;
    }

    collectItem(playerBody: PhysicsBody): Collectible | null {
        for (let i = 0; i < this.collectibles.length; i++) {
            const collectible = this.collectibles[i];
            if (!collectible.isCollected() && collectible.getPhysicsBody().intersects(playerBody)) {
                collectible.collect();
                return collectible;
            }
        }
        return null;
    }

    checkEnemyCollisions(playerBody: PhysicsBody): Enemy[] {
        const collidedEnemies: Enemy[] = [];
        
        this.enemies.forEach(enemy => {
            if (enemy.isAlive() && enemy.getPhysicsBody().intersects(playerBody)) {
                collidedEnemies.push(enemy);
            }
        });
        
        return collidedEnemies;
    }

    checkPlayerAttack(attackBounds: {x: number, y: number, width: number, height: number}): Enemy[] {
        const hitEnemies: Enemy[] = [];
        const attackBody = new PhysicsBody(attackBounds.x, attackBounds.y, attackBounds.width, attackBounds.height);
        
        this.enemies.forEach(enemy => {
            if (enemy.isAlive() && enemy.getPhysicsBody().intersects(attackBody)) {
                hitEnemies.push(enemy);
            }
        });
        
        return hitEnemies;
    }

    // Getters
    getPlatforms(): Platform[] { return this.platforms; }
    getEnemies(): Enemy[] { return this.enemies; }
    getCollectibles(): Collectible[] { return this.collectibles; }
    getSpawnPoint(): {x: number, y: number} { return this.data.spawnPoint; }
    getWidth(): number { return this.data.width; }
    getHeight(): number { return this.data.height; }
    isLevelCompleted(): boolean { return this.isCompleted; }
    getId(): number { return this.data.id; }
    getName(): string { return this.data.name; }

    // Reset level for replay
    reset(): void {
        this.isCompleted = false;
        this.initializeLevel();
    }
} 