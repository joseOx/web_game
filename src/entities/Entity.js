export class Entity {
  constructor(id, x, y) {
    this.id     = id;
    this.x      = x;
    this.y      = y;
    this.vx     = 0;
    this.vy     = 0;
    this.width  = 0;
    this.height = 0;
    this.active = true;

    // Previous-frame position for interpolated rendering
    this.prevX  = x;
    this.prevY  = y;

    this.components = new Map();
  }

  addComponent(name, component) {
    component.entity = this;
    this.components.set(name, component);
    return this;
  }

  getComponent(name) {
    return this.components.get(name) ?? null;
  }

  hasComponent(name) {
    return this.components.has(name);
  }

  update(dt) {
    if (!this.active) return;
    this.prevX = this.x;
    this.prevY = this.y;
    this.components.forEach(c => c.update?.(dt));
  }

  // Interpolated position for smooth rendering between fixed steps.
  // Call during the render pass with the alpha value from Game._render().
  renderX(alpha) { return this.prevX + (this.x - this.prevX) * alpha; }
  renderY(alpha) { return this.prevY + (this.y - this.prevY) * alpha; }

  // Center of the entity in world space
  centerX() { return this.x + this.width  / 2; }
  centerY() { return this.y + this.height / 2; }

  // Squared distance to another entity (cheaper than sqrt for comparisons)
  distSqTo(other) {
    const dx = this.centerX() - other.centerX();
    const dy = this.centerY() - other.centerY();
    return dx * dx + dy * dy;
  }

  distTo(other) {
    return Math.sqrt(this.distSqTo(other));
  }

  destroy() {
    this.components.forEach(c => c.destroy?.());
    this.components.clear();
    this.active = false;
  }
}
