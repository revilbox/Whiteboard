// Рендер холста, сетка, размеры.
const Canvas = (function(){
  const canvas = document.getElementById('boardCanvas');
  const ctx = canvas.getContext('2d');

  function resize(){
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
    Dock.positionToolSettings();
    CursorRing.update();
  }

  function drawGrid(w, h){
    const g = State.gridSize * State.camera.zoom;
    if(g < 8) return;
    const dark = Utils.isDark(State.bgImage ? '#000' : State.bg);
    const ox = State.camera.x % g;
    const oy = State.camera.y % g;

    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x = ox; x <= w; x += g) if(x >= 0){ ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for(let y = oy; y <= h; y += g) if(y >= 0){ ctx.moveTo(0, y); ctx.lineTo(w, y); }
    for(let x = ox - g; x >= -g; x -= g) if(x >= 0){ ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for(let y = oy - g; y >= -g; y -= g) if(y >= 0){ ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    const g5 = g * 5;
    const ox5 = State.camera.x % g5;
    const oy5 = State.camera.y % g5;
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    for(let x = ox5; x <= w; x += g5) if(x >= 0){ ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for(let y = oy5; y <= h; y += g5) if(y >= 0){ ctx.moveTo(0, y); ctx.lineTo(w, y); }
    for(let x = ox5 - g5; x >= -g5; x -= g5) if(x >= 0){ ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for(let y = oy5 - g5; y >= -g5; y -= g5) if(y >= 0){ ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
  }

  function render(){
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // фон
    if(State.bgImage){
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, w, h);
      const img = State.bgImage;
      const scale = Math.max(w / img.width, h / img.height) * 0.8;
      const iw = img.width * scale, ih = img.height * scale;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = State.bg;
      ctx.fillRect(0, 0, w, h);
    }

    if(State.showGrid) drawGrid(w, h);

    ctx.restore();

    // мир
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(State.camera.x, State.camera.y);
    ctx.scale(State.camera.zoom, State.camera.zoom);

    for(const s of State.strokes) DrawStroke.render(s);
    if(State.tempShape) DrawStroke.render(State.tempShape, true);

    if(State.currentPath && State.currentPath.length > 1 && State.tool === 'pen'){
      ctx.beginPath();
      ctx.lineWidth = State.size;
      ctx.strokeStyle = State.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(State.currentPath[0].x, State.currentPath[0].y);
      for(let i = 1; i < State.currentPath.length; i++){
        ctx.lineTo(State.currentPath[i].x, State.currentPath[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();

    Media.syncPositions();

    const zi = document.getElementById('zoomIndicator');
    zi.style.display = State.showZoom ? 'block' : 'none';
    zi.textContent = Math.round(State.camera.zoom * 100) + '%';
  }

  return {canvas, ctx, resize, render};
})();