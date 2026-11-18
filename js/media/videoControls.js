// Оверлей управления видео — play/pause, прогресс, время.
const VideoControls = {
  attach(video, wrap){
    const vc = document.createElement('div');
    vc.className = 'video-controls show-controls';
    vc.innerHTML = `
      <button class="vc-play"><i class="fas fa-pause"></i></button>
      <div class="vc-progress"><div class="vc-bar"></div></div>
      <span class="vc-time">0:00</span>
    `;
    wrap.appendChild(vc);
    const playBtn = vc.querySelector('.vc-play');
    const progressBar = vc.querySelector('.vc-progress');
    const bar = vc.querySelector('.vc-bar');
    const timeEl = vc.querySelector('.vc-time');

    playBtn.onclick = (e) => {
      e.stopPropagation();
      if(video.paused) video.play(); else video.pause();
    };
    progressBar.onclick = (e) => {
      e.stopPropagation();
      const r = progressBar.getBoundingClientRect();
      const pct = (e.clientX - r.left) / r.width;
      video.currentTime = pct * video.duration;
    };
    video.addEventListener('timeupdate', () => {
      if(!video.duration) return;
      bar.style.width = (video.currentTime / video.duration * 100) + '%';
      const m = Math.floor(video.currentTime / 60);
      const s = Math.floor(video.currentTime % 60);
      timeEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    });
    video.addEventListener('play',  () => { playBtn.innerHTML = '<i class="fas fa-pause"></i>'; });
    video.addEventListener('pause', () => { playBtn.innerHTML = '<i class="fas fa-play"></i>'; });
    return vc;
  }
};