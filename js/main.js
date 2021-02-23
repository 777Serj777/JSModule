
const cElem = (nameTag, nameClass) => {

    let element = document.createElement(nameTag);

    if(!nameClass) return element;

    nameClass.split(" ").forEach(item => {
        element.classList.add(item);
    });

    return  element;

}

class EventPlanner {

    #arrEvent = [
        {start: 0, duration: 15, title: 'Exercise'},
        {start: 25, duration: 30, title: 'Treval to work'},
        {start: 30, duration: 30, title: 'Plan day'},
        {start: 60, duration: 15, title: 'Review yesterday\'s commits'},
        {start: 100, duration: 15, title: 'Code review'},
        {start: 180, duration: 90, title: 'Have Lunch with John'},
        {start: 360, duration: 30, title: 'Skype call'},
        {start:  370, duration: 45, title: 'Follow up with designer'},
        {start:  405, duration: 30, title: 'Skype ddd call'}
    ];
    #listEvent = [];
    
    constructor(){
        this.container = document.querySelector('.calendar');   
        this.renderCalendar(this.container);
        this.#listEvent = this.getEvent;
        this.renderEvent(this.#listEvent);
    }
    set setEvent({event, index}){
        
        if(index !== undefined){          
            this.#arrEvent[index] = event;
            return;
        }
       
        this.#arrEvent.push(event);
    }
    
    get getEvent(){
        return this.#arrEvent.map(item => {
            return {...item}
        });
    }
    setStatus(eventProperty, index){
       
        if(!(eventProperty instanceof Array) ){
         
            let {start, duration, title, color} = eventProperty;
            let event = {start, duration, title};

            this.setEvent = {event, index};
            
            if(index !== undefined){
                this.#listEvent[index] = {color, ...event}
            }
            else{
                this.#listEvent.push({color, ...event});
            }
        }

        this.renderEvent(this.#listEvent);
    }
    _createTimeline(){

        let wrapper = cElem('ul', 'calendar__list-time');

        for (let index = 1; index <= 17; index++) {
  
            let hour = cElem('li', 'calendar__hour');
            let half = cElem('li', 'calendar__half-hour');
      
            hour.innerText = `${index}:00`;
            wrapper.append(hour);

            if(index < 17) {
                half.innerText = `${index}:30`;
                wrapper.append(half);            
            }      
        }

        return wrapper;

    }
    createBtnAddEvent(){
    
        let btnAddEvent = cElem('button', 'calendar__btn');

        btnAddEvent.innerText = "+";

        btnAddEvent.addEventListener('click', () => {this.renderFormToAddEvent()});
        
        return btnAddEvent;
    }

    renderFormToAddEvent(config){

        let formForAddEvent = cElem('form', 'calendar__form-add-event');

        formForAddEvent.innerHTML = `
            <label for="calendar__input-time" class="calendar__label-time">Time</label>
            <input type="time" name = "time" class="calendar__input-time" min="01:00" max="16:59" required>
            <label for="calendar__input-duration" class="calendar__label-time">Duration</label>
            <input type="time" name = "duration" class="calendar__input-duration" min="00:00" max="17:00" required>
            <input type="text" name = "text" class="calendar__input-text">
            <input type="color" name = "color" value = "#6E9ECF" class="calendar__input-text">
            <input type="submit" name = "create" value = "Create">
        `;

        if(config){
            formForAddEvent.time.value = config.start;
            formForAddEvent.duration.value = config.duration;
            formForAddEvent.text.value = config.title;
            formForAddEvent.color.value = config.color;
            formForAddEvent.create.value = 'Change';
            let del = cElem('input');
            del.value = 'Delete';
            del.name = 'delete';
            del.type = 'submit';
            formForAddEvent.append(del)
          
            formForAddEvent.elements.delete.addEventListener('click', (e) => {
                e.preventDefault();      
                this.removeEvent(config.index);
                btn.click();
            });
        }

        let btn = cElem('div', 'calendar__btn-close')
        btn.innerHTML= '&times;'

        btn.addEventListener('click', () => {
            formForAddEvent.remove();
        });
 
     

        formForAddEvent.elements.create.addEventListener('click', (e) => {
            e.preventDefault();
            
            if(formForAddEvent.elements.create.value === 'Create'){
                if(!this._addNewEvent(formForAddEvent.elements)) return;
            }
            if(formForAddEvent.elements.create.value === 'Change'){
                if(!this.changeEvent(formForAddEvent.elements, config.index)) return;
            }
            
            btn.click();
        });

        formForAddEvent.append(btn);
        this.container.append(formForAddEvent);
    }
    changeEvent(elements, indexChangeElem){
        
        let event = this._addNewEvent(elements, true);
       
        this.setStatus(event, indexChangeElem);
      
        return true;
    }
    removeEvent(index){
        this.#arrEvent.splice(index, 1);
        this.#listEvent.splice(index, 1);
        this.setStatus(this.#listEvent);
    }
    _addNewEvent(elements, change){

        if(!elements.time.validity.valid) return false;

        let haveTime =  17 * 60;
        let time = elements.time.value.split(':');
        let duration = elements.duration.value.split(':');

        time = ((+time[0] * 60)) + (+time[1]);
        duration = (+duration[0] * 60) + +duration[1];

        if(duration + time > haveTime) return false;
 
        let event = {
            start: time - 8 * 60,
            duration: duration,
            title: elements.text.value,
            color: elements.color.value
        }

        if(change) return event;

        this.setStatus(event);

        return true;
    }
    _createEvent(listEvent){
    
        const minuteInPixels = document.querySelector('.calendar__hour').clientHeight * 2 / 60;
   
        listEvent = listEvent.map((event, index) => {

            return {
                start : (7 * 60 + event.start) * minuteInPixels,
                duration : event.duration * minuteInPixels,
                title: event.title,
                color : event.color || '#6E9ECF',
                left: 0,
                width: 100,
                arrElemBefore: [],
                arrElemAfter: [],
                index: index
            }      
        })

        .sort((a, b) => a.start - b.start);

        listEvent.forEach((item, index, arr) => {
          
            let {start, duration} = item;
            let end = start + duration;

            for (let i = index; i >= 0; i--) {

                if(i === index) continue;

                if(start < (arr[i].duration + arr[i].start)){
                    item.arrElemBefore.push(arr[i]);   
                    if(end > (arr[i].duration + arr[i].start) ) end = (arr[i].duration + arr[i].start);
                } 
            }
            for (let i = index; i < arr.length; i++) {   
      
                if(i === index) continue;
              
                if(listEvent[i].start < end){
                    item.arrElemAfter.push(listEvent[i]);
                }
            }           
        });
        
        listEvent.forEach((item) => {
            let {arrElemAfter: afterElem, arrElemBefore} = item;
            let tmpWidth = 100;
            let left = 0;
            let beforeElem = [];

            beforeElem = arrElemBefore.sort((a , b) => { return a.left - b.left});

            for (let index = 0; index < beforeElem.length; index++) {
                
                let event  = beforeElem[index];
                   
                if(event.left === left){
                    left +=  event.width;  
                }             
                else{
                    tmpWidth = event.left - left;
                    item.left = left; 
                    break;
                }
                                 
                tmpWidth -= event.width;
                item.left = left; 
            }
         
            item.width = tmpWidth / (afterElem.length + 1);
         
        });
    
       return listEvent;
    }

    listenerEvents(event, element){
        let minNow = new Date().getHours() * 60 + new Date().getMinutes();
        let secNow = new Date().getSeconds();


        let minEvent = event.start.split(':').reduce((pValue, nVelue) => {
            return (pValue * 60) + +nVelue;
        });

        if(minEvent > minNow){
    
            setTimeout(() => {

                element.style.backgroundColor = '#00FF0050';
                element.style.boxShadow = `3px 0 0 inset #00FF00`;

                let modWindow = this.renderModalWindow(event);

                setTimeout(() => {
                    modWindow.remove();
                },2000);
         
            }, ((minEvent - minNow) * 60 * 1000) - secNow * 1000);
        }
        else{
            event.color = "#DC143C";
        }

        return event;
    }
  
    renderCalendar(container){
        let timeLine =  this._createTimeline();
        let buttonAddEvent =  this.createBtnAddEvent();
        let wrapForEvent = cElem('ul', 'calendar__list-event');

        container.append(timeLine, wrapForEvent, buttonAddEvent);
    }
    
    renderModalWindow(event){

        let startEvent = cElem('div', 'calendar__event-start');
        let title = cElem('p', 'calendar__event-start-title');
        let time = cElem('p', 'calendar__event-start-time');
        let message = cElem('p', 'calendar__event-start-message');

        title.innerHTML = event.title;
        time.innerHTML = event.start;
        message.innerHTML = "event started";


        startEvent.append(title, time, message);

        this.container.append(startEvent);
        
        return startEvent;
    }

    renderEvent(listEvent){
        let container = document.querySelector('.calendar__list-event');
        container.innerHTML = "";
        
        this._createEvent(listEvent).forEach((item) => {

            
            const minuteInPixels = document.querySelector('.calendar__hour').clientHeight * 2 / 60;
            
            let minute  = item.start / minuteInPixels % 60;
            let start  = (item.start / minuteInPixels  - minute) / 60  + 1;
        
            let timeStart = `${(start > 9)? start : "0" + start}:${(minute > 9) ? minute:"0"+minute}`;

            minute  = item.duration / minuteInPixels % 60;
            start  = (item.duration / minuteInPixels  - minute) / 60;

            let duration = `${(start > 9)? start : "0" + start}:${(minute > 9) ? minute:"0"+minute}`;
       

            let event = {
                start: timeStart,
                duration: duration,
                title: item.title || "",
                color: item.color || "#6E9ECF",
                index: item.index
            }
            let element = cElem('li', "calendar__event-item");

            event = this.listenerEvents(event, element);

            item.color = event.color;

            element.style.top = item.start+'px';
            element.style.height = item.duration+'px';
            element.style.width = item.width+'%';
            element.style.left = item.left+'%';
            element.style.backgroundColor = item.color+'50';
            element.style.boxShadow = `3px 0 0 inset ${item.color}`;
            element.innerText = item.title;

            element.addEventListener('click', () => {
                this.renderFormToAddEvent(event);    
            });

            container.append(element);    
            
        });   
    }  
}

let calendar = new EventPlanner();
