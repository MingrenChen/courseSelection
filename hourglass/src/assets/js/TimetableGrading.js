// grading system for a timetable.
//

let meetings = [
    {"meetingDay":"MO","meetingStartTime":"10:00","meetingEndTime":"11:00","meetingScheduleId":"169885","assignedRoom1":"","assignedRoom2":null,"courseId":"CSC108H1-F-20199","section":"F","selectedSectionId":"LEC-0101","event":"event-1","code":"CSC108H1","courseTitle":"Introduction to Computer Programming"},
    {"meetingDay":"MO","meetingStartTime":"09:00","meetingEndTime":"10:00","meetingScheduleId":"171431","assignedRoom1":"","assignedRoom2":"","courseId":"MAT137Y1-Y-20199","section":"Y","selectedSectionId":"LEC-0101","event":"event-2","code":"MAT137Y1","courseTitle":"Calculus"},
    {"meetingDay":"MO","meetingStartTime":"14:00","meetingEndTime":"16:00","meetingScheduleId":"169819","assignedRoom1":"","assignedRoom2":null,"courseId":"STA130H1-F-20199","section":"F","selectedSectionId":"LEC-0201","event":"event-3","code":"STA130H1","courseTitle":"An Introduction to Statistical Reasoning and Data Science"},
    {"meetingDay":"MO","meetingStartTime":"11:00","meetingEndTime":"12:00","meetingScheduleId":"144978","assignedRoom1":null,"assignedRoom2":null,"courseId":"AST101H1-F-20199","section":"F","selectedSectionId":"TUT-0202","event":"event-4","code":"AST101H1","courseTitle":"The Sun and Its Neighbours"}
    ];


let getScheduleTimestamp = function (time) {
    //accepts hh:mm format - convert hh:mm to timestamp
    time = time.replace(/ /g,'');
    let timeArray = time.split(':');
    return (parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]))/60;
};

let hasConflict = function(that, other){
    return (!(that.meetingStartTime >= other.meetingEndTime
        || that.meetingEndTime <= other.meetingStartTime))
        &&  (that.meetingDay === other.meetingDay)
};

let sortMeetings = function(meetings){
    return meetings.sort((x, y) => {
        if (x.meetingStartTime > y.meetingStartTime){
            return 1
        } else if (x.meetingStartTime === y.meetingStartTime){
            if (x.meetingEndTime > y.meetingEndTime){
                return 1
            } else if (x.meetingEndTime < y.meetingEndTime){
                return -1
            }
            return 0
        }
        return -1
    })
};


let noConflict = function(meetings, emerg) {
    let score = 0;
    for (let i=0; i<meetings.length - 1; i++) {
        let thisMeeting = meetings[i];
        let nextMeeting = meetings[i+1];
        if (hasConflict(thisMeeting, nextMeeting)
            || thisMeeting.meetingEndTime <= nextMeeting.meetingStartTime){
            score += emerg
        }
    }
    return score
};

let noContinuousCourses = function(meetings, emerg){
    let score = 0;
    for (let i=0; i<meetings.length - 1; i++) {
        let thisMeeting = meetings[i];
        let nextMeeting = meetings[i+1];
        if (thisMeeting.meetingEndTime === nextMeeting.meetingStartTime
            && thisMeeting.courseId !== nextMeeting.courseId){
            score += emerg
        }
    }
    return score
};

let blockTime = function(meetings, times){
    let score = 0;
    times.forEach(time => {
        meetings.forEach(meetings => {
            let t = {meetingStartTime: time + ":00",
                meetingEndTime: time + 1 + ":00"};
            if (time === 9) {
                t.meetingStartTime = "09:00"
            }
            if (hasConflict(meetings, t)){
                score += 10000
            }
        })
    });
    return score
};


let dayGrading = function (meetings, criteria) {
    let score = 0;
    meetings = sortMeetings(meetings);
    criteria.forEach(func => {
        score += func(meetings, 50)
    });
    return score
};

score = dayGrading(meetings, [noConflict, noContinuousCourses]);
console.log(blockTime(meetings, [9,11]));
