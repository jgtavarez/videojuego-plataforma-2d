import { AssetManager } from '../core/AssetManager';
import { Level, LevelData } from './Level';
import { Player } from '../entities/Player';

export class LevelManager {
    private levels: Map<number, LevelData> = new Map();
    private currentLevel: Level | null = null;
    private currentLevelId: number = 1;
    private assetManager: AssetManager;

    constructor(assetManager: AssetManager) {
        this.assetManager = assetManager;
    }

    init(): void {
        this.createLevelData();
    }

    private createLevelData(): void {
        // Level 1: Tutorial/Easy level
        this.levels.set(1, {
            id: 1,
            name: "Forest Start",
            background: "bg_0",
            width: 1024,
            height: 576,
            spawnPoint: { x: 50, y: 400 },
            goal: { x: 900, y: 400, width: 64, height: 64 },
            platforms: [
                { x: 0, y: 500, width: 200, height: 32, type: "ground" },
                { x: 250, y: 450, width: 128, height: 32, type: "stone" },
                { x: 400, y: 400, width: 128, height: 32, type: "wood" },
                { x: 550, y: 350, width: 128, height: 32, type: "stone" },
                { x: 700, y: 450, width: 200, height: 32, type: "ground" },
                { x: 0, y: 532, width: 1024, height: 44, type: "ground" } // Ground floor
            ],
            enemies: [
                { x: 300, y: 418, type: "slime" },
                { x: 500, y: 368, type: "slime" },
                { x: 750, y: 418, type: "mushroom" }
            ],
            collectibles: [
                { x: 180, y: 468, type: "coin" },
                { x: 320, y: 418, type: "coin" },
                { x: 470, y: 368, type: "orb" },
                { x: 620, y: 318, type: "coin" },
                { x: 820, y: 418, type: "health_potion" }
            ]
        });

        // Level 2: Intermediate level with more challenges
        this.levels.set(2, {
            id: 2,
            name: "Cave Depths",
            background: "bg_1",
            width: 1024,
            height: 576,
            spawnPoint: { x: 50, y: 400 },
            goal: { x: 900, y: 300, width: 64, height: 64 },
            platforms: [
                { x: 0, y: 500, width: 150, height: 32, type: "stone" },
                { x: 200, y: 480, width: 100, height: 32, type: "stone" },
                { x: 350, y: 430, width: 100, height: 32, type: "stone" },
                { x: 500, y: 380, width: 100, height: 32, type: "stone" },
                { x: 650, y: 330, width: 150, height: 32, type: "stone" },
                { x: 850, y: 380, width: 174, height: 32, type: "stone" },
                { x: 0, y: 532, width: 1024, height: 44, type: "stone" }
            ],
            enemies: [
                { x: 250, y: 448, type: "goblin" },
                { x: 400, y: 398, type: "fly_blue" },
                { x: 550, y: 348, type: "worm" },
                { x: 700, y: 298, type: "fly_orange" },
                { x: 900, y: 348, type: "slime" }
            ],
            collectibles: [
                { x: 120, y: 468, type: "coin" },
                { x: 250, y: 448, type: "coin" },
                { x: 380, y: 398, type: "orb" },
                { x: 530, y: 348, type: "coin" },
                { x: 680, y: 298, type: "apple" },
                { x: 920, y: 348, type: "health_potion" }
            ]
        });

        // Level 3: Boss level
        this.levels.set(3, {
            id: 3,
            name: "Boss Arena",
            background: "bg_2",
            width: 1024,
            height: 576,
            spawnPoint: { x: 100, y: 400 },
            goal: { x: 900, y: 450, width: 64, height: 64 },
            platforms: [
                { x: 50, y: 500, width: 200, height: 32, type: "stone" },
                { x: 300, y: 450, width: 100, height: 32, type: "stone" },
                { x: 450, y: 400, width: 124, height: 32, type: "stone" },
                { x: 600, y: 450, width: 100, height: 32, type: "stone" },
                { x: 750, y: 500, width: 200, height: 32, type: "stone" },
                { x: 0, y: 532, width: 1024, height: 44, type: "stone" }
            ],
            enemies: [
                { x: 500, y: 368, type: "bomber_goblin" }, // Boss enemy
                { x: 350, y: 418, type: "goblin" },
                { x: 650, y: 418, type: "goblin" },
                { x: 400, y: 300, type: "fly_blue" },
                { x: 600, y: 300, type: "fly_orange" }
            ],
            collectibles: [
                { x: 150, y: 468, type: "health_potion" },
                { x: 350, y: 418, type: "orb" },
                { x: 500, y: 368, type: "meat" },
                { x: 650, y: 418, type: "orb" },
                { x: 850, y: 468, type: "health_potion" }
            ]
        });

        // Level 4: Post-boss level
        this.levels.set(4, {
            id: 4,
            name: "Mountain Path",
            background: "bg_0",
            width: 1024,
            height: 576,
            spawnPoint: { x: 50, y: 450 },
            goal: { x: 900, y: 200, width: 64, height: 64 },
            platforms: [
                { x: 0, y: 500, width: 120, height: 32, type: "ground" },
                { x: 150, y: 470, width: 80, height: 32, type: "wood" },
                { x: 280, y: 420, width: 80, height: 32, type: "stone" },
                { x: 400, y: 370, width: 80, height: 32, type: "wood" },
                { x: 520, y: 320, width: 80, height: 32, type: "stone" },
                { x: 640, y: 270, width: 80, height: 32, type: "wood" },
                { x: 760, y: 220, width: 120, height: 32, type: "ground" },
                { x: 900, y: 270, width: 124, height: 32, type: "stone" },
                { x: 0, y: 532, width: 1024, height: 44, type: "ground" }
            ],
            enemies: [
                { x: 200, y: 438, type: "mushroom" },
                { x: 330, y: 388, type: "slime" },
                { x: 450, y: 338, type: "worm" },
                { x: 570, y: 288, type: "fly_blue" },
                { x: 690, y: 238, type: "goblin" },
                { x: 950, y: 238, type: "slime" }
            ],
            collectibles: [
                { x: 80, y: 468, type: "coin" },
                { x: 180, y: 438, type: "coin" },
                { x: 310, y: 388, type: "orb" },
                { x: 430, y: 338, type: "coin" },
                { x: 550, y: 288, type: "apple" },
                { x: 670, y: 238, type: "coin" },
                { x: 810, y: 188, type: "health_potion" }
            ]
        });

        // Level 5: Final challenging level
        this.levels.set(5, {
            id: 5,
            name: "Ancient Ruins",
            background: "bg_2",
            width: 1024,
            height: 576,
            spawnPoint: { x: 50, y: 400 },
            goal: { x: 450, y: 100, width: 64, height: 64 },
            platforms: [
                { x: 0, y: 500, width: 100, height: 32, type: "stone" },
                { x: 150, y: 450, width: 80, height: 32, type: "stone" },
                { x: 280, y: 400, width: 80, height: 32, type: "stone" },
                { x: 400, y: 350, width: 80, height: 32, type: "stone" },
                { x: 520, y: 300, width: 80, height: 32, type: "stone" },
                { x: 640, y: 250, width: 80, height: 32, type: "stone" },
                { x: 760, y: 200, width: 80, height: 32, type: "stone" },
                { x: 600, y: 150, width: 80, height: 32, type: "stone" },
                { x: 440, y: 120, width: 80, height: 32, type: "stone" },
                { x: 280, y: 170, width: 80, height: 32, type: "stone" },
                { x: 120, y: 220, width: 80, height: 32, type: "stone" },
                { x: 0, y: 532, width: 1024, height: 44, type: "stone" }
            ],
            enemies: [
                { x: 200, y: 418, type: "bomber_goblin" },
                { x: 330, y: 368, type: "goblin" },
                { x: 450, y: 318, type: "worm" },
                { x: 570, y: 268, type: "fly_orange" },
                { x: 690, y: 218, type: "slime" },
                { x: 790, y: 168, type: "mushroom" },
                { x: 530, y: 118, type: "fly_blue" },
                { x: 370, y: 138, type: "goblin" },
                { x: 210, y: 188, type: "worm" },
                { x: 50, y: 188, type: "slime" }
            ],
            collectibles: [
                { x: 70, y: 468, type: "health_potion" },
                { x: 180, y: 418, type: "orb" },
                { x: 310, y: 368, type: "coin" },
                { x: 430, y: 318, type: "meat" },
                { x: 550, y: 268, type: "coin" },
                { x: 670, y: 218, type: "orb" },
                { x: 790, y: 168, type: "coin" },
                { x: 630, y: 118, type: "apple" },
                { x: 470, y: 88, type: "orb" }
            ]
        });
    }

