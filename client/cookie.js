"use strict"

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

function cookie__add_course(courseTitle) {
    let selectedCourses = {}
    if (document.cookie){
        selectedCourses = JSON.parse(document.cookie.split("&")[0].split("=")[1]);
    }
    selectedCourses[courseTitle] = {}
    const d = new Date();
    d.setTime(d.getTime() + (5*365*24*60*60*1000));
    const expires = "expires="+ d.toUTCString();
    let selectedCourses_str = JSON.stringify(selectedCourses);
    document.cookie = "courses" + "=" + selectedCourses_str + ";" + expires + ";path=/";
}


function cookie__remove_course(courseTitle) {
    let selectedCourses = {}
    if (document.cookie){
        selectedCourses = JSON.parse(document.cookie.split("&")[0].split("=")[1]);
        delete selectedCourses[courseTitle.slice(6)]
        const d = new Date();
        d.setTime(d.getTime() + (5*365*24*60*60*1000));
        const expires = "expires="+ d.toUTCString();
        let selectedCourses_str = JSON.stringify(selectedCourses);
        document.cookie = "courses" + "=" + selectedCourses_str + ";" + expires + ";path=/";
    }
}


function cookie__add_section(sectionID, schedule, type) {
    let selectedCourses = {}
    if (document.cookie){
        selectedCourses = JSON.parse(document.cookie.split("&")[0].split("=")[1]);
    }
    const courseTitle = sectionID.split("|")[0]
    selectedCourses[courseTitle][sectionID] = {}
    selectedCourses[courseTitle][sectionID].schedule = schedule
    selectedCourses[courseTitle][sectionID].sectionType = type
    const d = new Date();
    d.setTime(d.getTime() + (5*365*24*60*60*1000));
    const expires = "expires="+ d.toUTCString();
    let selectedCourses_str = JSON.stringify(selectedCourses);
    document.cookie = "courses" + "=" + selectedCourses_str + ";" + expires + ";path=/";
}

function cookie__delete_section(sectionID) {
    let selectedCourses = {}
    if (document.cookie){
        selectedCourses = JSON.parse(document.cookie.split("&")[0].split("=")[1]);
    }
    const courseTitle = sectionID.split("|")[0]
    delete selectedCourses[courseTitle][sectionID]
    const d = new Date();
    d.setTime(d.getTime() + (5*365*24*60*60*1000));
    const expires = "expires="+ d.toUTCString();
    let selectedCourses_str = JSON.stringify(selectedCourses);
    document.cookie = "courses" + "=" + selectedCourses_str + ";" + expires + ";path=/";
}

function remove_cookie() {
    const d = new Date();
    d.setTime(d.getTime() + (5*365*24*60*60*1000));
    const expires = "expires="+ d.toUTCString();
    document.cookie = "courses" + "={}"  + ";" + expires + ";path=/";
}

function cookie__add_block(id) {
    
}

function show_cookie() {
    console.log(JSON.parse(document.cookie.split("&")[0].split("=")[1]))
}


function load_cookie() {
    let selectedCourses = {}
    if (document.cookie){
        selectedCourses = JSON.parse(document.cookie.split("&")[0].split("=")[1]);
    }
    Object.keys(selectedCourses).forEach(courseID => {
        addToCart(courseID.slice(0, 8) + courseID[9] + " ")
        Object.keys(selectedCourses[courseID]).forEach(sectionID => {
            selectSection(sectionID)
        })
    })
}

