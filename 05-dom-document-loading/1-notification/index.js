export default class NotificationMessage {
    static displayed = false;
    static innerNotif;
    static displayTimeout; // Date()

    constructor( text = '', {
        duration = 1000,
        type  = 'success'
        } = {} ) {

        this.text = text;
        this.duration = duration;
        this._timeDur = (duration / 1000).toFixed(0);
        this.mesType = type
        
        //this.render();
        this.initEventListeners();
    }
    
    getTemplate() {
        return `
        <div class="notification ${this.mesType}" 
            style="--value:${this._timeDur}s">
          <div class="timer">
          </div>
          <div class="inner-wrapper">
            <div class="notification-header">
                ${this.mesType}
            </div>
            <div class="notification-body">
                ${this.text}
            </div>
          </div>
        </div>
        `;
    }
    
    render() {
        const element = document.createElement("div"); // (*)
    
        element.innerHTML = this.getTemplate();
        //console.log(this._timeDur);
        // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
        // который мы создали на строке (*)
        this.element = element.firstElementChild;
    }

    show( parentElement = undefined ){

        if(NotificationMessage.displayed) {
            NotificationMessage.innerNotif.remove( );
        }
        this.render();
        if (parentElement == undefined ){
            document.body.append(this.element);
        } else {
            parentElement.append(this.element);
        }        
   
        NotificationMessage.innerNotif = this.element
        NotificationMessage.displayed = true;   
        
        let outDate = new Date();
        //console.log(+(outDate));
        NotificationMessage.displayTimeout = +(outDate) + this.duration;   

        //console.log(NotificationMessage.displayTimeout + " this.duration=" + this.duration);    
        setTimeout(this.removeMethod.bind(this), this.duration); 
    }

    removeMethod(){
        //NOTE: здесь должна быть функция, планирующая удалить элемент по таймауту
        // и сбросить флаг показа
        const timeOut = +(new Date());
        //console.log(timeOut + " removeOnTimeOut");
        if ( NotificationMessage.displayTimeout <= timeOut ) {
            NotificationMessage.innerNotif.remove( );
            NotificationMessage.displayed = false;   
        }
    }

    initEventListeners() {
        // NOTE: в данном методе добавляем обработчики событий, если они есть
    }

    destroy() {
        if (this.element != undefined){
            this.element.remove();
            //this.removeMethod();
        }        
        // NOTE: удаляем обработчики событий, если они есть
    }    
}
