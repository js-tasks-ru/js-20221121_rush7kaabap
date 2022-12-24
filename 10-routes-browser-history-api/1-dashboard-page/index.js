import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  // events
  evntSignal; //AbortController.signal

  //rendering
  element;
  subElements = {};

  components = {};

  url = new URL('api/dashboard/bestsellers', BACKEND_URL);

  constructor({
    from = new Date(Date.now() - 2592e6),
    to = new Date()} = {}) {

    this.range = { from, to };
  }

  getTemplate() {
    return `<div class="dashboard full-height flex-column">
        <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        </div>
        <div class="dashboard__charts"></div>        
        <h3 class="block-title">Sales leaders</h3>
    </div>`;
  }

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();  
    this.element = element.firstElementChild;
    this.subElements = this.getSubelements();    

    this.components.rangePicker = new RangePicker(this.range);
    
    this.subElements.rangePicker.firstElementChild.after(
      this.components.rangePicker.element);
    
    this.components.ordersChart = new ColumnChart({
      url: "/api/dashboard/orders",
      range: this.range,
      label: "Orders",
      link: "/sales"
    });   
    this.components.ordersChart.render();
    this.components.ordersChart.element.classList.add('dashboard__chart_orders');
    const charts = this.element.querySelector(".dashboard__charts");

    charts.append(this.components.ordersChart.element);
    this.subElements.ordersChart = this.components.ordersChart.element;

    this.components.salesChart = new ColumnChart({
      url: "/api/dashboard/sales",
      range: this.range,
      label: "Sales"
    });   
    this.components.salesChart.render();
    this.components.salesChart.element.classList.add('dashboard__chart_sales');

    charts.append(this.components.salesChart.element);
    this.subElements.salesChart = this.components.salesChart.element;

    this.components.customersChart = new ColumnChart({
      url: "/api/dashboard/customers",
      range: this.range,
      label: "Customers"
    });   
    this.components.customersChart.render();
    this.components.customersChart.element.classList.add('dashboard__chart_customers');

    charts.append(this.components.customersChart.element);
    this.subElements.customersChart = this.components.customersChart.element;

    this.components.leaders = new SortableTable(
      header, //
      { url: `/api/dashboard/bestsellers? 
          from=${this.range.from.toISOString()}
          &to=${this.range.to.toISOString()}`,
        isSortLocally: true
      }
    );

    this.element.append(this.components.leaders.element);  
    this.subElements.sortableTable = this.components.leaders.element;

    this.initEventListeners();   
    return this.element;
  }

  getSubelements() {
    const result = {};
    result.rangePicker = this.element.querySelector(".content__top-panel");
    return result;
  }

  onRangePickerUpdate(event) {
    this.range = event.detail;
    this.updateComponents(event.detail.from, event.detail.to);
  }

  async updateComponents(beginDate, endDate) {

    const leadersData = await this.loadData(beginDate, endDate);
    
    this.components.leaders.addRows(leadersData);
    const sorted = this.components.leaders.sorted;
    this.components.leaders.sortOnClient(sorted.id, sorted.order);

    this.components.ordersChart.update(beginDate, endDate);
    this.components.salesChart.update(beginDate, endDate);
    this.components.customersChart.update(beginDate, endDate);
  }

  loadData(beginDate, endDate) {
    this.url.searchParams.set('from', beginDate.toISOString());
    this.url.searchParams.set('to', endDate.toISOString());
    return fetchJson(this.url.toString());
  }

  initEventListeners() {
    this.evntSignal = new AbortController();
    const { signal } = this.evntSignal;

    this.components.rangePicker.element.addEventListener("date-select", 
      (event) => {this.onRangePickerUpdate(event);}, { signal });
  }
    
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
    
  destroy() {
    if (this.evntSignal) {
      this.evntSignal.abort();
    }        
    this.remove();
    this.element = null;
    this.subElements = {};

    for (const comp in this.components) {
      this.components[comp].destroy();  
    }
  }     
}
