// Ластик: tap удаляет всю структуру, drag — стирает всё, что задевает (как реальный ластик).
const Erase = {
  // Проверка: задевает ли точка world структуру s с учётом радиуса
  hits(world, s, radius){
    if(s.type === 'path'){
      for(const p of s.points){
        if(Math.hypot(p.x - world.x, p.y - world.y) < (s.size/2 + radius)) return true;
      }
      // Также проверяем отрезки между точками
      for(let i = 1; i < s.points.length; i++){
        if(Strokes.distToSegment(world, s.points[i-1], s.points[i]) < (s.size/2 + radius)) return true;
      }
      return false;
    }
    if(s.type === 'line'){
      return Strokes.distToSegment(world, {x:s.x1,y:s.y1}, {x:s.x2,y:s.y2}) < (s.size/2 + radius);
    }
    if(s.type === 'rect'){
      // Прямоугольник: точка внутри или рядом с границей
      const x1 = s.x, y1 = s.y, x2 = s.x + s.w, y2 = s.y + s.h;
      const pad = s.size/2 + radius;
      // Внутри с отступом
      if(world.x >= x1 - pad && world.x <= x2 + pad && world.y >= y1 - pad && world.y <= y2 + pad){
        // Но если точка глубоко внутри (не у краёв) — тоже считается
        return true;
      }
      return false;
    }
    if(s.type === 'circle'){
      const d = Math.hypot(world.x - s.cx, world.y - s.cy);
      return Math.abs(d - s.r) < (s.size/2 + radius) || d < (s.r - s.size/2); // на кольце или внутри
    }
    if(s.type === 'text'){
      const lines = s.text.split('\n');
      const lh = s.size * 4 + 18;
      const pad = radius + s.size;
      for(let i = 0; i < lines.length; i++){
        if(world.x > s.x - pad && world.x < s.x + lines[i].length * (s.size * 2.5) + pad &&
           world.y > s.y + i*lh - pad && world.y < s.y + (i+1)*lh + pad) return true;
      }
      return false;
    }
    if(s.type === 'pin'){
      const d = Math.hypot(world.x - s.x, world.y - s.y);
      return d < s.size*1.5 + 10 + radius;
    }
    return false;
  },

  wholeAt(world){
    const before = State.strokes.length;
    State.strokes = State.strokes.filter(s => !this.hits(world, s, State.size * 1.5));
    if(State.strokes.length !== before){ Canvas.render(); Storage.save(); }
  },

  dragAt(world){
    const before = State.strokes.length;
    // При движении ластик стирает ЛЮБУЮ структуру, которую задевает — целиком
    State.strokes = State.strokes.filter(s => !this.hits(world, s, State.size * 1.5));
    if(State.strokes.length !== before){ Canvas.render(); Storage.save(); }
  }
};
