// Добавление/рендер/перемещение медиа-объектов.
const Media = (function(){
  function addToStore(type, src, id, x, y, w, h, loop = true, controls = true){
    let el;
    if(type === 'image' || type === 'gif'){
      el = document.createElement('img'); el.src = src; el.draggable = false;
    } else if(type === 'video'){
      el = document.createElement('video');
      el.src = src; el.autoplay = true; el.loop = loop; el.muted = true; el.playsInline = true;
    }
    el.style.width = '100%'; el.style.height = 'auto'; el.style.pointerEvents = 'none';

    const wrap = document.createElement('div');
    wrap.className = 'media-item';
    wrap.style.position = 'fixed';
    wrap.style.zIndex = '2';
    wrap.style.width = w + 'px';

    const close = document.createElement('button');
    close.className = 'media-close';
    close.innerHTML = '<i class="fas fa-times"></i>';
    close.onclick = (e) => {
      e.stopPropagation();
      wrap.remove();
      State.mediaStore = State.mediaStore.filter(mm => mm.id !== id);
      Storage.save();
      Canvas.render();
    };

    const resize = document.createElement('div');
    resize.className = 'media-resize';
    resize.innerHTML = '<i class="fas fa-expand-alt"></i>';

    wrap.appendChild(el);
    wrap.appendChild(close);
    wrap.appendChild(resize);
    document.body.appendChild(wrap);

    const item = {id, type, src, x, y, w, h, el: wrap, loop, controls};

    if(type === 'video'){
      item.vc = VideoControls.attach(el, wrap);
      item.controls = controls;
    }

    wrap.addEventListener('mousedown', (e) => {
      if(e.target === close || e.target === resize) return;
      if(e.target.closest('.video-controls')) return;
      e.stopPropagation();
      startDrag(e, item);
    });
    wrap.addEventListener('touchstart', (e) => {
      if(e.target === close || e.target === resize) return;
      if(e.target.closest('.video-controls')) return;
      e.stopPropagation();
      startDrag(e, item);
    }, {passive: false});
    wrap.addEventListener('dblclick', (e) => { e.stopPropagation(); openSettings(item); });

    resize.addEventListener('mousedown', (e) => { e.stopPropagation(); e.preventDefault(); startResize(e, item); });
    resize.addEventListener('touchstart', (e) => { e.stopPropagation(); e.preventDefault(); startResize(e, item); }, {passive: false});

    State.mediaStore.push(item);
    syncPositions();
  }

  function startDrag(e, item){
    e.preventDefault();
    const p = getEventPoint(e);
    const world = Camera.screenToWorld(p.x, p.y);
    const offset = {x: world.x - item.x, y: world.y - item.y};

    function onMove(ev){
      const pp = getEventPoint(ev);
      const w = Camera.screenToWorld(pp.x, pp.y);
      item.x = w.x - offset.x;
      item.y = w.y - offset.y;
      syncPositions();
    }
    function onUp(){
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      Storage.save();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, {passive: false});
    document.addEventListener('touchend', onUp);
  }

  function startResize(e, item){
    const startX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const startW = item.w;
    function onMove(ev){
      const x = ev.clientX !== undefined ? ev.clientX : ev.touches[0].clientX;
      const dx = (x - startX) / State.camera.zoom;
      item.w = Math.max(60, startW + dx);
      syncPositions();
    }
    function onUp(){
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      Storage.save();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, {passive: false});
    document.addEventListener('touchend', onUp);
  }

  function openSettings(item){
    State.activeMediaId = item.id;
    const el = document.getElementById('mediaSettings');
    const isVideo = item.type === 'video';
    el.innerHTML = `
      <div class="ms-title">${isVideo?'Video':'Image'} settings</div>
      ${isVideo ? `
        <div class="ms-row"><label><input type="checkbox" id="msLoop" ${item.loop?'checked':''}> Loop</label></div>
        <div class="ms-row"><label><input type="checkbox" id="msControls" ${item.controls?'checked':''}> Show player controls</label></div>
      ` : ''}
      <div class="ms-size-row">
        <button class="ms-btn" id="msSmall">S</button>
        <button class="ms-btn" id="msMedium">M</button>
        <button class="ms-btn" id="msLarge">L</button>
        <button class="ms-btn" id="msXLarge">XL</button>
      </div>
      <div class="ms-row">
        <button class="ms-btn danger" id="msDelete" style="flex:1;justify-content:center"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
    const rect = item.el.getBoundingClientRect();
    let left = Math.min(rect.left, window.innerWidth - 220);
    let top = rect.top - 10;
    if(top < 10) top = 10;
    if(top + 200 > window.innerHeight) top = window.innerHeight - 210;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.classList.add('open');

    const loopEl = el.querySelector('#msLoop');
    if(loopEl){
      loopEl.onchange = () => {
        item.loop = loopEl.checked;
        const v = item.el.querySelector('video');
        if(v) v.loop = item.loop;
        Storage.save();
      };
    }
    const ctrlEl = el.querySelector('#msControls');
    if(ctrlEl){
      ctrlEl.onchange = () => {
        item.controls = ctrlEl.checked;
        const vc = item.el.querySelector('.video-controls');
        if(vc) vc.classList.toggle('show-controls', item.controls);
        Storage.save();
      };
    }
    const sizes = {msSmall: 120, msMedium: 250, msLarge: 400, msXLarge: 600};
    for(const [id, size] of Object.entries(sizes)){
      const btn = el.querySelector('#' + id);
      if(btn) btn.onclick = () => { item.w = size; syncPositions(); Storage.save(); };
    }
    el.querySelector('#msDelete').onclick = () => {
      item.el.remove();
      State.mediaStore = State.mediaStore.filter(m => m.id !== item.id);
      el.classList.remove('open');
      Storage.save();
    };
  }

  function syncPositions(){
    for(const m of State.mediaStore){
      const p = Camera.worldToScreen(m.x, m.y);
      m.el.style.left = p.x + 'px';
      m.el.style.top = p.y + 'px';
      m.el.style.transform = `scale(${State.camera.zoom})`;
      m.el.style.transformOrigin = '0 0';
      m.el.style.width = m.w + 'px';
    }
  }

  function prompt(type){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'video' ? 'video/*' : 'image/*';
    input.onchange = () => {
      const file = input.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const cw = Camera.screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
        addToStore(type, reader.result, 'm' + Date.now() + Math.random(), cw.x - 150, cw.y - 100, 300, 200, true, true);
        Storage.save();
        Canvas.render();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  return {addToStore, syncPositions, prompt, openSettings, startDrag, startResize};
})();