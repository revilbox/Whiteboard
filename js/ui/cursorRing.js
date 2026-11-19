// Крутящийся пунктирный круг под курсором.
window.CursorRing = (function(){
  const ring = document.getElementById('cursorRing');
  if(!ring){
    console.warn('[cursorRing] #cursorRing not found in DOM');
  }

  function getRadiusWorld(){
    switch(State.tool){
      case 'pen':    return State.size / 2;
      case 'eraser': return State.size * 1.25;
      case 'line':   return State.size / 2;
      case 'rect':   return State.size / 2;
      case 'circle': return State.size / 2;
      case 'pin':    return State.size * 1.5 + 6;
      default:       return 0;
    }
  }

  function update(){
    if(!ring) return;
    const canvas = document.getElementById('boardCanvas');
    const toolsWithRing = ['pen','eraser','line','rect','circle','pin'];
    if(!State.cursorVisible || !toolsWithRing.includes(State.tool)){
      ring.style.display = 'none';
      if(canvas){
        if(State.tool === 'pan')       canvas.style.cursor = 'grab';
        else if(State.tool === 'text') canvas.style.cursor = 'text';
        else                           canvas.style.cursor = 'crosshair';
      }
      return;
    }
    const rw = getRadiusWorld();
    const diam = Math.max(10, rw * 2 * State.camera.zoom);
    ring.style.width = diam + 'px';
    ring.style.height = diam + 'px';
    ring.classList.toggle('eraser', State.tool === 'eraser');
    ring.style.display = 'block';
    if(canvas) canvas.style.cursor = 'none';
  }

  function moveTo(x, y){
    if(!ring) return;
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
  }

  return {update, moveTo};
})();
