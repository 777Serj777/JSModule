
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

    constructor(){
        this.container = document.querySelector('.calendar');   
        this.renderCalendar(this.container);
        this.renderEvent(this.getEvent);
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
        let {start, duration, title, color} = eventProperty;
    
        this.setEvent = {event: {start, duration, title}, index};
        
        let listEvent = this.getEvent;
        
        if(index !== undefined && color) listEvent[index].color = color
      
        else if(color) listEvent[listEvent.length - 1].color = color;
        
        console.log(listEvent);

        this.renderEvent(listEvent);
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
            <input type="submit" name = "submit" value = "Create">
        `;

        if(config){
            formForAddEvent.time.value = config.start;
            formForAddEvent.duration.value = config.duration;
            formForAddEvent.text.value = config.title;
            formForAddEvent.color.value = config.color;
            formForAddEvent.submit.value = 'Change'
        }

        let btn = cElem('div', 'calendar__btn-close')
        btn.innerHTML= '&times;'

        btn.addEventListener('click', () => {
            formForAddEvent.remove();
        });
 
        formForAddEvent.elements.submit.addEventListener('click', (e) => {
            e.preventDefault();
            
            if(formForAddEvent.elements.submit.value === 'Create'){
                if(!this._addNewEvent(formForAddEvent.elements)) return;
            }
            if(formForAddEvent.elements.submit.value === 'Change'){
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
  
    renderCalendar(container){
        let timeLine =  this._createTimeline();
        let buttonAddEvent =  this.createBtnAddEvent();
        let wrapForEvent = cElem('ul', 'calendar__list-event');

        container.append(timeLine, wrapForEvent, buttonAddEvent);
    }

    renderEvent(listEvent){
        let container = document.querySelector('.calendar__list-event');
        container.innerHTML = "";

        this._createEvent(listEvent).forEach((item) => {

            let event = cElem('li', "calendar__event-item");
            event.style.top = item.start+'px';
            event.style.height = item.duration+'px';
            event.style.width = item.width+'%';
            event.style.left = item.left+'%';
            event.style.backgroundColor = item.color+'50';
            event.style.boxShadow = `3px 0 0 inset ${item.color}`;
            event.innerText = item.title;

            event.addEventListener('click', () => {
         
                const minuteInPixels = document.querySelector('.calendar__hour').clientHeight * 2 / 60;
            
                let minute  = item.start / minuteInPixels % 60;
                let start  = (item.start / minuteInPixels  - minute) / 60  + 1 ;
            
                let timeStart = `${(start > 9)? start : "0" + start}:${(minute > 9) ? minute:"0"+minute}`;

                minute  = item.duration / minuteInPixels % 60;
                start  = (item.duration / minuteInPixels  - minute) / 60;

                let duration = `${(start > 9)? start : "0" + start}:${(minute > 9) ? minute:"0"+minute}`;
           
                this.renderFormToAddEvent({
                    start: timeStart,
                    duration: duration,
                    title: item.title || "",
                    color: item.color || "#6E9ECF",
                    index: item.index
                 });    
            })
            container.append(event);           
        });   
    }  
}

let calendar = new EventPlanner();
