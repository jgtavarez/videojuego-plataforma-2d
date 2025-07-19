export interface SpriteAnimation {
    frames: ImageBitmap[];
    frameCount: number;
    frameWidth: number;
    frameHeight: number;
    duration: number; // Duration per frame in milliseconds
}

export class AssetManager {
    private images: Map<string, HTMLImageElement> = new Map();
    private animations: Map<string, SpriteAnimation> = new Map();
    private loadedCount: number = 0;
    private totalAssets: number = 0;

    async loadAllAssets(): Promise<void> {
        const assetList = this.getAssetList();
        this.totalAssets = assetList.length;
        
        const loadPromises = assetList.map(asset => this.loadImage(asset.name, asset.path));
        await Promise.all(loadPromises);
        
        // Create animations from spritesheets
        await this.createAnimations();
    }

    private getAssetList(): Array<{name: string, path: string}> {
        return [
            // Hero character sprites
            { name: 'hero_spritesheet', path: '/herochar-sprites/herochar_spritesheet(new).png' },
            { name: 'hero_idle', path: '/herochar-sprites/herochar_idle_anim_strip_4.png' },
            { name: 'hero_run', path: '/herochar-sprites/herochar_run_anim_strip_6.png' },
            { name: 'hero_jump_up', path: '/herochar-sprites/herochar_jump_up_anim_strip_3.png' },
            { name: 'hero_jump_down', path: '/herochar-sprites/herochar_jump_down_anim_strip_3.png' },
            { name: 'hero_attack', path: '/herochar-sprites/herochar_attack_anim_strip_4(new).png' },
            { name: 'hero_death', path: '/herochar-sprites/herochar_death_anim_strip_8.png' },
            { name: 'hero_hit', path: '/herochar-sprites/herochar_hit_anim_strip_3.png' },
            
            // Enemy sprites
            { name: 'slime_spritesheet', path: '/enemies-sprites/slime/slime_spritesheet.png' },
            { name: 'slime_walk', path: '/enemies-sprites/slime/slime_walk_anim_strip_15.png' },
            { name: 'slime_idle', path: '/enemies-sprites/slime/slime_idle_anim_strip_5.png' },
            { name: 'slime_death', path: '/enemies-sprites/slime/slime_death_anim_strip_6.png' },
            
            { name: 'goblin_spritesheet', path: '/enemies-sprites/goblin/goblin_spritesheet.png' },
            { name: 'goblin_run', path: '/enemies-sprites/goblin/goblin_run_anim_strip_6.png' },
            { name: 'goblin_attack', path: '/enemies-sprites/goblin/goblin_attack_anim_strip_4.png' },
            { name: 'goblin_death', path: '/enemies-sprites/goblin/goblin_death_anim_strip_6.png' },
            
            { name: 'fly_spritesheet', path: '/enemies-sprites/fly/fly_spritesheet.png' },
            { name: 'blue_fly_flying', path: '/enemies-sprites/fly/blue_fly_idle_or_flying_anim_strip_3.png' },
            { name: 'orange_fly_flying', path: '/enemies-sprites/fly/orange_fly_idle_or_flying_anim_strip_3.png' },
            
            { name: 'bomber_goblin_spritesheet', path: '/enemies-sprites/bomber goblin/goblin_bomber_spritesheet.png' },
            { name: 'mushroom_spritesheet', path: '/enemies-sprites/mushroom/mushroom_spritesheet.png' },
            { name: 'mushroom_walk', path: '/enemies-sprites/mushroom/mushroom_walk_anim_strip_8.png' },
            { name: 'worm_spritesheet', path: '/enemies-sprites/worm/worm_spritesheet.png' },
            { name: 'worm_walk', path: '/enemies-sprites/worm/worm_walk_anim_strip_6.png' },
            
            // Collectibles and objects
            { name: 'coin_anim', path: '/miscellaneous-sprites/coin_anim_strip_6.png' },
            { name: 'orb_anim', path: '/miscellaneous-sprites/orb_anim_strip_6.png' },
            { name: 'health_potion', path: '/miscellaneous-sprites/health_potion.png' },
            { name: 'apple_item', path: '/miscellaneous-sprites/apple_item.png' },
            { name: 'meat_item', path: '/miscellaneous-sprites/meat_item.png' },
            
            // Obstacles and traps
            { name: 'spikes', path: '/miscellaneous-sprites/spikes.png' },
            { name: 'trap_spikes', path: '/miscellaneous-sprites/trap_spikes_anim_strip_7.png' },
            { name: 'bomb_ground', path: '/miscellaneous-sprites/bomb_on_ground_anim_strip_8.png' },
            { name: 'explosion', path: '/miscellaneous-sprites/explosion_anim_strip_10.png' },
            { name: 'suspended_trap', path: '/miscellaneous-sprites/trap_suspended_anim_strip_18.png' },
            
            // Environment
            { name: 'tileset_32', path: '/tiles-and-backgrounds/tileset_32x32(new).png' },
            { name: 'background', path: '/tiles-and-backgrounds/background.png' },
            { name: 'bg_0', path: '/tiles-and-backgrounds/bg_0.png' },
            { name: 'bg_1', path: '/tiles-and-backgrounds/bg_1.png' },
            { name: 'bg_2', path: '/tiles-and-backgrounds/bg_2.png' },
            { name: 'door', path: '/miscellaneous-sprites/door.png' },
            { name: 'save_point', path: '/miscellaneous-sprites/save_point_anim_strip_9.png' },
            
            // HUD elements
            { name: 'hearts_hud', path: '/hud-elements/hearts_hud.png' },
            { name: 'no_hearts_hud', path: '/hud-elements/no_hearts_hud.png' },
            { name: 'coins_hud', path: '/hud-elements/coins_hud.png' },
            { name: 'orbs_hud', path: '/hud-elements/orbs_hud.png' },
            { name: 'fonts', path: '/hud-elements/fonts.png' }
        ];
    }

