if (this.expandedParents.has(parent.id) && Array.isArray(parent.content)) {
  parent.content.forEach(item => {
    const type = parent.type && this.renderers[parent.type]
      ? parent.type
      : "default";

    const rendererFn = this.renderers[type];
    const { key, elements, updateFn, height } = rendererFn(
      this.scene,
      this.container,
      item,
      currentY,
      this,
      parent.id,
      parent.contentHeight ?? this.itemHeight
    );

    this.itemRefs.set(key, { elements, updateFn });

    // Use the renderer's actual height instead of a static value
    currentY += (height ?? parent.contentHeight ?? this.itemHeight) + this.verticalPadding;
  });
}