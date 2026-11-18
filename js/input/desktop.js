// Только ПК-специфика: RMB-панорамирование, hover, hotkeys.
(function(){
  const canvas = Canvas.canvas;

  canvas.addEventListener('mousedown', (e) => {
    if(e.button === 2){
      e.preventDefault();
      State.rmbPanning = true;
      const p = getEventPoint(e);
      State.rmbPanStart = {x: p.x, y: p.y};
      State.rmbPanStartCam = {x: State.camera.x, y: State.camera.y};
      canvas.style.cursor = 'grabbing';
      return;
    }
    if(e.button === 1){ e.preventDefault(); return; }
    if(e.button !== 0) return;
    const p = getEventPoint(e);
    Pointer.down(p.x, p.y, false);
  });

  canvas.addEventListener('mousemove', (e) => {
    const p = getEventPoint(e);
    Pointer.move(p.x, p.y);
  });

  canvas.addEventListener('mouseup', (e) => {
    const p = getEventPoint(e);
    Pointer.up(p.x, p.y, false);
  });

  canvas.addEventListener('mouseenter', () => {
    State.cursorVisible = true;
    CursorRing.update();
  });

  canvas.addEventListener('mouseleave', () => {
    if(!State.rmbPanning && !State.draggingPin){
      State.cursorVisible = false;
      CursorRing.update();
    }
  });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // Слушаем документ, чтобы не терять RMB-панорамирование при выходе за canvas
  document.addEventListener('mousemove', (e) => {
    if(State.rmbPanning || State.isPanning || State.draggingPin){
      const p = getEventPoint(e);
      Pointer.move(p.x, p.y);
    }
  });
  document.addEventListener('mouseup', (e) => {
    if(State.rmbPanning || State.isPanning || State.draggingPin){
      const p = getEventPoint(e);
      Pointer.up(p.x, p.y, false);
    }
  });

  // Wheel zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = getEventPoint(e);
    const factor = e.deltaY < 0 ? 1.08 : 0.925;
    Camera.zoomAt(p.x, p.y, factor);
    Canvas.render();
    Storage.save();
  }, {passive: false});

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if(State.activeTextEditor) return;
    if((e.ctrlKey || e.metaKey) && e.key === 'z'){
      e.preventDefault();
      Tools.undo();
      Utils.hint('Undo');
      return;
    }
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;
    const numMap = {'1':'pen','2':'eraser','3':'line','4':'rect','5':'circle','6':'text','7':'pin','8':'image','9':'video','0':'pan'};
    if(numMap[key] && State.visibleTools.includes(numMap[key])){
      e.preventDefault();
      Tools.setActive(numMap[key]);
      Utils.hint(State.toolDefs.find(t => t.id === numMap[key])?.label || numMap[key]);
      return;
    }
    switch(key.toLowerCase()){
      case 'b': Tools.setActive('pen'); break;
      case 'e': Tools.setActive('eraser'); break;
      case 'l': Tools.setActive('line'); break;
      case 'r': Tools.setActive('rect'); break;
      case 'c': Tools.setActive('circle'); break;
      case 't': Tools.setActive('text'); break;
      case 'p': Tools.setActive('pin'); break;
      case 'h': Tools.setActive('pan'); break;
      case 'g':
        State.showGrid = !State.showGrid;
        document.getElementById('gridToggle').classList.toggle('on', State.showGrid);
        Canvas.render(); Storage.save();
        break;
      case 'escape':
        document.getElementById('settingsPanel').classList.remove('open');
        document.getElementById('menuBtn').classList.remove('open');
        document.getElementById('toolSettings').classList.remove('open');
        State.activeToolForSettings = null;
        document.getElementById('mediaSettings').classList.remove('open');
        TextEditor.close();
        break;
    }
  });
})();