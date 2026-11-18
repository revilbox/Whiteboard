// Точка входа — связывает всё вместе.
(function(){
  // Загрузка сохранённого состояния (до инициализации UI)
  const loaded = Storage.load();

  // Применяем сохранённый акцент (до UI.init, чтобы тема уже стояла)
  document.documentElement.style.setProperty('--accent', State.accent || '#5865f2');

  // Строим UI
  Dock.build();
  Dock.rebuildToolList();
  Canvas.resize();
  UI.updateTheme();
  UI.init();

  // Восстанавливаем UI-состояние из State
  UI.applyAccent(State.accent);
  UI.setColor(State.color);
  UI.setSize(State.size);
  Tools.setActive(State.tool);
  Tools.initHistory();

  // Стартовый hint
  if(!loaded){
    setTimeout(() => Utils.hint('Infinite canvas — scroll to zoom, drag to pan, keys 1-0 for tools'), 600);
  }

  // Ресайз
  window.addEventListener('resize', () => {
    Canvas.resize();
    Dock.positionToolSettings();
  });
  new ResizeObserver(() => Dock.positionToolSettings()).observe(document.getElementById('dock'));

  // Клик вне открытых поповеров
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