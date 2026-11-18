// Встроенный редактор текста — открывается по клику инструмента Text.
const TextEditor = (function(){
  function open(sx, sy, world){
    close();
    const ed = document.createElement('div');
    ed.className = 'inline-text-editor';
    ed.style.left = Math.min(sx, window.innerWidth - 260) + 'px';
    ed.style.top  = Math.min(sy, window.innerHeight - 160) + 'px';
    ed.innerHTML = `
      <textarea placeholder="Type text..." rows="3"></textarea>
      <div class="ite-actions">
        <button class="ite-btn" data-action="cancel">Cancel</button>
        <button class="ite-btn primary" data-action="add">Add</button>
      </div>
    `;
    document.body.appendChild(ed);
    State.activeTextEditor = ed;

    const ta = ed.querySelector('textarea');
    setTimeout(() => ta.focus(), 50);

    const finish = (commit) => {
      if(commit){
        const text = ta.value.trim();
        if(text){
          State.strokes.push({
            type: 'text', x: world.x, y: world.y, text,
            color: State.color, size: State.size
          });
          Tools.saveHistory();
          Canvas.render();
        }
      }
      close();
    };

    ed.addEventListener('mousedown', e => e.stopPropagation());
    ed.addEventListener('touchstart', e => e.stopPropagation(), {passive:false});
    ed.querySelector('[data-action="add"]').addEventListener('click', e => { e.stopPropagation(); finish(true); });
    ed.querySelector('[data-action="cancel"]').addEventListener('click', e => { e.stopPropagation(); finish(false); });
    ta.addEventListener('mousedown', e => e.stopPropagation());
    ta.addEventListener('keydown', e => {
      if(e.key === 'Escape'){ e.preventDefault(); finish(false); }
      if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); finish(true); }
    });
  }

  function close(){
    if(State.activeTextEditor){ State.activeTextEditor.remove(); State.activeTextEditor = null; }
  }

  return {open, close};
})();