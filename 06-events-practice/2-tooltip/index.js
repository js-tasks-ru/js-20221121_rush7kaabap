class Tooltip {
  //subElements = {};
  static toolTipData;
  static evntHandlers = []; //[{"elem" : singleElem, "handler" : newHandler }]
  static moveEvent = [];  //[{"elem" : singleElem, "handler" : newHandler }]
  static renderedElem;
  static Instance;

  constructor() {
    if (Tooltip.Instance) {
      return Tooltip.Instance;
    } else {
      Tooltip.Instance = this;
    }
  }

  initialize () {
    this.initEventListeners();
  }

  getTemplate() {
    return `<div class="tooltip">${Tooltip.toolTipData}</div>`;
  }

  render() {
    const element = document.createElement("div"); // (*)

    element.innerHTML = this.getTemplate();

    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;
    Tooltip.renderedElem = this.element; //element.firstElementChild;

    document.body.append(Tooltip.renderedElem);
  }
  
  onMouseOver(event) {
    let target = event.target;
    if (Tooltip.Instance){
      Tooltip.Instance.remove();
    }

    // если у нас есть подсказка...
    let tooltipHtml = target.dataset.tooltip;
    if (!tooltipHtml) return;

    Tooltip.toolTipData = target.dataset.tooltip;
    Tooltip.Instance.render();
    
    let left = event.clientX + 10;
    if (left < 0) left = 0; // не заезжать за левый край окна
    
    let top = event.clientY + 5;
    if (top < 0) { // если подсказка не помещается сверху, то отображать её снизу
      const coords = target.getBoundingClientRect();
      top = coords.top + target.offsetHeight + 5;
    }    
    
    Tooltip.renderedElem.style.left = left + 'px';
    Tooltip.renderedElem.style.top = top + 'px';

    if ( Tooltip.moveEvent.length === 0 ) {
    document.addEventListener('pointermove', Tooltip.Instance.onMouseMove); //JS style
    Tooltip.moveEvent = [{"elem" : document,
                           "evnt":"pointermove",
                       "handler" : Tooltip.Instance.onMouseMove }];
    }
  };

  onMouseOut(event) {
    if (Tooltip.Instance){
      Tooltip.Instance.remove();
    }
    Tooltip.toolTipData = null;
    
    for (let handler of Tooltip.moveEvent ){
      handler["elem"].removeEventListener(handler["evnt"], handler["handler"]);
    } 
    Tooltip.moveEvent = [];    
  };

  onMouseMove(event) {
    if (Tooltip.toolTipData) {
      let left = event.clientX + 10;
      if (left < 0) left = 0; // не заезжать за левый край окна
      
      let top = event.clientY + 5;
      if (top < 0) { // если подсказка не помещается сверху, то отображать её снизу
        const coords = target.getBoundingClientRect();
        top = coords.top + target.offsetHeight + 5;
      }    
      
      Tooltip.renderedElem.style.left = left + 'px';
      Tooltip.renderedElem.style.top = top + 'px';
    }

  };
  
  initEventListeners() {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
    this._addDelegatedListener();
  }

  remove() {
    if (Tooltip.renderedElem != undefined &&
        Tooltip.renderedElem != null ) {
      Tooltip.renderedElem.remove();
    }
  }

  destroy() {
    if (Tooltip.Instance) {
      Tooltip.Instance.remove();
    }

    // NOTE: удаляем обработчики событий, если они есть
    for (let handler of Tooltip.evntHandlers ){
      handler["elem"].removeEventListener(handler["evnt"], handler["handler"]);
    } 
    
    for (let handlerM of Tooltip.moveEvent ){
      handlerM["elem"].removeEventListener(handlerM["evnt"], handlerM["handler"]);
    }     

    Tooltip.renderedElem = null;
    Tooltip.Instance = null;
  }  

  _addDelegatedListener() {
    document.addEventListener('pointerover', Tooltip.Instance.onMouseOver); //JS style
    Tooltip.evntHandlers.push({"elem" : document, 
                               "evnt": 'pointerover', 
                           "handler" : Tooltip.Instance.onMouseOver });

    document.addEventListener('pointerout', Tooltip.Instance.onMouseOut); //JS style
    Tooltip.evntHandlers.push({"elem" : document,
                               "evnt": 'pointerout',
                           "handler" : Tooltip.Instance.onMouseOver });
  }

}

export default Tooltip;
