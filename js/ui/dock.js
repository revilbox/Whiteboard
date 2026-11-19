// Док-панель и всплывающее окно настроек инструмента.
const Dock = (function(){
  const dock = document.getElementById('dock');
  const toolSettings = document.getElementById('toolSettings');

  function build(){
    dock.innerHTML = '';
    for(const toolId of State.visibleTools){
      const def = State.toolDefs.find(t => t.id === toolId);
      if(!def) continue;
      const btn = document.createElement('button');
      btn.className = 'tool-btn' + (State.tool === toolId ? ' active' : '');
      btn.dataset.tool = toolId;
      btn.title = def.label + ' (' + (def.key || '') + ')';
      btn.innerHTML = `<i class="fas ${def.icon}"></i>`;
      btn.addEventListener('click', e => { e.stopPropagation(); handleClick(toolId); });
      dock.appendChild(btn);
    }
    positionToolSettings();
  }

  function handleClick(toolId){
    if(State.activeToolForSettings === toolId && toolSettings.classList.contains('open')){
      closeSettings();
      State.activeToolForSettings = null;
      return;
    }
    Tools.setActive(toolId);
    if(['pen','line','rect','circle','text','pin','eraser'].includes(toolId)){
      State.activeToolForSettings = toolId;
      openSettings();
    } else {
      State.activeToolForSettings = null;
      closeSettings();
    }
  }

  function openSettings(){
    clearTimeout(State.settingsTimeout);
    // Закрываем общую панель настроек, чтобы не перекрывались
    const sp = document.getElementById('settingsPanel');
    const mb = document.getElementById('menuBtn');
    if(sp) sp.classList.remove('open');
    if(mb) mb.classList.remove('open');
    positionToolSettings();
    toolSettings.classList.add('open');
    syncSettings();
  }

  function closeSettings(){
    State.settingsTimeout = setTimeout(() => {
      toolSettings.classList.remove('open');
      State.activeToolForSettings = null;
    }, 200);
  }

  function positionToolSettings(){
    const rect = dock.getBoundingClientRect();
    const bottom = window.innerHeight - rect.top + 10;
    toolSettings.style.bottom = bottom + 'px';
  }

  function syncSettings(){
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const sizePreview = document.getElementById('sizePreview');
    sizeSlider.value = State.size;
    sizeValue.textContent = State.size;
    sizePreview.style.width = Math.min(State.size, 24) + 'px';
    sizePreview.style.height = Math.min(State.size, 24) + 'px';
    sizePreview.style.background = State.tool === 'eraser' ? 'transparent' : State.color;
    sizePreview.style.border = State.tool === 'eraser' ? '1px dashed var(--label)' : 'none';
    document.querySelectorAll('#colorSwatches .swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === State.color);
    });
    CursorRing.update();
  }

  function rebuildToolList(){
    const listEl = document.getElementById('toolList');
    listEl.innerHTML = '';
    for(const id of State.visibleTools){
      const def = State.toolDefs.find(t => t.id === id);
      if(!def) continue;
      const row = document.createElement('div');
      row.className = 'tool-item';
      row.innerHTML = `<i class="fas ${def.icon}"></i><span>${def.label}</span>`;
      const up = document.createElement('button'); up.innerHTML = '<i class="fas fa-arrow-up"></i>';
      up.onclick = () => {
        const i = State.visibleTools.indexOf(id);
        if(i > 0){
          [State.visibleTools[i-1], State.visibleTools[i]] = [State.visibleTools[i], State.visibleTools[i-1]];
          build(); rebuildToolList(); Storage.save();
        }
      };
      const down = document.createElement('button'); down.innerHTML = '<i class="fas fa-arrow-down"></i>';
      down.onclick = () => {
        const i = State.visibleTools.indexOf(id);
        if(i < State.visibleTools.length - 1){
          [State.visibleTools[i+1], State.visibleTools[i]] = [State.visibleTools[i], State.visibleTools[i+1]];
          build(); rebuildToolList(); Storage.save();
        }
      };
      const del = document.createElement('button'); del.className = 'del'; del.innerHTML = '<i class="fas fa-times"></i>';
      del.onclick = () => {
        if(State.visibleTools.length <= 1) return;
        State.visibleTools = State.visibleTools.filter(t => t !== id);
        if(State.tool === id) Tools.setActive(State.visibleTools[0]);
        build(); rebuildToolList(); Storage.save();
      };
      row.appendChild(up); row.appendChild(down); row.appendChild(del);
      listEl.appendChild(row);
    }
  }

  return {build, rebuildToolList, openSettings, closeSettings, positionToolSettings, syncSettings, handleClick};
})();
