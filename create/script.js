// const streamIDInput = document.getElementById('streamID');
// const inputButton = document.getElementById('generateLink');
// const streamPreview = ;
//

class EventHandler { //Why did I make this? This seems like extreme overkill.
    constructor(){this.eventListeners = {};}
    addEventListener(eventType, callback){
        if(!this.constructor.eventTypeExists(eventType)) throw `Unknow event type ${eventType}`;
        if(!this.eventListeners.hasOwnProperty(eventType)) this.eventListeners[eventType] = new Map();
        const eventID = Symbol();
        this.eventListeners[eventType].set(eventID, callback);
        return eventID;
    }
    removeEventListener(eventID) { //I would never need this for this project. Why did I make this funct?
        for (const eventType in this.constructor.Events) {
            const eventsMap = this.constructor.Events[eventType];
            if(eventsMap && eventsMap.delete(eventID)) return true;
        }
    }
    dispatchEvent(eventType, ...args) {
        if(!this.constructor.eventTypeExists(eventType)) throw `Unknow event type ${eventType}`;
        for (const [eventID, callBack] of this.eventListeners[eventType] ?? []) {
            callBack.call(this,...args);
        }
    }
    static eventTypeExists (eventType) {
        return Object.values(this.Events).indexOf(eventType) != -1;
    }
    static Events = {};
}

class AdvancedInput extends EventHandler { //This feels like a weird way to do this.
    constructor(element, parsingFunct) {
        super();
        this.value = null;
        this.vaild = false;
        this.element = element;
        this.errMsgBox = document.querySelector(`div.AdvancedInput-err-msg[data-for="${this.element.name}"]`)
        this.parsingFunct = parsingFunct;

        this.element.addEventListener('input', this.parseValue.bind(this));
    }
    

    parseValue() {
        if(this.element.value != ''){
            let {value,err} = this.parsingFunct(this.element);
            if (err){
                console.log(err)
                this.element.dataset["vaild"] = 'false';
                this.errMsgBox.dataset["hidden"] = 'false';
                this.errMsgBox.innerText = err;
                //TODO: display errors
                this.vaild = false;
                this.value = null;
            } else {
                this.element.dataset["vaild"] = 'true';
                this.errMsgBox.dataset["hidden"] = 'true';
                this.vaild = true;
                this.value = value;
            }
        } else {
            this.element.dataset["vaild"] = 'empty';
            this.errMsgBox.dataset["hidden"] = 'true';
        }
        
        this.dispatchEvent(AdvancedInput.Events.PARSE, this.value);
    }

    static Events = Object.freeze({ //I don't know if Symbol are the best thing to use here 
        PARSE: Symbol('Update'),    //but I'm using them.
    });


}



const streamIDInput = new AdvancedInput(document.getElementById('streamID'), function (element) {
    let rawStreamID = element.value.trim();
    if(/^[a-z0-9_-]+$/i.test(rawStreamID)) {
        if(rawStreamID.length == 11) return {value: rawStreamID};
        else return {err: `Stream ID Invalid: too ${rawStreamID.length < 11 ? 'short': 'long'}`};
    } else {
        let [queryID] = rawStreamID.match(/(?<=youtu.be\/|vi?=)[a-z0-9_-]+/i) ?? [null];
        if(queryID && queryID.length == 11) return {value: queryID};
        else return {err: 'Stream ID / URL Invalid'}
    }
});

streamIDInput.addEventListener(AdvancedInput.Events.PARSE, function(StreamID){
    let streamPreview = document.getElementById('preview'); //I just really need to learn react js
    let streamPreviewLabel = document.getElementById('preview-label');
    if(this.vaild) {
        streamPreview.dataset.hidden = "false";
        streamPreviewLabel.dataset.hidden = "false";
        streamPreview.innerHTML = `<img width="100px" src="http://i3.ytimg.com/vi/${StreamID}/maxresdefault.jpg" alt="stream thumbnail">`
    } else {
        streamPreview.dataset.hidden = "true";
        streamPreviewLabel.dataset.hidden = "true";
    }
});


const timestampInput = new AdvancedInput(document.getElementById('timestamp'), function (element) {
    let timestamp = element.valueAsNumber;
    if (!timestamp) return {err: 'blank value'};
    const d = new Date();
    let tsYesterday = false;
    timestamp += new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if(timestamp > d.getTime()) {
        timestamp -= 8.64e7;
        tsYesterday = true;
    };
    if(timestamp < d.getTime() - 4.68e7) return {err:`Replays from ${tsYesterday?'yesterday':'today'} at ${new Date(timestamp).toLocaleTimeString()} is no longer available.`};
    return {value: timestamp / 1000};
});




function generateReplayLink(){
    const urlElement = document.getElementById("replay-url");
    console.log("generateReplayLink");
    if (timestampInput.vaild && streamIDInput.vaild) {
        let replayUrl = new URL('https://pcat0.github.io/yt-livestream-replay-link/'); //Update
        replayUrl.searchParams.set('v', streamIDInput.value);
        replayUrl.searchParams.set('t', timestampInput.value);
        urlElement.value = replayUrl;
    } else { 
        urlElement.value = '';
    }
}

streamIDInput.addEventListener(AdvancedInput.Events.PARSE, generateReplayLink);
timestampInput.addEventListener(AdvancedInput.Events.PARSE, generateReplayLink);





function selectAllText(){
    this.select();
}

function copyText(inputName) {
    let copyElement = document.getElementsByName(inputName)[0];
    copyElement.focus()
    copyElement.select();

    document.execCommand("copy");
    console.log(`copyed text ${copyElement.value}`);
}

/*
streamIDInput.addEventListener('blur', function(){
    var StreamID = null;
    try {
        StreamID = parseStreamID(streamIDInput.value);
    } catch {
        //TODO: do somethings
    }
    console.log(StreamID)
    if(StreamID) {
        streamPreview.dataset.hidden = "false";
        streamPreview.innerHTML = `<img src="http://i3.ytimg.com/vi/${StreamID}/0.jpg" alt="stream thumbnail">`
    } else {
        streamPreview.dataset.hidden = "true";
    }
});

inputButton.addEventListener("click", function(){
    console.log(getTimeStamp(timestampInput.valueAsNumber));
});
*/





//4:52:45
//11:47:24
//https://pcat0.github.io/yt-long-livestream-time-linker/?v=Z72Au8Px7mM&t=1612547244
//https://pcat0.github.io/yt-long-livestream-time-linker/?v=Z72Au8Px7mM&t=1612565544