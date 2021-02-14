
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
        this.from = '1:00';
        this.to = '17:00';
        this.container = document.querySelector('.calendar');
        this.wraperForEvents = cElem('ul', 'calendar__event');
        this.renderCalendar();
        this.renderEvent(this.wraperForEvents);
        this.container.append(this.wraperForEvents);
        this.createFormToAddEvent();  
    }

    set _addEvent(event){
        this.#arrEvent.push(event);
        this.renderEvent(this.wraperForEvents);    

    }
    get _getEvent(){
        return this.#arrEvent;
    }

    renderCalendar(){

        const start = this.from.split(':')[0];
        const end = this.to.split(':')[0];
     

        let wrapTime = cElem('ul', 'calendar__list-time');

        for (let index = start; index <= end; index++) {
  
            let hour = cElem('li', 'calendar__hour');
            let half = cElem('li', 'calendar__half-hour');
            let pt = cElem('p', 'calendar__time');

            pt.innerText = `${index}:00`
            hour.append(pt);
            wrapTime.append(hour);

            if(index < end) {
                pt = cElem('p', 'calendar__time');
                pt.innerText = `${index}:30`
                half.append(pt);
                wrapTime.append(half);            
            }
              
        }

        this.container.innerHTML = ""; 
       
        this.container.prepend(wrapTime);

        return  this.container;

    }

    createFormToAddEvent(){

        let btnAddEvent = cElem('button', 'calendar__btn');
        let windowForAddEvent = cElem('div', 'calendar__setting-event hidden');
        let form = cElem('form', 'calendar__form-event');

        btnAddEvent.innerText = "+";
        this.container.append(btnAddEvent);
        
        btnAddEvent.addEventListener('click', () => {
            windowForAddEvent.classList.remove('hidden')
        });

        form.innerHTML = `
            <label for="calendar__input-time" class="calendar__label-time">Время</label>
            <input type="time" name = "time" class="calendar__input-time" min="01:00" max="16:59" required>
            <label for="calendar__input-duration" class="calendar__label-time">Продолжительность</label>
            <input type="time" name = "duration" class="calendar__input-duration" min="00:00" max="17:00" required>
            <input type="text" name = "text" class="calendar__input-text">
            <input type="color" name = "color" value = "#6E9ECF" class="calendar__input-text">
            <input type="submit" name = "submit" value = "Создать">
        `;

        let btn = cElem('div', 'calendar__btn-close')
        btn.innerHTML= '&times;'

        btn.addEventListener('click', () => {
            windowForAddEvent.classList.add('hidden')
        });
    
        form.elements.submit.addEventListener('click', (e) => {
            e.preventDefault();

            if(!this.startValidation(form)) return;
            
            btn.click();
        });

        windowForAddEvent.innerHTML  = `<h2 class="calendar__title-event">Создать событие</h2>`;

        windowForAddEvent.append(form, btn)
        this.container.append(windowForAddEvent);
    }
    startValidation(form){

        if(!form.elements.time.validity.valid) return false;

        let haveTime = this.to.split(':').reduce((p, v)  => {
            return p * 60 + (+v)
        });
 
        let time = form.elements.time.value.split(':');
       
        time = ((+time[0] * 60) - (8 * 60)) + (+time[1]);
         
        let duration = form.elements.duration.value.split(':');
        duration = (+duration[0] * 60) + +duration[1];

        if(duration + (time + 8 * 60) > haveTime) return false;

        let event = {
            start: time,
            duration: duration,
            title: form.elements.text.value,
            color:  form.elements.color.value
        }

        this._addEvent = event;
        
        return true;
    }
    createEvent(){
        let listEvents = this._getEvent.sort( (a, b) => a.start - b.start);
        let oneMinute = document.querySelector('.calendar__hour').clientHeight * 2 / 60;
           
        listEvents = listEvents.map(item => {

            return {
                start: (7 * 60 * oneMinute) + (item.start * oneMinute),
                end: (7 * 60 * oneMinute) + (item.start * oneMinute) + (item.duration * oneMinute),
                height: (item.duration * oneMinute),
                width: 0,
                left: 0,
                title: item.title,
                beforeElem: 0,             
                afterElem: 0,
                color: item.color || '#6E9ECF'             
            }
        });

        listEvents.forEach((item, index, arr) => {
            let countStepBack = [];
            let countStepUp = 0;
            let {start, end} = item;
            
            for (let i = index; i >= 0; i--) {

                if(i === index) continue;

                if(start < arr[i].end){
                    countStepBack.push(arr[i]);   
                    if(end > arr[i].end ) end = arr[i].end;
                }
            
            }
            for (let i = index; i < arr.length; i++) {   
      
                if(i === index) continue;
              
                if(listEvents[i].start < end){
                    countStepUp++;
                }

            }
            
            item.beforeElem = countStepBack;
            item.afterElem = countStepUp;
        
        });
        
        listEvents.forEach((item) => {
            
            let {afterElem, beforeElem} = item;
            let tmpWidth = 100;
            let left = 0;

            for (let i = 0; i < beforeElem.length; i++) {  
                tmpWidth -= beforeElem[i].width;
        
                beforeElem.find(element => {
                    
                    if(element.left === left){
                        left = element.left + element.width;
                        
                    }

                });
                item.left = left;
            }
          
            item.width = tmpWidth / (afterElem + 1);
            
        });

        return listEvents;
       
    }
    listenerEvent(item){
  
    }

    renderEvent(container){
        container.innerHTML = "";

       this.createEvent().forEach(item => {

            let event = cElem('li', "calendar__event-item");
            event.style.top = item.start+'px';
            event.style.height = item.height+'px';
            event.style.width = item.width+'%';
            event.style.left = item.left+'%';
            event.style.backgroundColor = item.color+'50';
            event.style.boxShadow = `3px 0 0 inset ${item.color}`;
            event.innerText = item.title;


            // event.addEventListener('click', (e) => {
            //     let changeEvent = cElem('form', 'calendar__change-event');

            //     let inputStart = cElem('input', 'calendar__start-change');
            //     let inputDuration = cElem('input', 'calendar__duration-change');
            //     let inputTitle = cElem('input', 'calendar__change-title');
            //     let btnChange = cElem('input', 'clendar__submit-change');
            //     btnChange.type = 'submit'
            //     btnChange.value = 'change'
            //     inputStart.type = "time";
            //     inputDuration.type = "time";

            //     changeEvent.addEventListener('click', (e) =>{
            //         e.preventDefault();
            //         startValidation(changeEvent);
            //     });

            //     changeEvent.append(inputStart, inputDuration, inputTitle, btnChange);

            //     this.container.append(changeEvent);
            // });
    
            container.append(event);

        });
     
    }
  
}


let calendar = new EventPlanner();
