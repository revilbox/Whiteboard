// Точка входа — связывает всё вместе.
(function(){
  // 1. Загрузка сохранённого состояния (только данных, без UI)
  try {
    Storage.load();
  } catch(e){ console.warn('Storage.load failed', e); }

  // 2. Применяем акцент до UI.init, чтобы тема уже стояла
  document.documentElement.style.setProperty('--accent', State.accent || '#5865f2');

  // 3. Инициализация UI и Canvas
  try {
    Dock.build();
    Dock.rebuildToolList();
    Canvas.resize();
    UI.updateTheme();
    UI.init();
  } catch(e){
    console.error('Init failed:', e);
  }

  // 4. Восстанавливаем UI-состояние из State
  UI.applyAccent(State.accent);
  UI.setColor(State.color);
  UI.setSize(State.size);
  Tools.setActive(State.tool);
  Tools.initHistory();
  Canvas.render();

  // 5. Стартовая подсказка — только при первом запуске
  if(!State.history.length || State.historyIndex <= 0){
    setTimeout(() => Utils.hint('Infinite canvas — scroll to zoom, drag to pan, keys 1-0 for tools'), 600);
  }

  // 6. Ресайз
  window.addEventListener('resize', () => {
    Canvas.resize();
    Dock.positionToolSettings();
  });
  if(window.ResizeObserver){
    new ResizeObserver(() => Dock.positionToolSettings()).observe(document.getElementById('dock'));
  }

  // 7. Клик вне поповеров
  document.addEventListener('click', (e) => {
    if(!document.getElementById('toolSettings').contains(e.target) && !e.target.closest('.tool-btn')){
      Dock.closeSettings();
    }
    const ms = document.getElementById('mediaSettings');
    if(ms.classList.contains('open') && !ms.contains(e.target) && !e.target.closest('.media-item')){
      ms.classList.remove('open');
    }
  });
  document.getElementById('toolSettings').addEventListener('click', e => e.stopPropagation());
  document.getElementById('mediaSettings').addEventListener('click', e => e.stopPropagation());
})();

// ВРЕМЕННО — для отладки на телефоне
setTimeout(() => {
  const dbg = document.createElement('div');
  dbg.style.cssText = 'position:fixed;bottom:120px;left:8px;right:8px;z-index:99999;background:#000;color:#0f0;font:11px monospace;padding:6px;max-height:200px;overflow:auto;white-space:pre-wrap';
  dbg.textContent = 
    'Pointer: ' + (typeof Pointer) + '\n' +
    'Camera: ' + (typeof Camera) + '\n' +
    'State.tool: ' + State.tool + '\n' +
    'canvas size: ' + Canvas.canvas.width + 'x' + Canvas.canvas.height + '\n' +
    'canvas rect: ' + JSON.stringify(Canvas.canvas.getBoundingClientRect()) + '\n';
  document.body.appendChild(dbg);
  
  Canvas.canvas.addEventListener('touchstart', (e) => {
    dbg.textContent += '\nTOUCH START: ' + e.touches[0].clientX + ',' + e.touches[0].clientY + ' touches=' + e.touches.length;
  }, {passive: false});
  Canvas.canvas.addEventListener('touchmove', (e) => {
    dbg.textContent += '\nTOUCH MOVE';
  }, {passive: false});
}, 1000);
