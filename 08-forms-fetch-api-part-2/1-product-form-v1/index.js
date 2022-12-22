import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  
  // events
  evntSignal; //AbortController.signal

  //rendering
  element;
  viewName = 'ProductForm';
  subElements = {};
  subStructural = ['productForm', 'imageListContainer']

  //toolbar buttons
  toolbar = {};  

  // async markers
  asyncInLoading = false;

  //local data
  viewModel;// = {};  
  defaultData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  //backend data
  OModel; // {}

  backendURLEntitySet = '/api/rest/products';
  entitySet = 'ProductSet';

  backendURLCategory = '/api/rest/categories';
  categorySet = 'CategorySet';  

  onProductSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  constructor (productId) {
    this.productId = productId;

    this.OModel = this.getJSONModel(); //backend data
    this.viewModel = this.getViewModel();
  }

  async render () {

    this.asyncInLoading = true;
    await this.loadData();
    this.asyncInLoading = false;      

    if (!!this.element) {
      this.rerender();
    } else {
      const element = document.createElement("div");

      element.innerHTML = this.getTemplate();
  
      this.element = element.firstElementChild;
      this.subElements = this.getSubelements();
      this.toolbar = this.getToolbar();
      this.initEventListeners();
    }
    return this.element;
  }

  getJSONModel() {
    if (!this.OModel) {
      this.OModel = {};
    }
    return this.OModel;
  }

  updateJSONModel(jsonBackend) { //[{'id': {}}...]
    // dummy
  }

  getViewModel() {
    if (!this.viewModel) {
      this.viewModel = {};
    }
    return this.viewModel;
  }

  getEntKey(entKey) {
    if (typeof entKey === 'string') {
      return entKey;
    }
  }

  async save() {
    this.transferToModel(this.viewModel.product);
    await this.commitChanges(this.viewModel.product);
  }

  dispatchEvent(name = 'custom-event', message) {
    this.element.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: message
    }));
  }

  omitObjectFields(obj, ...fields) {
    const resObj = {};

    const arKeys = Object.keys(obj);
    arKeys.forEach(element => {
      if (!fields.includes(element)) {
        resObj[element] = obj[element];
      }          
    });
    return resObj;
  }

  async commitChanges(changesModel) {
    const url = new URL(this.backendURLEntitySet, BACKEND_URL);
    let prodData = this.omitObjectFields(changesModel, 'brand', 'characteristics', 'rating');
    prodData.quantity = +prodData.quantity;
    prodData.status = +prodData.status;
    prodData.price = +prodData.price;
    prodData.discount = +prodData.discount;

    prodData = JSON.stringify(prodData);
    const response = await fetch(url.href, {
      method: (!this.productId) ? "PUT" : "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: prodData 
    });
    /*
    if (response.status != 200) {
      console.log('Patching error');
      return;
    }*/
    const result = await response.json();

    if (this.productId) {
      this.dispatchEvent('product-updated', this.productId);
    } else {
      this.dispatchEvent('product-saved', changesModel.productId);
      this.updateJSONModel(result.message);
    }
  }

  async loadData() {
    const categoryPromise = this.loadCategories();
    
    const productPromise = this.productId 
      ? this.loadProduct()
      : Promise.resolve(this.defaultData);

    try {
      const [categData, prdData] = await Promise.all([
        categoryPromise, productPromise]);
    
      this.viewModel.product = prdData[0];
      this.viewModel.categories = categData;

      // save as OData entity
      let key = this.getEntKey(this.entitySet); //'productES' + this.productId;
      if (!this.OModel[key]) {
        this.OModel[key] = {};
      }      
      if (!!prdData && prdData.length && !!this.productId) {
        prdData.map((item) => { this.OModel[key][item.id] = item; });
      //this.OModel[key][this.productId] = prdData[0];
      } else if (!!this.OModel[key][this.productId]) {
        delete this.OModel[key][this.productId];
      }    
    
      key = this.getEntKey(this.categorySet); 
      if (!this.OModel[key]) {
        this.OModel[key] = {};
      }
      categData.map((item) => { this.OModel[key][item.id] = item; });
    } catch (error) {
      console.log('loading error');
    }    
  }

  async loadProduct() {
    const url = new URL(this.backendURLEntitySet, BACKEND_URL);

    url.searchParams.set('id', this.productId);
    return await fetchJson(url);
  }

  async loadCategories() {
    // 
    const url = new URL(this.backendURLCategory, BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    // сконвертировать {id ....} => 'id' = {};
    return await fetchJson(url);
  }

  async update(productId) {
    this.productId = productId;

    this.rerender();
  }

  transferToJSONModel() {
    const entKey = this.getEntKey(this.entitySet); //'productES' + this.productId;
    if (!!this.OModel[key]) { this.OModel[key] = {};}

    for (const [elemKey, elemHtml] of Object.entries(this.subElements)) {
      this.OModel[key][this.productId][elem] = elemHtml.value;
    }
  }

  transferToModel(model) { // = {}
    //productForm;
    for (const [elemKey, elemHtml] of Object.entries(this.subElements)) {
      if (!this.subStructural.includes(elemKey)) {
        model[elemKey] = elemHtml.value;
      }
    }
  }

  rerender() {
    // replace data in this.subElements too hard for the simple task, 
    // let's draw brand new (no listeners activated) 
    element.innerHTML = this.getTemplate();

    this.subElements = this.getSubelements();
    this.toolbar = this.getToolbar();
    this.initEventListeners();
  }

  getToolbar() {
    const result = {};
    const elems = this.element.querySelectorAll("[data-toolbar]");

    for (const simpleElem of elems) {
      const name = simpleElem.dataset.toolbar; //dataset.element;
      // в элементе хранится тип и привязка к модели, так что отдельные атрибуты не делаем
      result[name] = simpleElem; 
    }    
    return result;
  }

  getSubelements() {
    const result = {};
    const elems = this.element.querySelectorAll(".form-control");
    //console.log(elems)
    for (const simpleElem of elems) {
      const name = simpleElem.name; //dataset.element;
      // в элементе хранится тип и привязка к модели, так что отдельные атрибуты не делаем
      result[name] = simpleElem; 
    }

    let els = this.element.querySelectorAll("[data-element]"); 
    for (const simpleElem of els) {
      if (simpleElem.dataset.element === "productForm") {
        result.productForm = simpleElem;
      }
      if (simpleElem.dataset.element === "imageListContainer") {
        result.imageListContainer = simpleElem;
      }
    }
    return result;
  }

  getElementValue(option = {}) {
    if (!!option['data-model']) {
      return (this.viewModel.product)
        ? this.viewModel.product[option['data-model']]
        : undefined;
    }  
  }

  renderLebel(label) {
    return `<label class="form-label">${label}</label>`;
  }

  renderInput(name, type = "text", option = {}, model = {}) {
    const elemArray = [];
    elemArray.push(`<input`);
    elemArray.push(`id="${name}"`);
    elemArray.push(`type="${type}"`);
    elemArray.push(`name="${name}"`);
    elemArray.push(`class="form-control"`);
    for (const [key, value] of Object.entries(option)) {
      elemArray.push(`${key}="${value}"`);
    } 
    for (const [optKey, optValue] of Object.entries(model)) {
      elemArray.push(`${optKey}="${optValue}"`);
    }       
    const elemVal = this.getElementValue(model);
    if (elemVal != undefined) {
      elemArray.push(`value="${escapeHtml(elemVal.toString())}"`);
    }
    elemArray.push(`>`);
    
    return elemArray.join(' ');
  }

  renderTextArea(name, option = {}, model = {}) {
    const elemArray = [];
    elemArray.push(`<textarea`);
    elemArray.push(`name="${name}"`);
    elemArray.push(`id="${name}"`);
    elemArray.push(`class="form-control"`);
    for (const [key, value] of Object.entries(option)) {
      elemArray.push(`${key}="${value}"`);
    }
    for (const [optKey, optValue] of Object.entries(model)) {
      elemArray.push(`${optKey}="${optValue}"`);
    }       
    elemArray.push(`>`);    
    // same as renderModelValue
    const elemVal = this.getElementValue(model);
    if (elemVal != undefined) {
      elemArray.push(`${escapeHtml(elemVal.toString())}`);
    }
    elemArray.push(`</textarea>`);

    return elemArray.join(' ');
  }

  renderSelect(name, options = {}, model = {}) {
    const elemArray = [];
    elemArray.push(`<select class="form-control"`);
    elemArray.push(`name="${name}"`);
    elemArray.push(`id="${name}"`);

    for (const [optKey, optValue] of Object.entries(options)) {
      elemArray.push(`${optKey}="${optValue}"`);
    }    
    for (const [optKey, optValue] of Object.entries(model)) {
      elemArray.push(`${optKey}="${optValue}"`);
    } 

    let selectedValue = this.getElementValue(model);
    if (selectedValue === undefined) {
      selectedValue = '';
    } else { selectedValue = selectedValue.toString();}
    elemArray.push(`class="form-control">`);
    for (const [optKey, optValue] of Object.entries(options)) {
      elemArray.push(`<option value="${optKey}" ${selectedValue === optKey ? 'selected' : ''}>
        ${escapeHtml(optValue.toString())}</option>`);
    }
    elemArray.push(`</select>`);

    return elemArray.join(' ');
  }

  renderImageContainer(name, option = {}, model = {}) {
    const elemArray = [];
    if (!!option.lebel) {
      elemArray.push(`${this.renderLebel(option.lebel)}`);
    }
    elemArray.push(`<div data-element="imageListContainer">`);
    elemArray.push(`<ul class="sortable-list">`);
    const imageArray = this.getElementValue(model);
    imageArray.map((singlePhoto, index) => {
      elemArray.push(`<li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${singlePhoto.url}">
      <input type="hidden" name="source" value="${singlePhoto.source}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${singlePhoto.url}">
        <span>${singlePhoto.source}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>`);
    });
    elemArray.push(`</ul>`);    
    elemArray.push(`</div>`);
    if (!!option.addButton) {
      elemArray.push(`${this.renderLebel(option.lebel)}`);
      elemArray.push(`<button type="button" name="uploadImage" class="button-primary-outline">
            <span>${option.addButton}</span></button>`);
    }
    return elemArray.join(' ');     
  }

  getTemplate() {
    return `<div class="product-form">
  <form data-element="productForm" class="form-grid">
    <div class="form-group form-group__half_left">
      <fieldset>
        ${this.renderLebel("Название товара")}
        ${this.renderInput("title", "text", { placeholder: "Название товара" },
    { 'data-model': 'title'})}
      </fieldset>
    </div>
    <div class="form-group form-group__wide">
      ${this.renderLebel("Описание")}
      ${this.renderTextArea("description", { placeholder: "Описание товара", 
    'data-element': "productDescription"},
  { 'data-model': "description" })}
    </div>
    <div class="form-group form-group__wide" data-element="sortable-list-container">
      ${this.renderImageContainer("images", {lebel: "Фото"}, {'data-model': "images" })}
      
    </div>
    <div class="form-group form-group__half_left">
      ${this.renderLebel("Категория")}
      ${this.renderSelect('subcategory', this.getPlainSubcategories(),
    {'data-model': "subcategory" })}
    </div>
    <div class="form-group form-group__half_left form-group__two-col">
      <fieldset>
        ${this.renderLebel("Цена ($)")}
        ${this.renderInput("price", "number", { placeholder: "100"},
    { 'data-model': "price" })}
      </fieldset>
      <fieldset>
        ${this.renderLebel("Скидка ($)")}
        ${this.renderInput("discount", "number", { placeholder: "0"},
    { 'data-model': "discount" })}
      </fieldset>
    </div>
    <div class="form-group form-group__part-half">
      ${this.renderLebel("Количество")}
      ${this.renderInput("quantity", "number", { placeholder: "1"},
    { 'data-model': "quantity"})}
    </div>
    <div class="form-group form-group__part-half">
      ${this.renderLebel("Статус")}
      ${this.renderSelect('status', this.getStatusValues(),
    {'data-model': "status" })}
    </div>
    <div class="form-buttons">
      <button type="submit" name="save" class="button-primary-outline" 
        data-toolbar="submit">
        Сохранить товар
      </button>
    </div>
  </form>
</div>`;
  }

  getStatusValues() {
    return { "1": 'Активен', "0": 'Неактивен'};
  }

  getPlainSubcategories() {
    const subcatsList = {};
    if (this.viewModel.categories) {
      for (const [catId, catValue] of Object.entries(this.viewModel.categories)) {
        catValue.subcategories.map((item => subcatsList[item.id] = catValue.title + ' > ' + item.title));
      }        
    }
    return subcatsList;
  }

  initEventListeners() {
    if (!this.evntSignal) {
      this.evntSignal = new AbortController();
    }

    const { signal } = this.evntSignal;

    if (!!this.toolbar.submit) {
      this.toolbar.submit.addEventListener('click', this.onProductSubmit, { signal });
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    // NOTE: удаляем обработчики событий, если они есть
    if (this.evntSignal) {
      this.evntSignal.abort();
    }
    this.remove();
    this.element = null;   
    this.subElements = {}; 
  }  
}
