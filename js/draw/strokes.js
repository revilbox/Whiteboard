// Утилиты для работы со структурами (hit-test).
const Strokes = {
  distToSegment(p, a, b){
    const dx = b.x - a.x, dy = b.y - a.y;
    const l2 = dx * dx + dy * dy;
    if(l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  },

  hitTestPin(world, excludeStroke){
    for(let i = State.strokes.length - 1; i >= 0; i--){
      const s = State.strokes[i];
      if(s.type === 'pin' && s !== excludeStroke){
        const r = s.size * 1.5 + 10;
        if(Math.hypot(s.x - world.x, s.y - world.y) <= r) return {stroke: s, index: i};
      }
    }
    return null;
  }
};