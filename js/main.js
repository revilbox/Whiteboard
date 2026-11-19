// Точка входа — связывает всё вместе.
(function(){
  // ---- Аварийный отладчик: покажет любую ошибку поверх экрана ----
  function showFatal(msg){
    let el = document.getElementById('__fatal');
    if(!el){
      el = document.createElement('div');
      el.id = '__fatal';
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#b00020;color:#fff;font:12px/1.4 monospace;padding:8px;max-height:50vh;overflow:auto;white-space:pre-wrap';
      document.body.appendChild(el);
    }
    el.textContent += msg + '\n';
  }
  window.addEventListener('error', e => {
    showFatal('ERROR: ' + e.message + '\n  at ' + (e.filename||'') + ':' + e.lineno);
  });
  window.addEventListener('unhandledrejection', e => {
    showFatal('REJECT: ' + ((e.reason && e.reason.message) || e.reason));
  });

  // ---- Проверка, что все модули загрузились ----
  const required = ['Utils','State','Storage','Camera','Canvas','Tools','DrawStroke','Strokes','Erase','VideoControls','Media','CursorRing','TextEditor','Dock','UI','Pointer'];
  const missing = required.filter(k => typeof window[k] === 'undefined' && typeof eval('typeof ' + k) === 'undefined');
  // eval выше — чтобы проверить даже const-объявления
  required.forEach(k => {
    try { if(typeof eval(k) === 'undefined') showFatal('MISSING MODULE: ' + k); } catch(e){}
  });

  // ---- Инициализация под try/catch ----
  try {
    Storage.load();
  } catch(e){ showFatal('Storage.load failed: ' + e.message); }

  document.documentElement.style.setProperty('--accent', State.accent || '#5865f2');

  try {
    Dock.build();
    Dock.rebuildToolList();
    Canvas.resize();
    UI.updateTheme();
    UI.init();
  } catch(e){
    showFatal('Init failed: ' + e.message + '\n' + (e.stack || ''));
  }

  try {
    UI.applyAccent(State.accent);
    UI.setColor(State.color);
    UI.setSize(State.size);
    Tools.setActive(State.tool);
    Tools.initHistory();
    Canvas.render();
  } catch(e){
    showFatal('Post-init failed: ' + e.message);
  }

  // ---- Проверка, что обработчики input привязаны ----
  setTimeout(() => {
    let el = document.getElementById('__fatal');
    if(!el){
      el = document.createElement('div');
      el.id = '__fatal';
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#0a3d0a;color:#9f9;font:11px/1.4 monospace;padding:6px;white-space:pre-wrap';
      document.body.appendChild(el);
      el.textContent = 'OK: modules loaded\n';
      el.textContent += 'Pointer=' + typeof Pointer + '\n';
      el.textContent += 'Camera=' + typeof Camera + '\n';
      el.textContent += 'Canvas=' + typeof Canvas + '\n';
      el.textContent += 'canvas=' + (Canvas.canvas ? Canvas.canvas.width+'x'+Canvas.canvas.height : 'NULL') + '\n';
    }
  }, 500);
})();
