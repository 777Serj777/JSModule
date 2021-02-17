
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
    set setEvent(event){
        this.#arrEvent.push(event);
    }
    get getEvent(){
        return this.#arrEvent;
    }
    setStatus(event){
        let {start, duration, title, color} = event;

        this.setEvent = {start, duration, title};
  
        let listEvent = Object.assign(this.getEvent);

        if(color) listEvent[listEvent.length - 1].color = color;
     
        this.renderEvent(listEvent);
    }
    createTimeline(){

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

        btnAddEvent.addEventListener('click', this.createFormToAddEvent.bind(this));
        
        return btnAddEvent;
    }

    createFormToAddEvent(){

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

        let btn = cElem('div', 'calendar__btn-close')
        btn.innerHTML= '&times;'

        btn.addEventListener('click', () => {
            formForAddEvent.remove();
        });
    
        formForAddEvent.elements.submit.addEventListener('click', (e) => {
            e.preventDefault();
            if(!this.addNewEvent(formForAddEvent.elements)) return;        
            btn.click();
        });

        formForAddEvent.append(btn);
        this.container.append(formForAddEvent);
    }
    
    addNewEvent(elements){

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

        this.setStatus(event);
        
        return true;
    }
    createEvent(listEvent){
    
        const minuteInPixels = document.querySelector('.calendar__hour').clientHeight * 2 / 60;


       
        listEvent = listEvent.map((event) => {

            return {
                start : (7 * 60 + event.start) * minuteInPixels,
                duration : event.duration * minuteInPixels,
                title: event.title,
                color : event.color || '#6E9ECF',
                left: 0,
                width: 100,
                beforeElem: 0,             
                afterElem: 0,
            }
        
        }).sort((a, b) => a.start - b.start);


        

       listEvent.forEach((item, index, arr) => {
            let countStepBack = [];
            let countStepUp = 0;
            let {start, duration} = item;
            let end = start + duration;
            for (let i = index; i >= 0; i--) {

                if(i === index) continue;

                if(start < (arr[i].duration + arr[i].start)){
                    countStepBack.push(arr[i]);   
                    if(end > (arr[i].duration + arr[i].start) ) end = (arr[i].duration + arr[i].start);
                }
            
            }
            for (let i = index; i < arr.length; i++) {   
      
                if(i === index) continue;
              
                if(listEvent[i].start < end){
                    countStepUp++;
                }

            }
            
            item.beforeElem = countStepBack;
            item.afterElem = countStepUp;
        
        });
        
        listEvent.forEach((item) => {
            
            let {afterElem, beforeElem} = item;
            let tmpWidth = 100;
            let left = 0;

            for (let i = 0; i < beforeElem.length; i++) {  
                tmpWidth -= beforeElem[i].width;
        
                beforeElem.forEach(element => {
                    
                    if(element.left === left){
                        left = element.left + element.width;
                        
                    }
               
                });
                item.left = left;
            }
          
            item.width = tmpWidth / (afterElem + 1);
            
        });
        
        console.log(listEvent);

       return listEvent;
    }
   
    renderCalendar(container){
        let timeLine =  this.createTimeline();
        let buttonAddEvent =  this.createBtnAddEvent();
        let wrapForEvent = cElem('ul', 'calendar__list-event');

        container.append(timeLine, wrapForEvent, buttonAddEvent);
    }

    renderEvent(listEvent){
        let container = document.querySelector('.calendar__list-event');
        container.innerHTML = "";

        this.createEvent(listEvent).forEach(item => {

            let event = cElem('li', "calendar__event-item");
            event.style.top = item.start+'px';
            event.style.height = item.duration+'px';
            event.style.width = item.width+'%';
            event.style.left = item.left+'%';
            event.style.backgroundColor = item.color+'50';
            event.style.boxShadow = `3px 0 0 inset ${item.color}`;
            event.innerText = item.title;

            container.append(event);

        });

        console.log(container);

    }
  
}


let calendar = new EventPlanner();
