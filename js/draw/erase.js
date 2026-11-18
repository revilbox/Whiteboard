// Ластик: tap удаляет всю структуру, drag — только свободный путь.
const Erase = {
  wholeAt(world){
    const before = State.strokes.length;
    State.strokes = State.strokes.filter(s => {
      if(s.type === 'path'){
        for(const p of s.points){
          if(Math.hypot(p.x - world.x, p.y - world.y) < (s.size/2 + State.size*1.5)) return false;
        }
        return true;
      }
      if(s.type === 'line') return Strokes.distToSegment(world, {x:s.x1,y:s.y1}, {x:s.x2,y:s.y2}) > s.size/2 + State.size;
      if(s.type === 'rect') return !(world.x >= s.x - s.size && world.x <= s.x + s.w + s.size && world.y >= s.y - s.size && world.y <= s.y + s.h + s.size);
      if(s.type === 'circle') return Math.abs(Math.hypot(world.x - s.cx, world.y - s.cy) - s.r) > s.size/2 + State.size;
      if(s.type === 'text'){
        const lines = s.text.split('\n');
        const lh = s.size * 4 + 18;
        for(let i = 0; i < lines.length; i++){
          if(world.x > s.x - 10 && world.x < s.x + lines[i].length * (s.size * 2.5) &&
             world.y > s.y + i*lh - 5 && world.y < s.y + (i+1)*lh + 5) return false;
        }
        return true;
      }
      if(s.type === 'pin') return Math.hypot(world.x - s.x, world.y - s.y) > s.size * 1.5 + 10 + State.size;
      return true;
    });
    if(State.strokes.length !== before){ Canvas.render(); Storage.save(); }
  },

  dragAt(world){
    let changed = false;
    const newStrokes = [];
    for(const s of State.strokes){
      if(s.type === 'path'){
        const newPoints = s.points.filter(p => Math.hypot(p.x - world.x, p.y - world.y) > (s.size/2 + State.size*1.5));
        if(newPoints.length !== s.points.length) changed = true;
        if(newPoints.length > 0){ s.points = newPoints; newStrokes.push(s); }
      } else {
        newStrokes.push(s);
      }
    }
    if(changed){ State.strokes = newStrokes; Canvas.render(); Storage.save(); }
  }
};