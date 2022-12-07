export default class ColumnChart {
    chartHeight = 50;
    innerBars = {};

    constructor( {
      data = [],
      label = "",
      value = 0,
      link  = "",
      formatHeading = data => data
      } = {} ) {
      
      this.data = data;
      this.label = label;
      this.value = formatHeading(value);
      this.link = link;;
      

      this.render();
      this.initEventListeners();
    };

    update( dataArr = [] ) {
      if (!this.data.length) {
        this.element.classList.add("column-chart_loading");
      }
      this.data = dataArr;

      this.innerBars.body.innerHTML = this.getChartBars( );
      //this.render();
    };

    getChartBars( ){
        
        if ( this.data.length == 0 ){
            return ''; //this.getDefaultBars( );
        }

        const maxHt = Math.max(...this.data);
        const barMax = this.chartHeight / maxHt;

        const resBar = this.data.map( ( item, curIndex ) => {
            //const hightPrc = Math.trunc( item / maxHt * 100 );
            const hightPrc = ( item / maxHt * 100 ).toFixed(0); 
            //const hightBar = hightPrc * this.chartHeight / 100;
            return  `<div style="--value: ${Math.floor(item * barMax)}" 
              data-tooltip="${hightPrc}%"></div>`;
        }).join('');
        return resBar;
    }

    getLink( ) {
      //console.log("link - "+this.link)
      if ( this.link != "" ) {
        return `<a class="column-chart__link" href="${this.link}">View all</a>`;
      } else {
        return '';
      }
    }

    getTemplate() {
      return `
      <div class="column-chart ${ this.data.length ? '' : 'column-chart_loading'}" 
          style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink( )}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartBars( )}
          </div>
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
      this.innerBars = this.getInnerBars( );
    }
    
    getInnerBars( ) {
      const result = {};
      const elems = this.element.querySelectorAll("[data-element]");

      for (const simpleElem of elems) {
        const name = simpleElem.dataset.element;

        result[name] = simpleElem;
      }

      return result;
    }

    initEventListeners() {
      // NOTE: в данном методе добавляем обработчики событий, если они есть
    }
  
    remove() {
      this.element.remove();
    }
  
    destroy() {
      this.remove();
      this.element = null;
      // NOTE: удаляем обработчики событий, если они есть
    }

    /*
    getFormating( ){
        if ( this.value == 0 ) {
            return '';
        } else {
            return this.value;
        }
       //return this.formatHeading(this.value);
    }
    */

    /*
    getChartBars( ){
        
        if ( this.length == 0 ){
            return ''; //this.getDefaultBars( );
        }
        
        let maxHt = 10;
        let maxWd = 9;
        const lolHt = 109;
        const totwd = 300;
        if ( this.data.length > 0 ) {
            maxHt = Math.max(...this.data);
        }
        maxWd = Math.trunc(totwd / this.data.length ) - 1;

        let resBar = this.data.map( ( item, curIndex ) => {
            //let curHt = Math.trunc( item / maxHt * 50 );
            //let curY = lolHt - curHt;
            let hightPrc = Math.trunc( item / maxHt * 100 ); 
            
            //return  `<rect x="${curIndex * ( maxWd + 1) }" y="${curY}"
            //   width="${maxWd}" height="${curHt}" fill="#ECEEF3"/>`;
            
               return  `<div style="--value: ${hightPrc}" 
               data-tooltip="${hightPrc}%"></div>`;
         }).join('');
         //resBar = `<svg width="299" height="109" viewBox="0 0 299 109" fill="none" 
         //xmlns="http://www.w3.org/2000/svg">` + resBar + `</svg>`;
 
         return resBar;
 
     }

    getTemplate2() {
      return `
      <div class="column-chart" style="--chart-height: 50">
        <div class="column-chart__title">
          Total ${this.display_obj.label}
          ${this.getLink( )}
        </div>
        <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.getFormating( )}</div>
        <div data-element="body" class="column-chart__chart">
          <svg column-chart_loading width="299" height="109" viewBox="0 0 299 109" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${this.getChartBars( )}
        </svg>
        </div>
        </div>
        </div>
        </div>
      `;
    }
    
    getDefaultBars( ){      
        let res =        
        `<rect y="59" width="9" height="50" fill="#ECEEF3"/>
        <rect x="10" y="74" width="9" height="35" fill="#ECEEF3"/>
        <rect x="20" y="87" width="9" height="22" fill="#ECEEF3"/>
        <rect x="30" y="70" width="9" height="39" fill="#ECEEF3"/>
        <rect x="40" y="87" width="9" height="22" fill="#ECEEF3"/>
        <rect x="50" y="79" width="9" height="30" fill="#ECEEF3"/>
        <rect x="60" y="70" width="9" height="39" fill="#ECEEF3"/>
        <rect x="70" y="59" width="9" height="50" fill="#ECEEF3"/>
        <rect x="80" y="98" width="9" height="11" fill="#ECEEF3"/>    
        <rect x="90" y="87" width="9" height="22" fill="#ECEEF3"/>
        <rect x="100" y="79" width="9" height="30" fill="#ECEEF3"/>
        <rect x="110" y="74" width="9" height="35" fill="#ECEEF3"/>
        <rect x="120" y="98" width="9" height="11" fill="#ECEEF3"/>
        <rect x="130" y="59" width="9" height="50" fill="#ECEEF3"/>
        <rect x="140" y="98" width="9" height="11" fill="#ECEEF3"/>
        <rect x="150" y="70" width="9" height="39" fill="#ECEEF3"/>
        <rect x="160" y="79" width="9" height="30" fill="#ECEEF3"/>
        <rect x="170" y="87" width="9" height="22" fill="#ECEEF3"/>
        <rect x="180" y="74" width="9" height="35" fill="#ECEEF3"/>
        <rect x="190" y="79" width="9" height="30" fill="#ECEEF3"/>
        <rect x="200" y="98" width="9" height="11" fill="#ECEEF3"/>
        <rect x="210" y="70" width="9" height="39" fill="#ECEEF3"/>
        <rect x="220" y="74" width="9" height="35" fill="#ECEEF3"/>
        <rect x="230" y="64" width="9" height="45" fill="#ECEEF3"/>
        <rect x="240" y="79" width="9" height="30" fill="#ECEEF3"/>
        <rect x="250" y="98" width="9" height="11" fill="#ECEEF3"/>
        <rect x="260" y="79" width="9" height="30" fill="#ECEEF3"/>
        <rect x="270" y="98" width="9" height="11" fill="#ECEEF3"/>
        <rect x="280" y="74" width="9" height="35" fill="#ECEEF3"/>
        <rect x="290" y="92" width="9" height="17" fill="#ECEEF3"/>
        </svg>`;

        if ( this.value == 0 ){
            res = res + `<rect width="147" height="24" fill="#F5F6F8"/>`;
        }
        res = `<svg class="column-chart_loading" width="299" height="109" viewBox="0 0 299 109" fill="none" 
                xmlns="http://www.w3.org/2000/svg">`
            + res + `</svg>`; 
                
        return  res;
        
        
    }*/    
  }
  
  /*
  const defaultComponent = new DefaultComponent();
  const element = document.getElementById("root");
  
  element.append(defaultComponent.element);
  */
