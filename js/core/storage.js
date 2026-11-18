// Сохранение/загрузка стейта в localStorage.
const Storage = (function(){
  const KEY = 'wb_state';

  function save(){
    try{
      localStorage.setItem(KEY, JSON.stringify({
        strokes: State.strokes,
        camera: State.camera,
        currentBg: State.bg,
        accent: State.accent,
        visibleTools: State.visibleTools,
        currentColor: State.color,
        currentSize: State.size,
        bgImageData: State.bgImage ? State.bgImage.src : null,
        showGrid: State.showGrid,
        gridSize: State.gridSize,
        showZoom: State.showZoom,
        media: State.mediaStore.map(m => ({
          id:m.id, type:m.type, src:m.src, x:m.x, y:m.y, w:m.w, h:m.h,
          loop:m.loop, controls:m.controls
        }))
      }));
    }catch(e){ console.warn('Save state failed', e); }
  }

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return false;
      const s = JSON.parse(raw);
      if(s.strokes) State.strokes = s.strokes;
      if(s.camera) State.camera = s.camera;
      if(s.currentBg) State.bg = s.currentBg;
      if(s.accent) State.accent = s.accent;
      if(s.visibleTools) State.visibleTools = s.visibleTools;
      if(s.currentColor) State.color = s.currentColor;
      if(s.currentSize) State.size = s.currentSize;
      if(typeof s.showGrid === 'boolean') State.showGrid = s.showGrid;
      if(s.gridSize) State.gridSize = s.gridSize;
      if(typeof s.showZoom === 'boolean') State.showZoom = s.showZoom;

      if(s.bgImageData){
        const img = new Image();
        img.src = s.bgImageData;
        img.onload = () => {
          State.bgImage = img;
          if(window.UI) UI.updateTheme();
          if(window.Canvas) Canvas.render();
        };
      }
      if(s.media && window.Media){
        for(const m of s.media){
          Media.addToStore(m.type, m.src, m.id, m.x, m.y, m.w, m.h, m.loop, m.controls);
        }
      }
      return true;
    }catch(e){
      console.warn('Load state failed', e);
      return false;
    }
  }

  return {save, load};
})();
