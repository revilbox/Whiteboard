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
