// Рендер одной структуры (path/line/rect/circle/text/pin).
const DrawStroke = {
  render(s, preview){
    const ctx = Canvas.ctx;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if(s.type === 'path'){
      ctx.beginPath();
      ctx.lineWidth = s.size;
      ctx.strokeStyle = s.color;
      if(s.points.length === 1){
        ctx.arc(s.points[0].x, s.points[0].y, s.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      } else {
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for(let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
        ctx.stroke();
      }
    } else if(s.type === 'line'){
      ctx.beginPath(); ctx.lineWidth = s.size; ctx.strokeStyle = s.color;
      ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    } else if(s.type === 'rect'){
      ctx.beginPath(); ctx.lineWidth = s.size; ctx.strokeStyle = s.color;
      ctx.strokeRect(s.x, s.y, s.w, s.h);
    } else if(s.type === 'circle'){
      ctx.beginPath(); ctx.lineWidth = s.size; ctx.strokeStyle = s.color;
      ctx.arc(s.cx, s.cy, s.r, 0, Math.PI * 2); ctx.stroke();
    } else if(s.type === 'text'){
      ctx.font = `${s.size * 4 + 14}px Inter,sans-serif`;
      ctx.fillStyle = s.color;
      ctx.textBaseline = 'top';
      const lines = s.text.split('\n');
      for(let i = 0; i < lines.length; i++){
        ctx.fillText(lines[i], s.x, s.y + i * (s.size * 4 + 18));
      }
    } else if(s.type === 'pin'){
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 1.5 + 6, 0, Math.PI * 2);
      ctx.fillStyle = s.color + '33';
      ctx.fill();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y + s.size * 2.5);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }
};