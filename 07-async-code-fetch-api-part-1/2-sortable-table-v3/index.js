import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  static directions = {
    asc: 1,
    desc: -1
  };

  static sortingType = {
    string: 'asString',
    number: 'asNumber'
  }

  //pageing (OData notation)
  pagingTop = 20;
  pagingSkip = 0;

  //rendering
  subElements = {};
  sortArrow; //{};
  rendered = false;

  // async markers
  asyncInLoading = false;

  // events
  evntSignal; //AbortController.signal

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc',
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      //const newOrder = toggleOrder( order );
      this.sorted = { id, order: toggleOrder(this.sorted.order) };
      this.sort();
    }
  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if ( bottom < document.documentElement.clientHeight 
      && !this.isSortLocally 
      && !this.asyncInLoading){ 
        // load additional data
      this.pagingSkip = this.pagingSkip + this.pagingTop;
      this.asyncInLoading = true;
      const startLine = this.pagingSkip;// + 1;
      const endLine = this.pagingSkip + this.pagingTop;// + 1;

      const data = await this.loadData( id, order, startLine, endLine);

      this.update( data );

      this._rerender();      
      this.asyncInLoading = false;
    }
  }

  constructor(headersConfig, {
    data = [],
    sorted = { id : '', order : ''},
    url = '',
    isSortLocally = false //true
  } = {}) {
    this.config = headersConfig;
    this.originalData = data;
    this.data = [...data];
    this.sorted = { id : '', order : ''};
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);

    if ( this.sorted.id === '' || 
      this.directions[this.sorted.order] === undefined ) {
        this.sorted = { id : this.config.find(item => item.sortable).id 
                      , order : 'asc' };
    }
    this.render();
  }

  async loadData( id, order, startLine, endLine){
    // _embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30
    const url = this.url;
    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', startLine);
    url.searchParams.set('_end', endLine);
    return await fetchJson(url);
  }

  update(dataObj = {}){
    this.originalData = dataObj;
    this.data = [...dataObj];
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

  async render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.setColumnArrow();
    this.subElements = this.getTableDOM( );

    this.rendered = true;
    await this.sort();
    this.initEventListeners();
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

  async sort () {
    if (this.isSortLocally) {
      this.sortOnClient(this.sorted.id, this.sorted.order);
    } else {
      await this.sortOnServer(this.sorted.id, this.sorted.order);
    }
  }

  sortOnClient (id, order) {
    this._sort();
    if ( this.rendered ) {
      this._rerender( );
    }
  }

  async sortOnServer (id, order) {
    this.asyncInLoading = true;

    const startLine = 0; //1
    const endLine = this.pagingSkip + this.pagingTop; // + 1;

    const data = await this.loadData( id, order, startLine, endLine);

    this.update( data );

    if ( this.rendered ) {
      this._rerender( );
    }

    this.asyncInLoading = false;
  }

  initEventListeners() {
    this.evntSignal = new AbortController();
    const { signal } = this.evntSignal;

    this.subElements.header.addEventListener('pointerdown', this.onSortClick, { signal });
    
    //global
    window.addEventListener('scroll', this.onWindowScroll, { signal }); 
  }

  remove() {
    if (this.element){
      this.element.remove();
    }
  }

  destroy() {
    // NOTE: удаляем обработчики событий, если они есть
    if (this.evntSignal){
      this.evntSignal.abort();
    }
    this.remove();
    this.element = null;   
    this.subElements = {}; 
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
