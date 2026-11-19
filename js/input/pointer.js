// Общая логика pointer down/move/up, одинаковая для мыши и тача.
const Pointer = {
  down(x, y, isTouch){
    if(window.CursorRing) CursorRing.moveTo(x, y);
    State.cursorVisible = true;

    if(State.tool === 'pan'){
      const world = Camera.screenToWorld(x, y);
      const pinHit = Strokes.hitTestPin(world);
      if(pinHit){
        State.draggingPin = pinHit.stroke;
        State.pinDragOffset = {x: world.x - pinHit.stroke.x, y: world.y - pinHit.stroke.y};
        State.pinOriginalPos = {x: pinHit.stroke.x, y: pinHit.stroke.y};
        if(!isTouch) Canvas.canvas.style.cursor = 'grabbing';
        return;
      }
      State.isPanning = true;
      State.panStart = {x, y};
      State.panStartCam = {x: State.camera.x, y: State.camera.y};
      if(!isTouch) Canvas.canvas.style.cursor = 'grabbing';
      return;
    }

    const world = Camera.screenToWorld(x, y);

    if(State.tool === 'text'){
      State.textPointerDownPos = {world: {x: world.x, y: world.y}, screen: {x, y}};
      State.textDownScreen = {x, y};
      return;
    }
    if(State.tool === 'image'){ Media.prompt('image'); return; }
    if(State.tool === 'video'){ Media.prompt('video'); return; }
    if(State.tool === 'pin'){
      for(const s of State.strokes){
        if(s.type === 'pin' && Math.hypot(s.x - world.x, s.y - world.y) < s.size * 1.5 + 15){
          Utils.hint('Pin already here'); return;
        }
      }
      State.strokes.push({type: 'pin', x: world.x, y: world.y, color: State.color, size: State.size});
      Tools.saveHistory(); Canvas.render(); return;
    }
    if(State.tool === 'eraser'){
      State.eraserDownPos = {x: world.x, y: world.y};
      State.eraserMoved = false;
      State.eraserLastErasePos = {x: world.x, y: world.y};
      State.isDrawing = true;
      return;
    }

    State.isDrawing = true;
    State.startWorld = world;
    State.lastWorld = world;
    if(State.tool === 'pen') State.currentPath = [{x: world.x, y: world.y}];
    else State.tempShape = null;
  },

  move(x, y){
    if(window.CursorRing) CursorRing.moveTo(x, y);
    State.cursorVisible = true;
    if(window.CursorRing) CursorRing.update();

    if(State.rmbPanning){
      State.camera.x = State.rmbPanStartCam.x + (x - State.rmbPanStart.x);
      State.camera.y = State.rmbPanStartCam.y + (y - State.rmbPanStart.y);
      Canvas.render();
      return;
    }

    if(State.draggingPin){
      const world = Camera.screenToWorld(x, y);
      State.draggingPin.x = world.x - State.pinDragOffset.x;
      State.draggingPin.y = world.y - State.pinDragOffset.y;
      Canvas.render();
      return;
    }

    if(State.isPanning){
      State.camera.x = State.panStartCam.x + (x - State.panStart.x);
      State.camera.y = State.panStartCam.y + (y - State.panStart.y);
      Canvas.render();
      return;
    }

    if(!State.isDrawing) return;
    const world = Camera.screenToWorld(x, y);

    if(State.tool === 'pen'){
      State.currentPath.push({x: world.x, y: world.y});
      State.lastWorld = world;
      Canvas.render();
    } else if(State.tool === 'eraser'){
      const distFromDown = Math.hypot(world.x - State.eraserDownPos.x, world.y - State.eraserDownPos.y);
      if(distFromDown > State.ERASER_MOVE_THRESHOLD) State.eraserMoved = true;
      if(State.eraserMoved){
        const from = State.eraserLastErasePos;
        const to = world;
        const steps = Math.max(2, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / Math.max(2, State.size * 0.5)));
        for(let i = 1; i <= steps; i++){
          const t = i / steps;
          Erase.dragAt({x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t});
        }
        State.eraserLastErasePos = {x: world.x, y: world.y};
      }
      Canvas.render();
    } else {
      const sx = State.startWorld.x, sy = State.startWorld.y;
      if(State.tool === 'line') State.tempShape = {type:'line', x1:sx, y1:sy, x2:world.x, y2:world.y, color: State.color, size: State.size};
      else if(State.tool === 'rect') State.tempShape = {type:'rect', x:Math.min(sx,world.x), y:Math.min(sy,world.y), w:Math.abs(world.x-sx), h:Math.abs(world.y-sy), color: State.color, size: State.size};
      else if(State.tool === 'circle'){
        const r = Math.hypot(world.x - sx, world.y - sy);
        State.tempShape = {type:'circle', cx:sx, cy:sy, r, color: State.color, size: State.size};
      }
      Canvas.render();
    }
  },

  up(x, y, isTouch){
    if(State.rmbPanning){
      State.rmbPanning = false;
      Canvas.canvas.style.cursor = State.tool === 'pan' ? 'grab' : (State.tool === 'text' ? 'text' : 'crosshair');
      return;
    }
    if(State.draggingPin){
      const pin = State.draggingPin;
      const dropX = pin.x, dropY = pin.y;
      let overlaps = false;
      for(const s of State.strokes){
        if(s === pin || s.type !== 'pin') continue;
        const minDist = s.size * 1.5 + pin.size * 1.5 + 20;
        if(Math.hypot(s.x - dropX, s.y - dropY) < minDist){ overlaps = true; break; }
      }
      if(overlaps){
        pin.x = State.pinOriginalPos.x;
        pin.y = State.pinOriginalPos.y;
        Utils.hint('Cannot place pin on another pin');
      } else {
        Storage.save();
      }
      State.draggingPin = null;
      Canvas.canvas.style.cursor = State.tool === 'pan' ? 'grab' : 'crosshair';
      Canvas.render();
      return;
    }

    if(State.tool === 'text' && State.textPointerDownPos){
      const dx = x - State.textDownScreen.x, dy = y - State.textDownScreen.y;
      if(Math.hypot(dx, dy) < 10){
        const w = State.textPointerDownPos.world;
        State.textPointerDownPos = null;
        TextEditor.open(x, y, w);
        return;
      }
      State.textPointerDownPos = null;
    }

    if(State.isPanning){
      State.isPanning = false;
      Canvas.canvas.style.cursor = State.tool === 'pan' ? 'grab' : (State.tool === 'text' ? 'text' : 'crosshair');
      return;
    }
    if(!State.isDrawing) return;
    State.isDrawing = false;

    if(State.tool === 'pen'){
      if(State.currentPath && State.currentPath.length > 0){
        State.strokes.push({type:'path', points: State.currentPath, color: State.color, size: State.size});
        Tools.saveHistory();
      }
      State.currentPath = null;
    } else if(State.tool === 'eraser'){
      if(!State.eraserMoved) Erase.wholeAt(State.eraserDownPos);
    } else if(State.tempShape){
      State.strokes.push(State.tempShape);
      Tools.saveHistory();
      State.tempShape = null;
    }
    Canvas.render();
  }
};
