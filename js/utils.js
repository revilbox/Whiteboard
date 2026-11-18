// Общие утилиты, доступные всем модулям.
const Utils = {
  isDark(bg){
    if(!bg) return true;
    if(State.bgImage) return true;
    const c = bg.replace('#','');
    if(c.length !== 6) return true;
    const r = parseInt(c.substr(0,2),16);
    const g = parseInt(c.substr(2,2),16);
    const b = parseInt(c.substr(4,2),16);
    return (r*299 + g*587 + b*114) / 1000 < 128;
  },
  hint(text){
    const toast = document.getElementById('hintToast');
    const span = document.getElementById('hintText');
    if(!toast || !span) return;
    span.textContent = text;
    toast.classList.add('show');
    clearTimeout(Utils.hint._t);
    Utils.hint._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }
};

function getEventPoint(e){
  if(e.touches && e.touches.length > 0) return {x: e.touches[0].clientX, y: e.touches[0].clientY};
  if(e.changedTouches && e.changedTouches.length > 0) return {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY};
  return {x: e.clientX, y: e.clientY};
}
