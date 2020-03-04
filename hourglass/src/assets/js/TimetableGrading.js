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

/*
Measure if two meeting schedules are conflict
 */
let hasConflictBetweenMeetings = function(that, other){
    return (!(that.meetingStartTime >= other.meetingEndTime
        || that.meetingEndTime <= other.meetingStartTime))
        &&  (that.meetingDay === other.meetingDay)
        &&  (that.section === other.section)
};

let hasConflictBetweenMeetingAndAllMeeting = function(meeting, allMeetingTime){
    let result = allMeetingTime.filter(selectedMeeting => {
        return hasConflictBetweenMeetings(meeting, selectedMeeting)
    });
    return result.length > 0
};

let getConflictBetweenSectionAndAllMeeting = function(section, allMeetingTime){
    let result = Object.values(section.schedule).map(meeting => {
        meeting.section = section.section;
        if (hasConflictBetweenMeetingAndAllMeeting(meeting, allMeetingTime)){
            return true
        }
    });
    return result.some(element => !! element) ? -100 : 0;
};

let getTimeScore = function (section, value) {
    let scores = [];
    Object.values(section.schedule).forEach(meeting => {
        let start = getScheduleTimestamp(meeting.meetingStartTime);
        let end = getScheduleTimestamp(meeting.meetingEndTime);

        scores.push(timeGrading(start, end, value))
    });
    return scores.reduce((a,b) => a + b, 0)
};

let timeGrading = function (timeStart, timeEnd, value) {
    let tstart = timeStart - 15;
    let tend = timeEnd - 15;
    let score = tstart + tend;
    switch (value) {
        case 'early':
            return -score;
        case 'late':
            return score;
        case 'balance':
            return 30 - Math.abs(score);
        default:
            return 0;
    }
};

let getDayScore = function (section, value) {
    let scores = [];
    Object.values(section.schedule).forEach(meeting => {
        let day = meeting.meetingDay;
        scores.push(dayGrading(day, value))
    });
    return scores.reduce((a,b) => a + b, 0)
};

let dayGrading = function(day, value) {
    if (value === 'Long Weekend'){
        if (day === 'FR' || day === 'MO'){
            return -20
        }
    }
    return 0;
};

let getTotalScore = function (section, allMeetingTime, value) {
    return getConflictBetweenSectionAndAllMeeting(section, allMeetingTime) +
        getDayScore(section, value) + getTimeScore(section, value)
}

export default getTotalScore;

