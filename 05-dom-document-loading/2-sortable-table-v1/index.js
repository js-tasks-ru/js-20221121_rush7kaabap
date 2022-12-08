export default class SortableTable {
  static directions = {
    asc: 1,
    desc: -1
  };

  static sortingType = {
    string: 'asString',
    number: 'asNumber'
  }

  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.config = headerConfig;
    this.originalData = data;
    this.data = [...data];
    this.sorted = { id : '', order : ''};
    
    this.render();
    this.initEventListeners();
  };

  getHeaderTemplate(){
    const columnsList = this.config.map(item => {
      let column = '';
      let srt_order ='';
      if (this.sorted.id === item.id){
        column = `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
        srt_order = this.sorted.order;
      }
      
      return `<div class="sortable-table__cell" data-id="${item.id}" 
        data-sortable="${item.sortable}" data-order="${srt_order}">
        <span>${item.title}</span>
        ${column}
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
          //return `<div class="sortable-table__cell">some image</div>`;
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
    this.subElements = this.getTableDOM( );
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

  sort(fieldId = '', sortOrder = 'asc'){
    this._sort(fieldId, sortOrder);
    this._rerender( );
  }
  
  _get_first_sortable_filed( ){
    for (const curColumn of this.config) {
      if (!curColumn.sortable) {
        continue; // do nothing
      }
      return curColumn.id;
    } 
  }

  _rerender( ){
    this.subElements.body.innerHTML = this.getRowsTemplate();
    // установить стрелку сортировки в заголовке таблицы
    this.subElements.header.innerHTML = this.getHeaderTemplate();
  }

  _sort(fieldId = '', sortOrder = 'asc'){
    let direction = 0;
    let srtFunc;
    for (const curColumn of this.config) {
      if (fieldId != curColumn.id) continue;
      if (!curColumn.sortable || SortableTable.directions[sortOrder] === undefined ) {
        return; // do nothing
      }
      // отсортировать данные
      direction = SortableTable.directions[sortOrder];
      srtFunc = SortableTable.sortingType[curColumn.sortType];   
      break;
    } 

    if (srtFunc === undefined || direction === undefined) return; // do nothing   
    this.sorted.id = fieldId;
    this.sorted.order = sortOrder;

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

  initEventListeners() {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }

}

