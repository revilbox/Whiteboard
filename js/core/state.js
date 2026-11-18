// Глобальный стейт. Все модули читают/пишут сюда.
const State = {
  camera: {x: 0, y: 0, zoom: 1},

  tool: 'pen',
  color: '#ffffff',
  size: 4,
  bg: '#0a0a0c',
  bgImage: null,
  accent: '#5865f2',

  showGrid: false,
  gridSize: 40,
  showZoom: true,

  // Drawing runtime
  isDrawing: false,
  isPanning: false,
  draggingPin: null,
  pinDragOffset: {x:0,y:0},
  pinOriginalPos: {x:0,y:0},
  panStart: {x:0,y:0},
  panStartCam: {x:0,y:0},
  startWorld: {x:0,y:0},
  lastWorld: {x:0,y:0},
  tempShape: null,
  currentPath: null,

  // Eraser
  eraserDownPos: {x:0,y:0},
  eraserMoved: false,
  eraserLastErasePos: {x:0,y:0},
  ERASER_MOVE_THRESHOLD: 3,

  // Text
  textPointerDownPos: null,
  textDownScreen: {x:0,y:0},

  // RMB
  rmbPanning: false,
  rmbPanStart: {x:0,y:0},
  rmbPanStartCam: {x:0,y:0},

  // Data
  strokes: [],
  history: [],
  historyIndex: -1,
  MAX_HISTORY: 50,
  mediaStore: [],
  activeMediaId: null,

  // UI state
  activeToolForSettings: null,
  settingsTimeout: null,
  activeTextEditor: null,
  cursorVisible: false,

  // Touch
  activeTouchId: null,
  touchState: null,
  touchMoved: false,

  // Tools
  toolDefs: [
    {id:'pen',    icon:'fa-pencil-alt', label:'Pen',    key:'1'},
    {id:'eraser', icon:'fa-eraser',     label:'Eraser', key:'2'},
    {id:'line',   icon:'fa-slash',      label:'Line',   key:'3'},
    {id:'rect',   icon:'fa-square',     label:'Rect',   key:'4'},
    {id:'circle', icon:'fa-circle',     label:'Circle', key:'5'},
    {id:'text',   icon:'fa-font',       label:'Text',   key:'6'},
    {id:'pin',    icon:'fa-thumbtack',  label:'Pin',    key:'7'},
    {id:'image',  icon:'fa-image',      label:'Image',  key:'8'},
    {id:'video',  icon:'fa-video',      label:'Video',  key:'9'},
    {id:'pan',    icon:'fa-hand-paper', label:'Pan',    key:'0'}
  ],
  visibleTools: ['pen','eraser','line','rect','circle','text','pin','image','video','pan']
};