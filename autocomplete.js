"use strict";

var debug = true;
const log = debug ? console.log : function () {};
var selectedList = {};
let blocked = [];
var occupied = [];
// const load = $.getJSON("http://47.104.9.250/course.json", function(json) {
const load = $.getJSON("course.json", function(json) {
    return json; // this will show the info it in firebug console
});
var credit = 0;

var cursor = 0;
var color = ["#EAE9A5", "#BFF8C2", "#BFF8F8", "#D5AEF9", "#FAC1A0"]
var color_border = ["#EFEC32", "#32EF3A", "#44FBFB", "#9C37F5", "#F57C37"]

var egg = 0;
// ============================== this is for calender display  ==============================
const terms = $(".calendar__term").select();
const times = ["08:00", "", "09:00", "", "10:00", "", "11:00", "", "12:00", "", "13:00", "", "14:00"
    , "", "15:00", "", "16:00", "", "17:00", "", "18:00", "", "19:00", "", "20:00", ""];
const term_name = ["fall", "winter"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const blockTime = function (id) {
    let timeSlot = document.getElementById(id);
    if (timeSlot.classList.contains("blocked-timeslot")) {
        timeSlot.classList.remove("blocked-timeslot");
        blocked.splice(blocked.indexOf(timeSlot.id.toString()), 1)
    } else {
        timeSlot.classList.add("blocked-timeslot");
        blocked.push(timeSlot.id)

    }

    update_cookie()
};


const showText = function (timeSlot) {
    if (timeSlot.innerHTML) return;
    let text = document.createElement("span");
    text.innerText = timeSlot.classList.contains("blocked-timeslot") ? "cancel" : "block off time";
    timeSlot.appendChild(text)
};

const hideText = function (timeSlot) {
    timeSlot.childNodes.forEach(element => {
        if (element.tagName === "SPAN")
            timeSlot.removeChild(element)
    })
};
let count_id = 130;
for (let k=0; k<2; k++) {
    if (k===1) count_id+=104;
    for (let j = 0; j < times.length+1; j++) {
        const calendar_week = document.createElement("div");
        calendar_week.classList.add("calendar__week");
        if (j === 0){
            // j === 0 check if is header
            const calendar_day = document.createElement("div");
            calendar_day.classList.add("calendar__day");
            calendar_day.classList.add("day");
            calendar_day.innerText = term_name[k];
            calendar_week.appendChild(calendar_day);
            for (let i=1; i < 6; i++) {
                const calendar_day = document.createElement("div");
                calendar_day.classList.add("calendar__day");
                calendar_day.classList.add("day");
                calendar_day.innerText = days[i-1];
                calendar_week.appendChild(calendar_day)
            }
            terms[k].appendChild(calendar_week)
        } else {
            let i = 0;
            for (; i < 6; i++) {
                const calendar_day = document.createElement("div");
                calendar_day.classList.add("calendar__day");
                calendar_day.classList.add("day");

                if (i === 0) {
                    calendar_day.innerText = times[j-1];
                    count_id -= 129
                } else {
                    calendar_day.setAttribute("onclick", "blockTime(this.id)");
                    calendar_day.setAttribute("onmouseover", "showText(this)");
                    calendar_day.setAttribute("onmouseleave", "hideText(this)");
                    calendar_day.setAttribute("id", count_id.toString());
                    if (debug) calendar_day.innerText = count_id.toString()
                    count_id += 26;
                }
                calendar_week.appendChild(calendar_day)
            }
            terms[k].appendChild(calendar_week)
        }
    }
}

function changeView(id) {
    document.getElementsByClassName("toggle__option--selected")[0].classList.remove("toggle__option--selected")
    document.getElementById(id).classList.add("toggle__option--selected")
    if (id === "toggle_winter"){
        document.getElementById("fall").hidden = true
        document.getElementById("winter").style.width = "100%"
        document.getElementById("winter").hidden = false

    } else if (id === "toggle_fall"){
        document.getElementById("winter").hidden = true
        document.getElementById("fall").style.width = "100%"
        document.getElementById("fall").hidden = false

    } else {
        document.getElementById("winter").hidden = false
        document.getElementById("fall").hidden = false

        document.getElementById("fall").style.width = "49.7%"
        document.getElementById("winter").style.width = "49.7%"
    }
}


//============================== this is for autocomplete the input area ==============================
function autocomplete(inp, courses) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    const keys = Object.keys(courses);
    let arr = [];
    for (let i=0; i<keys.length; i++){
        arr.push(keys[i].slice(0, 8) + keys[i][9] + " " + courses[keys[i]].courseTitle)
    }
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        var count = 0;
        for (i = 0; i < arr.length && count < 10; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                count ++;
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    addToCart(inp.value, courses);
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode === 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode === 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode === 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}



// ============================== this is for add to enrol cart ==============================

// logic: when add a course to cart, disable all opening menu item and create a new, opened menu item on side bar
function addToCart(course, courses) {
    disableAll();
    let id_ = course.slice(0,8) + "-" + course[8]+"-20189";
    if(id_[6] === "Y") credit+=1;
    else credit+=0.5;
    document.getElementById('credit').innerText = "Credit: " + credit
    if (document.querySelector("#" + id_)){
        extend(id_)
    } else {
        // lecture, tutorial, practice selection area named ltp
        let ltp = htmlOfSelection(courses, id_);
        let cartItem = document.createElement("a");
        let pre = courses[id_].prerequisite===""?"":"<span class='req'><br />preqequisite:"+courses[id_].prerequisite+"</span>";
        let cor = courses[id_].corequisite===""?"":"<span class='req'><br />corequisite:"+courses[id_].corequisite+"</span>";
        let exc = courses[id_].exclusion===""?"":"<span class='req'><br />exclusion:"+courses[id_].exclusion+"</span>";
        course = course.slice(0, 9);
        cartItem.innerHTML = "<i class=\"menu__icon fa fa-home\"><img class='close' id='close-" + id_
            + "' src='close.png' style='width: 20px; " +
            "left: 70%;' onclick='removeCourse(this.id)'></i>\n" +
            "<span class=\"menu__text\"><strong>" + course + "</strong></span>\n" +
            "<span style='font-weight: bold;color: darkblue'><br />"+ courses[id_].courseTitle+"</span>" +
            pre + cor + exc +
            "<p style='font-size: smaller'>" + courses[id_].courseDescription + "</p>" + ltp;

        cartItem.setAttribute('onclick', 'extend(this.id)');
        cartItem.id = id_;
        cartItem.classList.add("menu__item");
        document.querySelector("body > div > sidebar > nav").appendChild(cartItem);
        cursor = (cursor + 1)%color_border.length
        selectedList[id_] = {color: color[cursor], color_border: color_border[cursor]};
        extend(id_);
        update_cookie()
    }
}

function disableAll() {
    let selected_courses = document.getElementsByClassName("menu__item");
    for (let i=0;i<selected_courses.length;i++){
        if (selected_courses[i].classList.contains("menu__item--active")){
            selected_courses[i].classList.remove("menu__item--active");
            // selected_courses[i].childNodes[4].style.display = "none";
            // selected_courses[i].childNodes[5].style.display = "none";
            // selected_courses[i].childNodes[6].style.display = "none";
            for(let j=4;j<selected_courses[i].childNodes.length;j++){
                selected_courses[i].childNodes[j].style.display = 'none';
            }
            break;
        }
    }
}

function extend(id) {
    disableAll();
    if (!document.querySelector("#"+id)) return;
    document.querySelector("#"+id).classList.add("menu__item--active");
    for(let i=4;i<document.querySelector("#"+id).childNodes.length;i++){
        document.querySelector("#"+id).childNodes[i].style.display = '';
    }
    let buttons = document.querySelector("#"+id).getElementsByClassName("coursebutton");
    removeAllConflictButton();
    refreshButton(buttons)
}


// create div for lec, tut and pra selection.
function htmlOfSelection(courses, coursecode) {
    let course = courses[coursecode].meetings;
    let outerdiv = document.createElement("div");
    outerdiv.id = 'selection-' + coursecode;
    let lec = [];
    let tut = [];
    let pra = [];
    for (let i=0;i<Object.keys(course).length;i++){
        let type = Object.keys(course)[i].slice(0,3);
        if (type==="LEC") lec.push(Object.keys(course)[i]);
        if (type==="TUT") tut.push(Object.keys(course)[i]);
        if (type==="PRA") pra.push(Object.keys(course)[i])
    }
    const lectures_div = document.createElement('div');
    lectures_div.classList.add("lecture")
    lectures_div.id = coursecode + "|lecture";
    lectures_div.style = "font-size: small;color: black;text-align:bottom";
    const lec_span = document.createElement('div');
    lec_span.innerHTML = "LEC: <br/>";
    lec_span.style = "bottom:0；margin:5px;";
    lectures_div.appendChild(lec_span);
    for (let i=0;i<lec.length;i++){
        const lec_div = document.createElement('div');
        lec_div.id = coursecode + "|" +lec[i];
        lec_div.classList.add("coursebutton");
        lec_div.innerText = lec[i];
        lec_div.setAttribute("onclick", "selectSection(this.id)");

        lectures_div.appendChild(lec_div);
    }
    outerdiv.appendChild(lectures_div);
    if (tut.length !== 0) {
        const tutorials_div = document.createElement('div');
        tutorials_div.classList.add("tutorial")
        tutorials_div.id = coursecode + "|tutorial";
        tutorials_div.style = "font-size: small;color: black;text-align:bottom";
        const tut_span = document.createElement('div');
        tut_span.innerHTML = "TUT: <br/>";
        tut_span.style = "bottom:0；margin:5px;";
        tutorials_div.appendChild(tut_span);
        for (let i = 0; i < tut.length; i++) {
            const tut_div = document.createElement('div');
            tut_div.id = coursecode + "|" + tut[i];
            tut_div.classList.add("coursebutton");
            tut_div.setAttribute("onclick", "selectSection(this.id)");

            tut_div.innerText = tut[i];
            tutorials_div.appendChild(tut_div);
        }
        outerdiv.appendChild(tutorials_div);
    }
    if (pra.length !== 0) {
        const practises_div = document.createElement('div');
        practises_div.id = coursecode + "|practice";
        practises_div.classList.add("practice")
        practises_div.style = "font-size: small;color: black;text-align:bottom";
        const pra_span = document.createElement('div');
        pra_span.innerHTML = "PRA: <br/>";
        pra_span.style = "bottom:0；margin:5px;";
        practises_div.appendChild(pra_span);
        for (let i = 0; i < pra.length; i++) {
            const pra_div = document.createElement('div');
            pra_div.id = coursecode + "|" + pra[i];
            pra_div.classList.add("coursebutton");
            pra_div.innerText = pra[i];
            pra_div.setAttribute("onclick", "selectSection(this.id)");
            practises_div.appendChild(pra_div);
        }
        outerdiv.appendChild(practises_div);
    }
    return outerdiv.outerHTML
}

// when click on section, if selected_button already in class list, remove it, vice versa
function selectSection(id) {
    load.then(courses => {
        const coursebutton = document.getElementById(id);
        if (coursebutton.classList.contains("selected_button")) {
            coursebutton.classList.remove("selected_conflict_button");
            coursebutton.classList.remove("selected_button");
            removeGraphForOneSection(id)
            delete selectedList[id.split("|")[0]][id];
        } else {
            coursebutton.classList.add("selected_button");
            if ("Y" === courses[id.split("|")[0]]["section"]){
                let fall = JSON.parse(JSON.stringify({schedule: courses[id.split("|")[0]]['meetings'][id.split("|")[1]]['schedule']}));
                let winter = JSON.parse(JSON.stringify({schedule: courses[id.split("|")[0]]['meetings'][id.split("|")[1]]['schedule']}));
                fall.sectionType = "F";
                winter.sectionType = "S";
                Object.keys(fall.schedule).forEach(element => {
                    fall.schedule[element + "|F"] = fall.schedule[element];
                    winter.schedule[element + "|S"] = winter.schedule[element];
                    delete winter.schedule[element];
                    delete fall.schedule[element];
                });
                selectedList[id.split("|")[0]][id] = fall.sectionType;
                addGraphForOneSection(fall, id);
                addGraphForOneSection(winter, id)
            } else {
                let section = {schedule: courses[id.split("|")[0]]['meetings'][id.split("|")[1]]['schedule']};
                section.sectionType = courses[id.split("|")[0]]["section"];
                addGraphForOneSection(section, id)
            }
            selectedList[id.split("|")[0]][id] = {schedule: courses[id.split("|")[0]]['meetings'][id.split("|")[1]]['schedule']};
            selectedList[id.split("|")[0]][id].sectionType = courses[id.split("|")[0]]["section"];
        }
        extend(id.split("|")[0]);
        update_cookie()
    })
}

function addGraphForOneSection(sectionInfo, id) {
    for (let i=0;i<Object.values(sectionInfo.schedule).length;i++){
        let schedule = Object.values(sectionInfo.schedule)[i];
        let startGrid = getGridIdByDayTime(schedule.meetingDay, schedule.meetingStartTime, sectionInfo.sectionType);
        let endGrid = getGridIdByDayTime(schedule.meetingDay, schedule.meetingEndTime, sectionInfo.sectionType) - 1;
        let duration = endGrid - startGrid + 1;
        if (startGrid === null || startGrid===undefined){
            return;
        }
        let floating = document.createElement("div");
        let grid = document.getElementById(startGrid);

        floating.classList.add("courseGraph");
        floating.classList.add(id);
        floating.id = id + "|" + Object.keys(sectionInfo.schedule)[i];
        floating.style.height = duration * grid.offsetHeight + "px";
        floating.innerHTML =
            "<span style='color: indigo;padding: 5px'>" + id.slice(0,6) + "</span>" +
            "<span style='color: indigo;font-size: smaller;'>" + id.split("|")[1] + "</span>" +
            "<span style='color: indigo;font-size: smaller;'>" + getTimeById(startGrid, duration) + "</span>";
        floating.setAttribute("onclick", "selectCourse(this.classList[1])");
        floating.setAttribute("onmouseover", "graphMouseOver(this.classList[1])");
        floating.setAttribute("onmouseleave", "graphMouseLeave()");
        floating.style.background = selectedList[id.split("|")[0]].color
        floating.style.border = "1px solid " + selectedList[id.split("|")[0]].color_border

        addOccupied(startGrid, duration, id);
        disableBlockClick(startGrid, duration);
        grid.appendChild(floating);
        handleConflictGraphGroup(startGrid, endGrid, floating.id)
    }
}

function Node(s, e, id) {
    this.startGrid = s;
    this.endGrid = e;
    this.id = id;
}

function handleConflictGraphGroup(start, end, id) {
    let candidates = [new Node(start, end, id)]
    let seen = [candidates[0]]
    let seen_id = [candidates[0].id]
    while (candidates.length > 0){
        let candidate = candidates.pop();
        let conflicts = getConflict(candidate.startGrid, candidate.endGrid)
        for (let i=0;i<conflicts.length;i++){
            let node = conflicts[i]
            if (!(seen_id.includes(node.id))){
                seen_id.push(node.id)
                candidates.push(node)
                seen.push(node)
            }
        }
    }
    seen.sort((x, y) => x.startGrid > y.startGrid?1:-1)
    let interval = []
    for(let i=0;i<seen.length;i++){
        let flag = false
        for (let j=0;j<interval.length;j++){
            let processor = interval[j]
            if (processor.length === 0){
                processor.push(seen[i])
                flag = true
            } else if (processor[processor.length - 1].endGrid <= seen[i].startGrid){
                processor.push(seen[i])
                flag = true
            }
        }
        if (!flag){
            interval.push([seen[i]])
        }
    }
    let width = 100/interval.length
    for (let i=0;i<interval.length;i++){
        let group = interval[i]
        let left = i * width
        group.forEach(node => {
            let graph = document.getElementById(node.id)
            graph.style.width = width + "%";
            graph.style.left = left + "%"
        })
    }
}


function getConflict(start, end) {
    let exist = document.getElementsByClassName("courseGraph");
    let conflict = [];
    for (let i=0;i<exist.length;i++){
        let startGrid = parseInt(exist[i].parentNode.id);
        let endGrid = parseInt(exist[i].offsetHeight) / parseInt(exist[i].parentNode.offsetHeight) + startGrid - 1;
        if (!(endGrid < start||startGrid > end)) {
            conflict.push(new Node(startGrid, endGrid, exist[i].id))
        }
    }
    return conflict
}


// when remove a whole course
function removeCourse(id) {
    if(id[6] === "Y") credit-=1;
    else credit-=0.5;
    document.getElementById('credit').innerText = "Credit: " + credit
    removeDisplayForOneCourse(id.slice(6));
    let parent = document.getElementById(id).parentNode.parentNode;
    parent.parentNode.removeChild(parent);
    delete selectedList[id.slice(6)];
    update_cookie()
}

function removeGraphForOneSection(id) {
    enableBlockClick(id);
    deleteOccupied(id);
    let sectionGraph = document.getElementsByClassName(id);
    for (let i=sectionGraph.length - 1;i>=0;i--){
        let parent = sectionGraph[i].parentNode
        parent.removeChild(sectionGraph[i]);
    }
    // TODO
    let allGraphs = document.getElementsByClassName("courseGraph")
    for (let i=0;i<allGraphs.length;i++){
        let parent = allGraphs[i].parentNode
        let startGrid = parseInt(parent.id)
        let endGrid = parseInt(allGraphs[i].offsetHeight) / parseInt(parent.offsetHeight) + startGrid - 1;
        handleConflictGraphGroup(startGrid, endGrid, allGraphs[i].id)
    }
}

function removeDisplayForOneCourse(id) {
    let waitToDelete = document.getElementById("selection-" + id).getElementsByClassName("selected_button");
    for (let i=waitToDelete.length-1;i>=0;i--){
        removeGraphForOneSection(waitToDelete[i].id)
    }
}


function disableBlockClick(start, duration) {
    for (let i=0;i<duration;i++) document.getElementById(start+i).removeAttribute("onclick")
}

// TODO 什么几把问题
function enableBlockClick(id) {
    load.then(courses => {
        let courseInfo = courses[id.split("|")[0]];
        let courseTime = courses[id.split("|")[0]]["meetings"][id.split("|")[1]]["schedule"];
        let sectionType = courseInfo["section"];
        Object.keys(courseTime).forEach(sectionCode => {
            let endGrid = getGridIdByDayTime(courseTime[sectionCode]["meetingDay"], courseTime[sectionCode]["meetingEndTime"], sectionType);
            let startGrid = getGridIdByDayTime(courseTime[sectionCode]["meetingDay"], courseTime[sectionCode]["meetingStartTime"], sectionType);
            let duration = (endGrid - startGrid);
            for (let i=0;i<duration;i++) document.getElementById(startGrid + i).setAttribute("onclick", "blockTime(this.id)");
        })
    });
}

function graphMouseOver(className) {
    let all_graphs = document.getElementsByClassName(className);
    for (let i=0; i<all_graphs.length; i++){
        all_graphs[i].classList.add("graph-hover")
    }
}

function graphMouseLeave() {
    let all_graphs = document.getElementsByClassName("graph-hover");
    for (let i=all_graphs.length-1; i>=0; i--){
        all_graphs[i].classList.remove("graph-hover")
    }
}

function selectCourse(className) {
    let courseButton = document.getElementById(className);
    extend(courseButton.id.split("|")[0])
}

function getGridIdByDayTime(day, time, section) {
    if (!day || !time) return;
    let id = 0;
    switch (day) {
        case "MO": id=1; break;
        case "TU": id=27; break;
        case "WE": id=53; break;
        case "TH": id=79; break;
        case "FR": id=105; break;
    }
    id += (time.slice(0,2) - "08")*2;
    if (time.slice(3) === "30") id += 1;
    if (section==="S") id += 130;
    return id;
}


function getTimeById(id, duration) {
    const times = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"
        , "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
    id %= 130;
    id %= 26;
    id -= 1;
    return times[id] + "-" + times[id+duration]
}


function removeAllDisplay() {
    let courseGraphs = document.getElementsByClassName("courseGraph");
    for (let i=courseGraphs.length - 1;i>=0;i--){
        courseGraphs[i].parentNode.removeChild(courseGraphs[i])
    }
}


// ------------------------- check if conflict happened what button should do. -------------------------
function addOccupied(start, duration, id) {
    for (let i=0;i<duration;i++){
        let obj = {};
        obj[i+start] = id;
        occupied.push(obj)
    }
}

function deleteOccupied(id) {
    let graphs = document.getElementsByClassName(id);
    for (let i=0;i<graphs.length;i++){
        let startGrid = graphs[i].parentNode.id;
        let duration = graphs[i].offsetHeight/25;
        for (let i=0;i < duration; i++){
            removeFromArray(occupied, parseInt(startGrid)+i, id)
        }
    }
}

function removeFromArray(arr, element, id) {
    for (let i=0;i<arr.length; i++){
        if (Object.keys(arr[i])[0] == element){
            if (arr[i][element] === id){
                arr.splice(i, 1)
            }
        }
    }
}


function refreshButton(buttons) {
    load.then(courses => {
        // for each button
        for (let i=0;i<buttons.length;i++){
            // will the section of this button represent cause conflict?
            // 1 - GET THE SECTION MEETING TIME
            let section = buttons[i].id;
            let sectionType = courses[section.split("|")[0]].section;
            let meetings = courses[section.split("|")[0]].meetings[section.split("|")[1]].schedule;
            // for each meeting, check which time slot been used
            Object.keys(meetings).forEach(meeting =>{
                let meetingScedule = meetings[meeting];
                let startGrid = getGridIdByDayTime(meetingScedule['meetingDay'], meetingScedule['meetingStartTime'], sectionType);
                let endGrid = getGridIdByDayTime(meetingScedule['meetingDay'], meetingScedule['meetingEndTime'], sectionType);
                let duration = (endGrid - startGrid);
                // check if has conflict
                let occupiedArr = occupied.map(element => {
                    return parseInt(Object.keys(element)[0])
                });
                for (let k=0;k<duration;k++){
                    if (occupiedArr.includes(startGrid + k) &&
                        occupied[occupiedArr.indexOf(startGrid+k)][startGrid+k] !== section) {
                        if (document.getElementById(section).classList.contains("selected_button"))
                            document.getElementById(section).classList.add("selected_conflict_button")
                        document.getElementById(section).classList.add("conflict_button")

                    }
                }
                if (sectionType === "S"){
                    for (let k=0;k<duration;k++){
                        if (occupiedArr.includes(startGrid + k + 130) &&
                            occupied[occupiedArr.indexOf(130 + startGrid+k)][130 + startGrid+k] !== section) {
                            if (document.getElementById(section).classList.contains("selected_button"))
                                document.getElementById(section).classList.add("selected_conflict_button")
                            document.getElementById(section).classList.add("conflict_button")
                        }
                    }
                }
            })

        }
    });
}


function removeAllConflictButton() {
    let all = document.getElementsByClassName("conflict_button");
    for (let i=all.length-1;i>=0;i--){
        all[i].classList.remove("conflict_button")
    }
}


// ============================== This is for load cookie and save cookie ==============================
function update_cookie() {
    // log(selectedList)
    const cookie_str = JSON.stringify(selectedList);
    const blockTimes = JSON.stringify(blocked);
    const d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    const expires = "expires="+ d.toUTCString();
    document.cookie = "courses" + "=" + cookie_str + "&blocked="
        + blockTimes + ";" + expires + ";path=/";
    document.cookie = document.cookie.split(";")[document.cookie.split(";").length - 1]

}

function load_cookie(courses) {
    if (document.cookie){
        // let b  = document.cookie.split(";")
        // log("B " + b + "\n")
        let temp_block = JSON.parse(document.cookie.split("&")[1].split("=")[1]);
        let temp = JSON.parse(document.cookie.split("&")[0].split("=")[1]);
        for (let i=0;i<Object.keys(temp).length;i++){
            addToCart(Object.keys(temp)[i].slice(0, 8) + Object.keys(temp)[i][9] + " ", courses);
            Object.keys(temp[Object.keys(temp)[i]]).forEach(section => {
                if (!["color", "color_border"].includes(section))
                    selectSection(section)
            })
        }
        for (let i=0;i<temp_block.length;i++)
            blockTime(temp_block[i])
    }
}

// eastern egg
function logoclick() {
    egg += 1
    if (egg > 10){
        egg = 0;
        document.onclick = "none"
    }
    if (egg === 10){
        alert("develop by Mingren Chen https://github.com/MingrenChen")
        document.onclick = function firework(ev) {
            var oEvent=ev||event;
            var aDiv=[];
            var oDiv=null;
            var _oDiv=document.createElement('div');
            var i=0;
            var x=oEvent.clientX;
            var y=oEvent.clientY;
            _oDiv.style.position='absolute';
            _oDiv.style.background='red';
            _oDiv.style.width='3px';
            _oDiv.style.height='30px';
            _oDiv.style.left=oEvent.clientX+'px';
            _oDiv.style.top=document.documentElement.clientHeight+'px';
            document.body.appendChild(_oDiv);
            var t=setInterval(function (){
                if(_oDiv.offsetTop<=y)
                {
                    clearInterval(t);
                    show();
                    document.body.removeChild(_oDiv);
                }
                _oDiv.style.top=_oDiv.offsetTop-30+'px';
            }, 30);
            function show()
            {
                var oDiv=null;
                for(i=0;i<100;i++)
                {
                    oDiv=document.createElement('div');
                    oDiv.style.width='3px';
                    oDiv.style.height='3px';
                    oDiv.style.background='#'+Math.ceil(Math.random()*0xEFFFFF+0x0FFFFF).toString(16);
                    oDiv.style.position='absolute';
                    oDiv.style.left=x+'px';
                    oDiv.style.top=y+'px';
                    var a=Math.random()*360;
                    //oDiv.speedX=Math.random()*40-20;
                    //oDiv.speedY=Math.random()*40-20;
                    oDiv.speedX=Math.sin(a*180/Math.PI)*20*Math.random();
                    oDiv.speedY=Math.cos(a*180/Math.PI)*20*Math.random();
                    document.body.appendChild(oDiv);
                    aDiv.push(oDiv);
                }
            }
            setInterval(doMove, 30);
            function doMove()
            {
                for(i=0;i<aDiv.length;i++)
                {
                    aDiv[i].style.left=aDiv[i].offsetLeft+aDiv[i].speedX+'px';
                    aDiv[i].style.top=aDiv[i].offsetTop+aDiv[i].speedY+'px';
                    aDiv[i].speedY+=1;
                    if(aDiv[i].offsetLeft<0 || aDiv[i].offsetLeft>document.documentElement.clientWidth || aDiv[i].offsetTop<0 || aDiv[i].offsetTop>document.documentElement.clientHeight) {
                        document.body.removeChild(aDiv[i]);
                        aDiv.splice(i, 1);
                    }
                }
            }
        };
    }
}

// ======================== auto select course =========================
function SectionNode(schedule, sectionType, id) {
    this.sectionType = sectionType;
    this.id = id;
    this.startGrids = [];
    this.endGrids = [];
    this.day = []
    let arr = []
    Object.values(schedule).forEach(meeting => {
        let start = getGridIdByDayTime(meeting.meetingDay, meeting.meetingStartTime, sectionType);
        let end = getGridIdByDayTime(meeting.meetingDay, meeting.meetingEndTime, sectionType);
        this.startGrids.push(start)
        this.endGrids.push(end)
        this.day.push(meeting.meetingDay)
        arr.push(start%26)
    });
    function getMinMax(arr) {
        let min = arr[0];
        let max = arr[0];
        let i = arr.length;
        while (i--) {
            min = arr[i] < min ? arr[i] : min;
            max = arr[i] > max ? arr[i] : max;
        }
        return { min, max };
    }
    let k = getMinMax(arr)
    this.earlist = k.min
}

function autoSelect(autotype) {
    let missing_sections = getMissing()
    load.then(courses => {
        missing_sections.forEach(section => {
            let selections = []
            let sections = section.getElementsByClassName("coursebutton")
            for (let i = 0; i < sections.length; i++) {
                selections.push(new SectionNode(courses[sections[i].id.split("|")[0]].
                    meetings[sections[i].id.split("|")[1]].schedule, courses[sections[i].id.split("|")[0]].section, sections[i].id))
            }
            if (autotype === "LATE") noMorning(selections);
            if (autotype === "BALANCE") shuffle(selections);
            if (autotype === "EARLY") noNight(selections);
            if (autotype === "Long Weekend") noFriday(selections);

            for (let i=0;i < selections.length;i++){
                if (noConflict(selections[i])){
                    selectSection(selections[i].id)
                    break
                }
            }

        })

    })
}

function noConflict(SectionNode) {
    let all_ = []
    let graphs = document.getElementsByClassName("courseGraph");
    for (let i=0;i<graphs.length;i++){
        let start = parseInt(graphs[i].parentNode.id)
        let duration = graphs[i].offsetHeight/25;
        for (let j=0;j<duration;j++) all_.push(start + j)
    }
    log(all_)
    for (let i=0;i<SectionNode.startGrids.length;i++){
        if (SectionNode.startGrids[i]===null || SectionNode.startGrids[i]===undefined){
            return true;
        } else {
            let j = SectionNode.startGrids[i]
            while (j < SectionNode.endGrids[i]){
                if (all_.includes(j)){
                    return false
                }
                j ++;
            }
        }
    }
    return true
}



function getMissing() {
    let selectedCourses = document.getElementsByClassName("menu__item")
    let wait = []
    for (let i=0;i<selectedCourses.length;i++){
        let childs = selectedCourses[i].childNodes[selectedCourses[i].childNodes.length - 1].childNodes
        for (let j=0;j<childs.length;j++){
            if (childs[j].getElementsByClassName("selected_button").length === 0){
                wait.push(childs[j])
            }
        }
    }
    return wait
}


function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
}


function noMorning(selections) {
    selections.sort((a, b) => {
        if (a.earlist < b.earlist) return 1;
        return -1;
    })
}

function noNight(selections) {
    selections.sort((a, b) => {
        if (a.earlist < b.earlist) return -1;
        return 1;
    })
}

function noFriday(selections) {
    selections.sort((a, b) => {
        if (a.day.includes("FR") && !b.day.includes("FR")) {
            return 1
        }
        return -1;
    })
}

function openSetting() {
    if (document.getElementById("generateMethodBox").style.display === "")
        document.getElementById("generateMethodBox").style.display = "none"
    else document.getElementById("generateMethodBox").style.display = ""


}



load.then(courses => {
    // load_cookie(courses);
    autocomplete(document.getElementById("search"), courses);
});