    private async loadImage(name: string, path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(name, img);
                this.loadedCount++;
                console.log(`✓ Loaded: ${name} (${this.loadedCount}/${this.totalAssets})`);
                resolve();
            };
            img.onerror = () => {
                console.warn(`✗ Failed to load image: ${path}`);
                this.loadedCount++; // Still count it to prevent hanging
                resolve(); // Don't reject, just continue
            };
            img.src = path;
        });
    }

    private async createAnimations(): Promise<void> {
        // Define animation configurations
        const animConfigs = [
            { name: 'hero_idle', spriteSheet: 'hero_idle', frameCount: 4, frameWidth: 32, frameHeight: 32, duration: 200 },
            { name: 'hero_run', spriteSheet: 'hero_run', frameCount: 6, frameWidth: 32, frameHeight: 32, duration: 100 },
            { name: 'hero_jump_up', spriteSheet: 'hero_jump_up', frameCount: 3, frameWidth: 32, frameHeight: 32, duration: 150 },
            { name: 'hero_jump_down', spriteSheet: 'hero_jump_down', frameCount: 3, frameWidth: 32, frameHeight: 32, duration: 150 },
            { name: 'hero_attack', spriteSheet: 'hero_attack', frameCount: 4, frameWidth: 32, frameHeight: 32, duration: 100 },
            { name: 'hero_death', spriteSheet: 'hero_death', frameCount: 8, frameWidth: 32, frameHeight: 32, duration: 150 },
            { name: 'hero_hit', spriteSheet: 'hero_hit', frameCount: 3, frameWidth: 32, frameHeight: 32, duration: 100 },
            
            { name: 'slime_walk', spriteSheet: 'slime_walk', frameCount: 15, frameWidth: 32, frameHeight: 32, duration: 80 },
            { name: 'slime_idle', spriteSheet: 'slime_idle', frameCount: 5, frameWidth: 32, frameHeight: 32, duration: 200 },
            { name: 'slime_death', spriteSheet: 'slime_death', frameCount: 6, frameWidth: 32, frameHeight: 32, duration: 150 },
            
            { name: 'goblin_run', spriteSheet: 'goblin_run', frameCount: 6, frameWidth: 32, frameHeight: 32, duration: 120 },
            { name: 'goblin_attack', spriteSheet: 'goblin_attack', frameCount: 4, frameWidth: 32, frameHeight: 32, duration: 150 },
            { name: 'goblin_death', spriteSheet: 'goblin_death', frameCount: 6, frameWidth: 32, frameHeight: 32, duration: 150 },
            
            { name: 'blue_fly_flying', spriteSheet: 'blue_fly_flying', frameCount: 3, frameWidth: 32, frameHeight: 32, duration: 150 },
            { name: 'orange_fly_flying', spriteSheet: 'orange_fly_flying', frameCount: 3, frameWidth: 32, frameHeight: 32, duration: 150 },
            
            { name: 'mushroom_walk', spriteSheet: 'mushroom_walk', frameCount: 8, frameWidth: 32, frameHeight: 32, duration: 120 },
            { name: 'worm_walk', spriteSheet: 'worm_walk', frameCount: 6, frameWidth: 32, frameHeight: 32, duration: 150 },
            
            { name: 'coin_anim', spriteSheet: 'coin_anim', frameCount: 6, frameWidth: 16, frameHeight: 16, duration: 100 },
            { name: 'orb_anim', spriteSheet: 'orb_anim', frameCount: 6, frameWidth: 16, frameHeight: 16, duration: 120 },
            { name: 'trap_spikes', spriteSheet: 'trap_spikes', frameCount: 7, frameWidth: 32, frameHeight: 32, duration: 100 },
            { name: 'bomb_ground', spriteSheet: 'bomb_ground', frameCount: 8, frameWidth: 32, frameHeight: 32, duration: 150 },
            { name: 'explosion', spriteSheet: 'explosion', frameCount: 10, frameWidth: 64, frameHeight: 64, duration: 80 },
            { name: 'suspended_trap', spriteSheet: 'suspended_trap', frameCount: 18, frameWidth: 32, frameHeight: 64, duration: 100 },
            { name: 'save_point', spriteSheet: 'save_point', frameCount: 9, frameWidth: 32, frameHeight: 32, duration: 120 }
        ];

        for (const config of animConfigs) {
            await this.createAnimation(config);
        }
    }

    private async createAnimation(config: any): Promise<void> {
        const img = this.images.get(config.spriteSheet);
        if (!img) return;

        const frames: ImageBitmap[] = [];
        
        for (let i = 0; i < config.frameCount; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = config.frameWidth;
            canvas.height = config.frameHeight;
            const ctx = canvas.getContext('2d')!;
            
            ctx.drawImage(
                img,
                i * config.frameWidth, 0,
                config.frameWidth, config.frameHeight,
                0, 0,
                config.frameWidth, config.frameHeight
            );
            
            const bitmap = await createImageBitmap(canvas);
            frames.push(bitmap);
        }

        this.animations.set(config.name, {
            frames,
            frameCount: config.frameCount,
            frameWidth: config.frameWidth,
            frameHeight: config.frameHeight,
            duration: config.duration
        });
    }

    public getImage(name: string): HTMLImageElement | undefined {
        return this.images.get(name);
    }

    public getAnimation(name: string): SpriteAnimation | undefined {
        return this.animations.get(name);
    }

    public getLoadProgress(): number {
        return this.totalAssets > 0 ? this.loadedCount / this.totalAssets : 0;
    }

    public isLoaded(): boolean {
        return this.loadedCount === this.totalAssets;
    }
} 