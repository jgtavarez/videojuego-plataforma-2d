export class PhysicsBody {
    constructor(
        private x: number,
        private y: number,
        private width: number,
        private height: number
    ) {}

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    getX(): number { return this.x; }
    getY(): number { return this.y; }
    getWidth(): number { return this.width; }
    getHeight(): number { return this.height; }

    intersects(other: PhysicsBody): boolean {
        return !(
            this.x + this.width <= other.x ||
            other.x + other.width <= this.x ||
            this.y + this.height <= other.y ||
            other.y + other.height <= this.y
        );
    }

    contains(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    getOverlap(other: PhysicsBody): {x: number, y: number} {
        const overlapX = Math.min(this.x + this.width, other.x + other.width) - 
                        Math.max(this.x, other.x);
        const overlapY = Math.min(this.y + this.height, other.y + other.height) - 
                        Math.max(this.y, other.y);
        
        return {
            x: Math.max(0, overlapX),
            y: Math.max(0, overlapY)
        };
    }

    getCenter(): {x: number, y: number} {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    getDistance(other: PhysicsBody): number {
        const center1 = this.getCenter();
        const center2 = other.getCenter();
        
        const dx = center1.x - center2.x;
        const dy = center1.y - center2.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export class Physics {
    static readonly GRAVITY = 1200; // pixels per second squared
    static readonly TERMINAL_VELOCITY = 600; // pixels per second

    static applyGravity(velocityY: number, deltaTime: number): number {
        return Math.min(
            Physics.TERMINAL_VELOCITY,
            velocityY + Physics.GRAVITY * deltaTime
        );
    }

    static checkAABBCollision(
        x1: number, y1: number, w1: number, h1: number,
        x2: number, y2: number, w2: number, h2: number
    ): boolean {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }

    static resolveCollision(
        moving: PhysicsBody,
        movingVelX: number,
        movingVelY: number,
        staticBody: PhysicsBody
    ): {x: number, y: number, velX: number, velY: number} {
        const overlap = moving.getOverlap(staticBody);
        
        let newX = moving.getX();
        let newY = moving.getY();
        let newVelX = movingVelX;
        let newVelY = movingVelY;

        if (overlap.x > 0 && overlap.y > 0) {
            // Determine which axis to resolve based on the smaller overlap
            if (overlap.x < overlap.y) {
                // Resolve horizontal collision
                if (moving.getX() < staticBody.getX()) {
                    // Moving object is to the left
                    newX = staticBody.getX() - moving.getWidth();
                } else {
                    // Moving object is to the right
                    newX = staticBody.getX() + staticBody.getWidth();
                }
                newVelX = 0;
            } else {
                // Resolve vertical collision
                if (moving.getY() < staticBody.getY()) {
                    // Moving object is above
                    newY = staticBody.getY() - moving.getHeight();
                } else {
                    // Moving object is below
                    newY = staticBody.getY() + staticBody.getHeight();
                }
                newVelY = 0;
            }
        }

        return {
            x: newX,
            y: newY,
            velX: newVelX,
            velY: newVelY
        };
    }

    static lineIntersectsRect(
        lineX1: number, lineY1: number,
        lineX2: number, lineY2: number,
        rectX: number, rectY: number,
        rectWidth: number, rectHeight: number
    ): boolean {
        // Simple line-rectangle intersection
        const left = rectX;
        const right = rectX + rectWidth;
        const top = rectY;
        const bottom = rectY + rectHeight;

        // Check if either endpoint is inside the rectangle
        if ((lineX1 >= left && lineX1 <= right && lineY1 >= top && lineY1 <= bottom) ||
            (lineX2 >= left && lineX2 <= right && lineY2 >= top && lineY2 <= bottom)) {
            return true;
        }

        // Check intersection with each edge of the rectangle
        return (
            this.lineSegmentIntersection(lineX1, lineY1, lineX2, lineY2, left, top, right, top) ||     // Top edge
            this.lineSegmentIntersection(lineX1, lineY1, lineX2, lineY2, right, top, right, bottom) || // Right edge
            this.lineSegmentIntersection(lineX1, lineY1, lineX2, lineY2, right, bottom, left, bottom) || // Bottom edge
            this.lineSegmentIntersection(lineX1, lineY1, lineX2, lineY2, left, bottom, left, top)      // Left edge
        );
    }

    private static lineSegmentIntersection(
        x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number
    ): boolean {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return false; // Parallel lines

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
} 