export interface InputState {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    attack: boolean;
}

export class InputManager {
    private keys: Set<string> = new Set();
    private inputState: InputState = {
        left: false,
        right: false,
        up: false,
        down: false,
        jump: false,
        attack: false
    };

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Prevent context menu on right click during game
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    private handleKeyDown(event: KeyboardEvent): void {
        this.keys.add(event.code);
        this.updateInputState();
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.keys.delete(event.code);
        this.updateInputState();
    }

    private updateInputState(): void {
        // Movement keys
        this.inputState.left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
        this.inputState.right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
        this.inputState.up = this.keys.has('KeyW') || this.keys.has('ArrowUp');
        this.inputState.down = this.keys.has('KeyS') || this.keys.has('ArrowDown');
        
        // Action keys
        this.inputState.jump = this.keys.has('Space') || this.keys.has('KeyW') || this.keys.has('ArrowUp');
        this.inputState.attack = this.keys.has('KeyX') || this.keys.has('KeyZ');
    }

    public getInputState(): InputState {
        return { ...this.inputState };
    }

    public isKeyPressed(key: string): boolean {
        return this.keys.has(key);
    }

    // For one-time key press detection (useful for menus)
    public wasKeyJustPressed(key: string): boolean {
        // This would need additional logic to track "just pressed" state
        // For now, just return if key is currently pressed
        return this.keys.has(key);
    }
} 