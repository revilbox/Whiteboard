// Только тач-специфика: жесты двумя пальцами, double-tap undo, привязка к canvas.
(function(){
  const canvas = Canvas.canvas;

  function multiTouchStart(e){
    State.isPanning = false;
    State.isDrawing = false;
    State.draggingPin = null;
    State.rmbPanning = false;
    State.cursorVisible = false;
    CursorRing.update();

    const t1 = e.touches[0], t2 = e.touches[1];
    State.touchState = {
      lastDist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
      lastCenter: {x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2},
      lastTime: Date.now()
    };
    State.touchMoved = false;

    if(State.touchState.lastTime - (multiTouchStart._lastTap || 0) < 300){
      Tools.undo();
      Utils.hint('Undo (double tap)');
    }
    multiTouchStart._lastTap = Date.now();
  }

  function multiTouchMove(e){
    if(e.touches.length === 2 && State.touchState){
      e.preventDefault();
      State.touchMoved = true;
      const t1 = e.touches[0], t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const center = {x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2};

      const factor = dist / State.touchState.lastDist;
      const newZoom = Math.max(0.05, Math.min(10, State.camera.zoom * factor));
      const worldBefore = Camera.screenToWorld(center.x, center.y);
      State.camera.zoom = newZoom;
      State.camera.x = center.x - worldBefore.x * newZoom;
      State.camera.y = center.y - worldBefore.y * newZoom;
      State.camera.x += center.x - State.touchState.lastCenter.x;
      State.camera.y += center.y - State.touchState.lastCenter.y;

      State.touchState.lastDist = dist;
      State.touchState.lastCenter = center;
      Canvas.render();
    }
  }

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if(e.touches.length >= 2){ multiTouchStart(e); return; }
    const t = e.touches[0];
    State.activeTouchId = t.identifier;
    State.touchMoved = false;
    Pointer.down(t.clientX, t.clientY, true);
  }, {passive: false});

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if(e.touches.length >= 2){ multiTouchMove(e); return; }
    const t = e.touches[0];
    if(t.identifier === State.activeTouchId){
      State.touchMoved = true;
      Pointer.move(t.clientX, t.clientY);
    }
  }, {passive: false});

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if(e.touches.length === 0){
      const t = e.changedTouches[0];
      if(t && t.identifier === State.activeTouchId){
        Pointer.up(t.clientX, t.clientY, true);
        State.activeTouchId = null;
        State.cursorVisible = false;
        CursorRing.update();
      }
    } else if(e.touches.length === 1 && State.touchState){
      State.touchState = null;
      State.activeTouchId = e.touches[0].identifier;
    }
  }, {passive: false});

  canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    State.activeTouchId = null;
    State.touchState = null;
    State.cursorVisible = false;
    CursorRing.update();
    State.isDrawing = false;
    State.isPanning = false;
    State.draggingPin = null;
    State.rmbPanning = false;
  }, {passive: false});
})();