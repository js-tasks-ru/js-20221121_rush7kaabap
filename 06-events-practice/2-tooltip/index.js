class Tooltip {
  static instance;

  //toolTipData;
  evntHandlers = []; //[{"elem" : singleElem, "handler" : newHandler }]
  //moveEvent = [];  //[{"elem" : singleElem, "handler" : newHandler }]
  element;
  
  onPointerOver = event => {
    const element = event.target.closest('[data-tooltip]');
    if (element) {
      this.render( element.dataset.tooltip );
      document.addEventListener('pointermove', this.onPointerMove);
    }
  };

  onPointerMove = event => {
    this.moveTooltip(event);
  }

  onPointerOut = event => {
    const element = event.target.closest('[data-tooltip]');
    if (element) {
      this.remove();
      document.removeEventListener('pointermove', this.onPointerMove);
    }
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    } 
    
    Tooltip.Instance = this;
  }

  initialize () {
    this.initEventListeners();
  }

  initEventListeners(){
    document.addEventListener('pointerover', this.onPointerOver); //JS style
    this.evntHandlers.push({"elem" : document, 
                             "evnt": 'pointerover', 
                         "handler" : this.onPointerOver });

    document.addEventListener('pointerout', this.onPointerOut); //JS style
    this.evntHandlers.push({"elem" : document,
                             "evnt": 'pointerout',
                         "handler" : this.onPointerOut });
  }

  render(tooltip = '') {
    this.element = document.createElement("div"); 
    this.element.className = 'tooltip';
    this.element.innerHTML = tooltip;

    document.body.append(this.element);
  }
  
  moveTooltip(event){
    const target = event.target;
    let left = event.clientX + 10;
    if (left < 0) left = 0; // не заезжать за левый край окна
    
    let top = event.clientY + 5;
    if (top < 0) { // если подсказка не помещается сверху, то отображать её снизу
      const coords = target.getBoundingClientRect();
      top = coords.top + target.offsetHeight + 5;
    }    

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
  }

  remove() {
    if (this.element ) {
      this.element.remove();
    }
  }

  destroy() {
    // NOTE: удаляем обработчики событий, если они есть
    for (let handler of Tooltip.evntHandlers ){
      handler["elem"].removeEventListener(handler["evnt"], handler["handler"]);
    } 

    this.remove();
    this.element = null;    
  }
}

export default Tooltip;