    loadLevel(levelId: number): boolean {
        const levelData = this.levels.get(levelId);
        if (!levelData) {
            console.error(`Level ${levelId} not found`);
            return false;
        }

        this.currentLevel = new Level(levelData, this.assetManager);
        this.currentLevelId = levelId;
        return true;
    }

    update(deltaTime: number, player: Player): { collectedItem?: any, scoreValue?: number } | null {
        if (!this.currentLevel) return null;

        this.currentLevel.update(deltaTime);

        // Check goal reached
        if (this.currentLevel.checkGoalReached(player.getPhysicsBody())) {
            // Level completed - this will be handled by the Game class
        }

        // Check collectible pickup
        const collectedItem = this.currentLevel.collectItem(player.getPhysicsBody());
        if (collectedItem) {
            // Handle item collection based on type
            const scoreValue = collectedItem.getScoreValue();
            // Score will be handled by Game class that calls this manager
            
            switch (collectedItem.getType()) {
                case 'health_potion':
                case 'apple':
                case 'meat':
                    player.heal(1);
                    break;
            }
            
            // Return the collected item so Game class can handle scoring
            return { collectedItem, scoreValue };
        }

        // Check enemy collisions
        const collidedEnemies = this.currentLevel.checkEnemyCollisions(player.getPhysicsBody());
        collidedEnemies.forEach(_enemy => {
            if (!player.isInvulnerable()) {
                player.takeDamage(1);
            }
        });

        // Check player attack
        if (player.isCurrentlyAttacking()) {
            const hitEnemies = this.currentLevel.checkPlayerAttack(player.getAttackBounds());
            hitEnemies.forEach(enemy => {
                enemy.takeDamage(1);
                // TODO: Play hit sound
            });
        }
        
        return null;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.currentLevel) {
            this.currentLevel.render(ctx);
        }
    }

    renderBackground(ctx: CanvasRenderingContext2D): void {
        if (this.currentLevel) {
            this.currentLevel.renderBackground(ctx);
        }
    }

    isLevelComplete(): boolean {
        return this.currentLevel ? this.currentLevel.isLevelCompleted() : false;
    }

    getCurrentLevel(): Level | null {
        return this.currentLevel;
    }

    getCurrentLevelId(): number {
        return this.currentLevelId;
    }

    getPlayerSpawnPoint(): {x: number, y: number} {
        if (this.currentLevel) {
            return this.currentLevel.getSpawnPoint();
        }
        return { x: 100, y: 400 }; // Default spawn point
    }

    resetCurrentLevel(): void {
        if (this.currentLevel) {
            this.currentLevel.reset();
        }
    }
} 