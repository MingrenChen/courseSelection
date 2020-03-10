<template>
    <div class="dropdown" @click="clickDropdown">
        <img :src="menuUrl" class="dropbtn">
            <div class="dropdown-content" v-if="isOpen">
                <a @click="saveScreenShot">
                    <img src="https://img.icons8.com/dotty/20/000000/save.png">
                    Save Calendar
                </a>
                <a @click="removeAllCourses">
                    <img src="https://img.icons8.com/dotty/20/000000/trash.png">
                    Empty courses</a>
                <a @click="reportBug">
                    <img src="https://img.icons8.com/dotty/20/000000/bug.png">
                    Report Bug
                </a>
                <a @click="generateTimetableClick">
                    <img src="https://img.icons8.com/dotty/20/000000/engineering.png">
                    Generate Timetable
                </a>
                <a @click="exportToCalendar">
                    <img src="https://img.icons8.com/dotty/20/000000/calendar.png">
                    Export to Calendar
                </a>
            </div>
    </div>
</template>

<script>

    const ics = require('ics');
    const fs = require("file-system");

    import Config from "../assets/js/.config";
    import $ from "jquery"
    import html2canvas from 'html2canvas'
    import EventBus from "../assets/js/EventBus";
    import author from '../assets/image/author.jpg'
    import getTotalScore from '../assets/js/TimetableGrading'
    import { MaxHeap } from '@datastructures-js/heap';
    import shuffle from "../assets/js/Shuffle";

    let getScheduleTimestamp = function (time) {
        //accepts hh:mm format - convert hh:mm to timestamp
        time = time.replace(/ /g,'');
        let timeArray = time.split(':');
        return (parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]));
    };

    export default {
        name: "navigator",
        data: function() {
            return {
                isOpen: false,
            }
        },
        props: [
            'meetingTimes'
        ],
        mounted() {
            EventBus.$on("closeDropdown", function () {
                this.isOpen = false
            }.bind(this))
        },
        computed: {
            menuUrl: function () {
                let size = this.$isMobile ? 25 : 50;
                return "https://img.icons8.com/officel/" + size + "/000000/menu.png"
            }
        },
        methods: {
            clickDropdown: function () {
                this.isOpen = !this.isOpen;
                if (this.isOpen){
                    EventBus.$emit('openDropdownCover')
                }
            },
            saveScreenShot: function () {
                html2canvas($(".cd-schedule")[0]).then(response => {
                    let a = document.createElement('a');
                    // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                    a.href = response.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                    a.download = 'calendar.jpg';
                    a.click();
                })
            },
            removeAllCourses: function (){
                EventBus.$emit("emptyCourses")
            },

            reportBug: function () {
                this.$fire({
                    title: "<img src=\"https://img.icons8.com/nolan/30/bug.png\">Find A Bug?",
                    text: "Add author's WeChat!",
                    imageUrl: author,
                    imageWidth: 200,
                    imageHeight: 200,
                }).then(r => {
                    console.log(r.value);
                });
            },

            generateTimetableClick: function () {
                this.$fire({
                    title: 'Preferences',
                    input: 'select',
                    inputOptions: {
                        1: 'Early',
                        2: 'Balance',
                        3: 'Late',
                        4: 'Long Weekend'
                    },
                    inputValue: 2,
                    showCancelButton: true,
                }).then(value => {
                    this.generateTimetable(value)
                })

            },
            generateTimetable: function (value) {
                // 对于每一门课
                Object.keys(this.$parent.$parent.allMissingSections).forEach(courseId => {
                    let method = this.$parent.$parent.allMissingSections[courseId];
                    Object.values(method).forEach(sections => {
                        let best_sections = {};
                        //此 method 的候选
                        Object.keys(sections).forEach(sectionId => {
                            // method是这门课所有tut/pra/lec的section
                            let section = sections[sectionId];
                            best_sections[sectionId] = getTotalScore(section, this.$parent.$parent.allMeetingTime, value)
                        });
                        // 用heap找出这些candidate中得分最高的n个
                        let heap = MaxHeap.heapify(Object.keys(best_sections).map(sectionId => {
                            let result = {};
                            result['value'] = sectionId;
                            result['key'] = best_sections[sectionId];
                            return result
                        }));
                        let result = [];
                        for (let i=0; i < 3; i++){
                            result.push(heap.extractRoot());
                        }
                        result = shuffle(result.filter(element => !!element));
                        EventBus.$emit('selectSection', {courseId: courseId, sectionId: result[0]['value']})
                    })
                })
            },

            exportToCalendar: function() {
                let schedule = this.meetingTimes;
                let importantDate = Config.importantDate;
                let events = [];
                schedule.forEach(event => {
                    let startDate = importantDate[event.section].start;
                    startDate = Config.functions.getDateOfNextDay(startDate, event.meetingDay);
                    let endDate = importantDate[event.section].end;
                    let startTime = getScheduleTimestamp(event.meetingStartTime);
                    let endTime = getScheduleTimestamp(event.meetingEndTime);

                    let duration = (endTime - startTime);

                    startDate.push(parseInt(startTime / 60));
                    startDate.push(startTime%60);

                    let RRULE = 'FREQ=WEEKLY;';
                    RRULE += "UNTIL=" + Config.functions.getDateTimeString(endDate) + ';';
                    events.push({
                        start: startDate,
                        duration: {hours: parseInt(duration / 60), minutes: duration % 60},
                        title: event.code + ' ' + event.courseTitle,
                        recurrenceRule: RRULE,
                        description: event.selectedSectionId
                    })
                });
                ics.createEvents(events, (err, value) => {
                    function download(filename, text) {
                        var element = document.createElement('a');
                        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                        element.setAttribute('download', filename);

                        element.style.display = 'none';
                        document.body.appendChild(element);

                        element.click();

                        document.body.removeChild(element);
                    }
                    download('courses.ics', value)
                })
            }
        }
    }
</script>

<style scoped lang="scss">
    .dropdown {
        @media screen and (min-width: 500px){
            /*display: none;*/
            right: 5%;
            display: inline-block;
            position: absolute;
            .dropdown-content {
                position: absolute;
                right: 0;

            }
        }
        @media screen and (max-width: 500px){
            top: 16px;
            left: 4%;
            position: absolute;
            display: inline-block;
            .dropdown-content {
                position: absolute;
            }
        }
        .dropdown-content {
            position: absolute;
            background-color: #f9f9f9;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            z-index: 3;
            width: max-content;

            a{
                color: black;
                padding: 8px 8px;
                text-decoration: none;
                cursor: pointer;
                display: block;
                font-size: smaller;
                img{
                    vertical-align: middle;
                    color: white;
                }
            }
            a:hover {
                background: gray;
            }
        }
        img {
            cursor: pointer;
        }

    }
    .dropdown-enter-active,
    .dropdown-leave-active {
        transition: opacity .5s;
    }

    .dropdown-enter,
    .dropdown-leave-to
        /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }
</style>