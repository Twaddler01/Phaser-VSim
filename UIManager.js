export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.elements = {};
    this.latestValues = {};
  }

  // Register a UI element and auto-update with latest value if available
  register(id, updateFn) {
    this.elements[id] = updateFn;
    if (this.latestValues[id] !== undefined) {
      updateFn(this.latestValues[id]);
    }
  }

  update(id, value) {
    this.latestValues[id] = value;
    if (this.elements[id]) {
      this.elements[id](value);
    }
  }
}