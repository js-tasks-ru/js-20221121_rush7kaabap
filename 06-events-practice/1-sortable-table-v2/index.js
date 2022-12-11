export default class SortableTable {

  static directions = {
    asc: 1,
    desc: -1
  };

  static sortingType = {
    string: 'asString',
    number: 'asNumber'
  }

  isSortLocally = true;
  subElements = {};
  sortArrow; //{};
  rendered = false;
  evntHandlers = []; //[{"elem" : singleElem, "handler" : newHandler }]

  constructor(headersConfig, {
    data = [],
    sorted = { id : '', order : ''}
  } = {}) {
    this.config = headersConfig;
    this.originalData = data;
    this.data = [...data];
    this.sorted = { id : '', order : ''};

    if ( this.sorted.id === '' || 
      this.directions[this.sorted.order] === undefined ) {
        this.sorted = { id : this.config.find(item => item.sortable).id 
                      , order : 'asc' };
    }
    this.sort();
    this.render();
    this.initEventListeners();
  }

  setColumnArrow (){
    if (this.rendered) {
      if (this.sortArrow != undefined) {       
        this.sortArrow.querySelector(".sortable-table__sort-arrow").remove(); 
        this.sortArrow.dataset.order = '';
      }       
    } 

    const element = document.createElement("div");

    element.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
      <span class="sort-arrow"></span>
    </span>`;

    const elems = this.element.querySelectorAll("[data-id]");

    for (const singleElem of elems) {
      if ( this.sorted.id === singleElem.dataset.id ) {
        singleElem.append(element.firstElementChild);
        singleElem.dataset.order = this.sorted.order;
        this.sortArrow = singleElem;
        return;
      }
    }    
  }

  getHeaderTemplate(){
    const columnsList = this.config.map(item => {

      return `<div class="sortable-table__cell" data-id="${item.id}" 
        data-sortable="${item.sortable}" data-order="">
        <span>${item.title}</span>
      </div>`;
    });

    return columnsList.join('');
  };

  getRowsTemplate(){

    const rowsBody = this.data.map( (rowObject, confIndex) =>{
      const columnsData = this.config.map(columnCur => {
        if (columnCur.template === undefined) {
          return `<div class="sortable-table__cell">${rowObject[columnCur.id]}</div>`;
        } else {
          return columnCur.template(rowObject[columnCur.id]);
        }
      });      

      return `<a class="sortable-table__row">` + columnsData.join('') + `</a>`;
    });

    return rowsBody.join('');
  };

  getTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeaderTemplate()}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getRowsTemplate()}
          </div>  
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement("div"); // (*)

    element.innerHTML = this.getTemplate();

    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;
    this.setColumnArrow();
    this.subElements = this.getTableDOM( );

    this.rendered = true;
  }

  getTableDOM( ) {
    const result = {};
    const elems = this.element.querySelectorAll("[data-element]");

    for (const simpleElem of elems) {
      const name = simpleElem.dataset.element;

      result[name] = simpleElem;
    }

    return result;
  }

  sort () {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortOnServer(){

  }

  sortOnClient(){
    this._sort();
    if ( this.rendered ) {
      this._rerender( );
    }
    
  }
  
  initEventListeners() {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
    this._addListeners();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
    for (handler of this.evntHandlers ){
      //{"elem" : singleElem, "handler" : newHandler }
      handler["elem"].removeEventListener('pointerdown', handler["handler"]);
    } 
    
  }  

  _addListeners(){
    const elems = this.element.querySelectorAll("[data-id]");

    for (const singleElem of elems) {
      const sortableBool = (singleElem.dataset.sortable.toLowerCase() === "true");
      
      if (sortableBool){
        const newHandler = () => {
            this.sorted.id = singleElem.dataset.id;
            this.sorted.order =  (this.sorted.order === 'asc') ? 'desc': 'asc';
          this.sort( );
        };
        this.evntHandlers.pop({"elem" : singleElem, "handler" : newHandler });
        singleElem.addEventListener('pointerdown', newHandler);
      }
    }
  }

  _rerender( ){
    this.subElements.body.innerHTML = this.getRowsTemplate();
    // установить стрелку сортировки в заголовке таблицы
    this.setColumnArrow();
  }

  _sort( ){
    let direction = 0;
    let srtFunc;

    const fieldId = this.sorted.id;
    const sortOrder = this.sorted.order;
    for (const curColumn of this.config) {
      if (this.sorted.id != curColumn.id) continue;
      if (!curColumn.sortable || SortableTable.directions[this.sorted.order] === undefined ) {
        return; // do nothing
      }
      // отсортировать данные
      
      direction = SortableTable.directions[this.sorted.order];
      srtFunc = SortableTable.sortingType[curColumn.sortType];   
      break;
    } 

    if (srtFunc === undefined || direction === undefined) return; // do nothing   

    // this.originalData ->this.data
    this.data = [...this.originalData].sort((a, b)=>{
      switch(srtFunc) {
        case 'asString':
          return direction * a[fieldId].localeCompare( b[fieldId],
            ['ru','en'] ,
            {caseFirst: 'upper'});
        case 'asNumber':
          return direction * (a[fieldId] - b[fieldId]);
        default:
          return 0;
      }
    });
  }


}
