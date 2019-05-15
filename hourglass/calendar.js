const terms = $(".calendar__term").select();
const times = ["08:00", "", "09:00", "", "10:00", "", "11:00", "", "12:00", "", "13:00", "", "14:00"
    , "", "15:00", "", "16:00", "", "17:00", "", "18:00", "", "19:00", "", "20:00", ""];
const term_name = ["fall", "winter"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
var debug = 0;
const log = debug ? console.log : function () {};

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

