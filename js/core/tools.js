// Управление активным инструментом + история (undo).
const Tools = (function(){
  function setActive(tool){
    State.tool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
    const colorRow = document.getElementById('colorRow');
    if(tool === 'eraser' || tool === 'image' || tool === 'video') colorRow.style.display = 'none';
    else colorRow.style.display = 'flex';

    Dock.syncSettings();
    CursorRing.update();
  }

  function saveHistory(){
    if(State.historyIndex < State.history.length - 1){
      State.history = State.history.slice(0, State.historyIndex + 1);
    }
    State.history.push(JSON.parse(JSON.stringify(State.strokes)));
    if(State.history.length > State.MAX_HISTORY) State.history.shift();
    State.historyIndex = State.history.length - 1;
    Storage.save();
  }

  function undo(){
    if(State.historyIndex > 0){
      State.historyIndex--;
      State.strokes = JSON.parse(JSON.stringify(State.history[State.historyIndex]));
      Canvas.render();
      Storage.save();
    } else if(State.historyIndex === 0){
      State.strokes = JSON.parse(JSON.stringify(State.history[0]));
      Canvas.render();
      Storage.save();
    }
  }

  function initHistory(){
    State.history = [];
    State.historyIndex = -1;
    saveHistory();
  }

  return {setActive, saveHistory, undo, initHistory};
})();