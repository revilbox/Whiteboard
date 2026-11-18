// Преобразования координат и логика камеры.
const Camera = {
  screenToWorld(sx, sy){
    return {
      x: (sx - State.camera.x) / State.camera.zoom,
      y: (sy - State.camera.y) / State.camera.zoom
    };
  },
  worldToScreen(wx, wy){
    return {
      x: wx * State.camera.zoom + State.camera.x,
      y: wy * State.camera.zoom + State.camera.y
    };
  },
  pan(dx, dy){
    State.camera.x += dx;
    State.camera.y += dy;
  },
  zoomAt(sx, sy, factor){
    const worldBefore = this.screenToWorld(sx, sy);
    const newZoom = Math.max(0.05, Math.min(10, State.camera.zoom * factor));
    State.camera.zoom = newZoom;
    State.camera.x = sx - worldBefore.x * newZoom;
    State.camera.y = sy - worldBefore.y * newZoom;
  }
};