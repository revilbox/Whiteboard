// Панель настроек: фон, сетка, акцент, undo/clear/export.
const UI = (function(){
  const bgOptions = document.getElementById('bgOptions');
  const bgImageInput = document.getElementById('bgImageInput');
  const gridToggle = document.getElementById('gridToggle');
  const gridSizeSlider = document.getElementById('gridSizeSlider');
  const gridSizeValue = document.getElementById('gridSizeValue');
  const hideDockToggle = document.getElementById('hideDockToggle');
  const showZoomToggle = document.getElementById('showZoomToggle');
  const menuBtn = document.getElementById('menuBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const dock = document.getElementById('dock');
  const dockToggle = document.getElementById('dockToggle');
  const accentSwatches = document.getElementById('accentSwatches');
  const accentColorInput = document.getElementById('accentColorInput');
  const colorSwatches = document.getElementById('colorSwatches');
  const customColorInput = document.getElementById('customColorInput');
  const sizeSlider = document.getElementById('sizeSlider');

  function updateTheme(){
    const dark = Utils.isDark(State.bgImage ? '#000' : State.bg);
    const root = document.documentElement.style;
    if(dark){
      root.setProperty('--panel-bg', 'rgba(15,15,18,.65)');
      root.setProperty('--panel-border', 'rgba(255,255,255,.1)');
      root.setProperty('--panel-text', '#e8e8ea');
      root.setProperty('--tool-icon', '#c0c0c8');
      root.setProperty('--tool-icon-hover', '#ffffff');
      root.setProperty('--tool-hover', 'rgba(255,255,255,.1)');
      root.setProperty('--label', '#909098');
      root.setProperty('--track', 'rgba(255,255,255,.18)');
      root.setProperty('--btn-bg', 'rgba(255,255,255,.08)');
      root.setProperty('--btn-hover', 'rgba(255,255,255,.16)');
      root.setProperty('--item-bg', 'rgba(255,255,255,.05)');
      root.setProperty('--input-bg', 'rgba(0,0,0,.35)');
      root.setProperty('--divider', 'rgba(255,255,255,.12)');
      root.setProperty('--cursor-ring-color', '#ffffff');
    } else {
      root.setProperty('--panel-bg', 'rgba(255,255,255,.55)');
      root.setProperty('--panel-border', 'rgba(0,0,0,.12)');
      root.setProperty('--panel-text', '#1a1a1e');
      root.setProperty('--tool-icon', '#3a3a42');
      root.setProperty('--tool-icon-hover', '#000000');
      root.setProperty('--tool-hover', 'rgba(0,0,0,.08)');
      root.setProperty('--label', '#5a5a62');
      root.setProperty('--track', 'rgba(0,0,0,.18)');
      root.setProperty('--btn-bg', 'rgba(0,0,0,.06)');
      root.setProperty('--btn-hover', 'rgba(0,0,0,.12)');
      root.setProperty('--item-bg', 'rgba(0,0,0,.04)');
      root.setProperty('--input-bg', 'rgba(0,0,0,.08)');
      root.setProperty('--divider', 'rgba(0,0,0,.12)');
      root.setProperty('--cursor-ring-color', '#000000');
    }
    if(window.CursorRing) CursorRing.update();
  }

  function applyAccent(color){
    State.accent = color;
    document.documentElement.style.setProperty('--accent', color);
    document.querySelectorAll('#accentSwatches .swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.accent === color);
    });
    accentColorInput.value = color;
  }

  function setColor(c){
    State.color = c;
    customColorInput.value = c;
    document.querySelectorAll('#colorSwatches .swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === c);
    });
    if(State.tool !== 'eraser') document.getElementById('sizePreview').style.background = c;
    if(window.CursorRing) CursorRing.update();
  }

  function setSize(n){
    State.size = n;
    sizeSlider.value = n;
    document.getElementById('sizeValue').textContent = n;
    const pv = document.getElementById('sizePreview');
    pv.style.width = Math.min(n, 24) + 'px';
    pv.style.height = Math.min(n, 24) + 'px';
    if(State.tool !== 'eraser') pv.style.background = State.color;
    pv.style.border = State.tool === 'eraser' ? '1px dashed var(--label)' : 'none';
    if(window.CursorRing) CursorRing.update();
  }

  function init(){
    // Accent
    accentSwatches.addEventListener('click', e => {
      const sw = e.target.closest('.swatch'); if(!sw) return;
      applyAccent(sw.dataset.accent); Storage.save();
    });
    accentColorInput.addEventListener('input', e => { applyAccent(e.target.value); Storage.save(); });

    // Color
    colorSwatches.addEventListener('click', e => {
      const sw = e.target.closest('.swatch'); if(!sw) return;
      setColor(sw.dataset.color); Canvas.render(); Storage.save();
    });
    customColorInput.addEventListener('input', e => { setColor(e.target.value); Canvas.render(); Storage.save(); });

    // Size
    sizeSlider.addEventListener('input', e => { setSize(parseInt(e.target.value)); Storage.save(); });

    // Background swatches
    bgOptions.addEventListener('click', e => {
      const sw = e.target.closest('.bg-swatch'); if(!sw) return;
      document.querySelectorAll('.bg-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      State.bgImage = null;
      State.bg = sw.dataset.bg;
      updateTheme(); Canvas.render(); Storage.save();
    });
    bgImageInput.addEventListener('change', e => {
      const file = e.target.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => { State.bgImage = img; updateTheme(); Canvas.render(); Storage.save(); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    // Grid
    gridToggle.addEventListener('click', () => {
      State.showGrid = !State.showGrid;
      gridToggle.classList.toggle('on', State.showGrid);
      Canvas.render(); Storage.save();
    });
    gridSizeSlider.addEventListener('input', e => {
      State.gridSize = parseInt(e.target.value);
      gridSizeValue.textContent = State.gridSize;
      Canvas.render(); Storage.save();
    });

    // UI toggles
    hideDockToggle.addEventListener('click', () => {
      const hidden = dock.classList.toggle('hidden');
      hideDockToggle.classList.toggle('on', hidden);
      dockToggle.style.display = hidden ? 'flex' : 'none';
      Dock.positionToolSettings(); Storage.save();
    });
    showZoomToggle.addEventListener('click', () => {
      State.showZoom = !State.showZoom;
      showZoomToggle.classList.toggle('on', State.showZoom);
      document.getElementById('zoomIndicator').style.display = State.showZoom ? 'block' : 'none';
      Storage.save();
    });
    dockToggle.addEventListener('click', () => {
      dock.classList.remove('hidden');
      hideDockToggle.classList.remove('on');
      dockToggle.style.display = 'none';
      Dock.positionToolSettings(); Storage.save();
    });

    // Menu
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      settingsPanel.classList.toggle('open');
      menuBtn.classList.toggle('open');
    });
    settingsPanel.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', e => {
      if(!settingsPanel.contains(e.target) && !menuBtn.contains(e.target)){
        settingsPanel.classList.remove('open');
        menuBtn.classList.remove('open');
      }
    });

    // Actions
    document.getElementById('undoBtnPanel').addEventListener('click', () => { Tools.undo(); Utils.hint('Undo'); });
    document.getElementById('clearBtnPanel').addEventListener('click', () => {
      if(confirm('Clear canvas?')){
        State.strokes = [];
        Tools.saveHistory();
        Canvas.render();
        Utils.hint('Cleared');
      }
    });
    document.getElementById('saveBtnPanel').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = Canvas.canvas.toDataURL('image/png');
      link.click();
      Utils.hint('Exported');
    });

    // Add tool
    document.getElementById('addToolBtn').addEventListener('click', () => {
      const id = document.getElementById('addToolSelect').value;
      if(!State.visibleTools.includes(id)){
        State.visibleTools.push(id);
        Dock.build(); Dock.rebuildToolList(); Storage.save();
      }
    });

    // Sync UI to state
    applyAccent(State.accent);
    setColor(State.color);
    setSize(State.size);
    gridToggle.classList.toggle('on', State.showGrid);
    gridSizeSlider.value = State.gridSize;
    gridSizeValue.textContent = State.gridSize;
    showZoomToggle.classList.toggle('on', State.showZoom);
    document.querySelectorAll('.bg-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.bg === State.bg);
    });
  }

  return {init, updateTheme, applyAccent, setColor, setSize};
})();
