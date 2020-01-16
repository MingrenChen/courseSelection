<template>
    <div id="app" v-if="!rerender">
        <transition name="dropping">
            <Snowf v-if="droppingStart"
                    v-bind="droppingConfig" />
        </transition>
        <div id="searchArea">
            <div class="cd-sidenav__semester">
                <div class="cd-sidenav__semester-toggle">
                    <i class="fab fa-canadian-maple-leaf fa-2x" :class="semesterClass('fall')"></i>
                    <div id="fall" :class="semesterClass('fall')">Fall</div>
                    <toggle-button
                            :color="{checked: 'deepskyblue', unchecked: 'rgb(242, 122, 41)'}"
                            @change="switchSemester"
                    ></toggle-button>
                    <div id="winter" :class="semesterClass('winter')">Winter</div>
                    <i class="fas fa-snowflake fa-2x" :class="semesterClass('winter')"></i>
                </div>
            </div>

            <Autocomplete :search="search"
                          :get-result-value="getResultValue"
                          @submit="selectCourse"
            ></Autocomplete>
        </div>

        <sidebar v-if="sidebarState.showSidebar && this.selectionLoading" :sidebar-state="this.sidebarState" :courses="this.cleanCourse"
                 :selections="this.selections">
        </sidebar>

        <timetable  v-if="this.selectionLoading" :selections="this.selections" :semester="this.semester" :courses="this.cleanCourse"></timetable>

        <modal v-if="modalState.course !== null" :modal-state="this.modalState"
               :all-meeting-time="this.allMeetingTime" :selections="this.selections[modalState.course.keyCode]">
        </modal>
        <transition name="cover">
            <div v-if="modalState.course !== null" class="cd-schedule__cover-layer" @click="closeModal"></div>
        </transition>
    </div>
</template>

<script>
    import { ToggleButton } from 'vue-js-toggle-button'
    import timetable from './components/timetable.vue'
    import modal from './components/modal.vue'
    import EventBus from '@/js/EventBus'
    import sidebar from "./components/sidebar";
    import axios from 'axios'
    import Vue from 'vue'
    import VueCookies from 'vue-cookies'
    // autocomplete for search bar
    import Autocomplete from '@trevoreyre/autocomplete-vue'
    import '@trevoreyre/autocomplete-vue/dist/style.css'
    // notification message
    import VueNotification from "@kugatsu/vuenotification";
    import Snowf from 'vue-snowf';
    import snowpick from './assets/image/snow.png'
    import mapleleaf from './assets/image/mapleleaf.png'


    Vue.use(VueNotification, {
        primary: {
            background: "#85c0ff",
            color: "white"
        },
        error: {
            background: "#c73232"
        }
    });

    Vue.use(Autocomplete)
    Vue.use(VueCookies)
    Vue.$cookies.config('1y')

    export default {
        name: 'app',
        components: {
            sidebar,
            timetable,
            modal,
            Autocomplete,
            ToggleButton,
            Snowf
        },
        created() {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        },
        mounted() {
            EventBus.$on('meetingClick', courseID => {
                if (this.sidebarState.focusCourse !== courseID){
                    this.sidebarState.focusCourse = courseID
                } else {
                    this.sidebarState.focusCourse = null
                }
            });
            EventBus.$on('selectSection', info => {
                this.selectSection(info.courseID, info.sectionID)
            })
            EventBus.$on('unselectSection', info => {
                this.unSelectSection(info.courseID, info.sectionID)
            })
            // bounding box is for animation, where the color column come from.
            EventBus.$on('openModal', (headerBoundingBox, contentBoundingBox, keyCode) => {
                this.openModal(headerBoundingBox, contentBoundingBox, keyCode)
            });
            EventBus.$on('closeModal', ()=>{
                this.closeModal()
            });
            EventBus.$on('removeCourse', keyCode => {
                this.unSelectCourse(keyCode)
            })

            // get selections from cookie.
            if (Vue.$cookies.isKey('selections')){
                 this.selections = Vue.$cookies.get('selections')
            } else {
                this.selections = {}
            }

            // first create a collection of request, and send them all together.
            // after all request done, set selectionLoading to true, then timetable/sidebar render.
            let requests = [];
            Object.keys(this.selections).forEach(courseID => {
                requests.push(axios.get('http://localhost:2000/course/' + courseID))
            })
            axios.all(requests).then(responses => {
                for (let i=0;i<responses.length; i++){
                    if (Object.keys(responses[i].data).length > 0){
                        let course = responses[i].data
                        Object.assign(this.courses, course)
                    } else {
                        let url_split = responses[i].config.url.split('/')
                        let courseId = url_split[url_split.length - 1]
                        this.$delete(this.selections, courseId)
                    }
                }
                this.selectionLoading = true
            }).catch(error => {
                console.log(error)
            })


        },
        destroyed() {
            window.removeEventListener('resize', this.handleResize)
        },
        data: function() {
            return {
                semester: 'fall',
                rerender: false,
                selectionLoading: false,
                // course and sections which user selected. Cache on local.
                selections: {
                },
                // we need to store each course's data-event to measure it's color
                courses_date_event: {
                },
                // the popup's state.
                modalState: {
                    headerBoundingBox: null,
                    contentBoundingBox: null,
                    course: null
                },
                sidebarState: {
                    focusCourse: null,
                    showSidebar: true,
                },
                window: {
                    width: 0,
                    height: 0
                },
                courses: {},
                dropping: {'fall': mapleleaf, 'winter': snowpick},
                droppingConfigData: {
                    size: 20,
                    speed: 5,
                    wind: 1,
                    opacity: 0.8,
                    swing: 4,
                    zIndex: 1,
                    resize: true,
                    color: "#00bfff",
                },
                droppingStart: false

            }
        },
        watch: {
            selections: function () {
                Vue.$cookies.set('selections', this.selections)
            }
        },
        computed: {
            // add keyCode and event number to course
            cleanCourse: function(){
                let courses = JSON.parse(JSON.stringify(this.courses))
                for (let i=0; i<Object.keys(courses).length;i++){
                    let keyCode = Object.keys(courses)[i]
                    let course = courses[keyCode]
                    course.keyCode = keyCode
                    course.event = this.getCourseDataEvent(keyCode)
                }
                return courses
            },
            // get all the meeting time, use for check if conflict with some meetings
            allMeetingTime: function() {
                let times = []
                Object.values(this.cleanCourse).map(course => {
                    Object.keys(course.meetings).forEach(sectionCode => {
                        if (this.selections[course.keyCode].includes(sectionCode)){
                            let meetings = Object.values(course.meetings[sectionCode].schedule)
                            meetings.map(meeting => {
                                meeting.section = course.section
                            })
                            times = times.concat(meetings)
                        }
                    })
                })
                return times
            },
            droppingConfig: function () {
                this.droppingConfigData.image = this.dropping[this.semester]
                return this.droppingConfigData
            }

        },
        methods: {
            handleResize() {
                this.window.width = window.innerWidth;
                this.window.height = window.innerHeight
            },
            getCourseDataEvent: function(courseId){
                let data_event_id = Object.keys(this.courses_date_event)
                    .find(data_event_id => this.courses_date_event[data_event_id] === courseId)
                if (data_event_id){
                    return 'event-' + data_event_id
                } else {
                    // if there's no such course in courseDataEvent, add one
                    let i = 1
                    while (i < 17) {
                        if (!this.courses_date_event[i]){
                            Vue.set(this.courses_date_event, i, courseId)
                            return 'event-' + i
                        }
                        i ++;
                    }
                    return null
                }

            },
            // get credit for different semester
            getCredit: function(semester) {
                return Object.keys(this.selections).map(element => {
                    if (element.split('-')[1] === semester || element.split('-')[1] === 'Y'){
                        return 1
                    }
                    return 0
                }).reduce((a,b) => a + b, 0)/2
            },
            openModal: function(headerBoundingBox, contentBoundingBox, keyCode) {
                this.modalState.course = this.cleanCourse[keyCode]
                this.modalState.headerBoundingBox = {top: headerBoundingBox.top, left: headerBoundingBox.left,
                    width: headerBoundingBox.width, height: headerBoundingBox.height}
                this.modalState.contentBoundingBox = {top: contentBoundingBox.top, left: contentBoundingBox.left,
                    width: contentBoundingBox.width, height: contentBoundingBox.height}
            },
            closeModal: function() {
                this.modalState.course = null
                this.modalState.headerBoundingBox = null
                this.modalState.contentBoundingBox = null
            },
            switchSemester: function(value){
                if (this.semester === 'fall') {
                    this.semester = 'winter'
                } else {
                    this.semester = 'fall'
                }
                this.droppingStart = true
                setTimeout(()=>{this.droppingStart = false}, 1000)
            },
            semesterClass: function (semester) {
                return {'semester-not-selected': this.semester !== semester}
            },

            selectSection: function(courseID, sectionID) {
                let selections = JSON.parse(JSON.stringify(this.selections));
                if (!(courseID in this.selections)) {
                    selections[courseID] = [sectionID]
                } else {
                    selections[courseID].push(sectionID)
                }
                this.selections = selections
            },
            unSelectSection: function(courseID, sectionID) {
                let selections = JSON.parse(JSON.stringify(this.selections));
                selections[courseID] = this.selections[courseID].filter(e => e !== sectionID);
                this.selections = selections
            },
            selectCourse: function(course){
                if (this.courses[Object.keys(course)[0]]){
                    this.sidebarState.focusCourse = Object.keys(course)[0]
                } else {
                    let sec = Object.values(course)[0].section
                    let fallCredit = this.getCredit('F')
                    let winterCredit = this.getCredit('S')
                    if (sec === 'Y' &&  winterCredit>= 4 && fallCredit >= 4 ||
                        sec !== 'Y' && this.getCredit(sec) >= 4){
                        let message = "The maximum course load in the Fall/Winter Session is six courses. \n"

                        this.$notification.error(message,
                            {   infiniteTimer: true,
                                position: "topCenter",
                                showCloseIcn:true,
                                title: 'You already selected 8 courses!'
                            });
                    } else {
                        Vue.set(this.courses, Object.keys(course)[0], Object.values(course)[0])
                        Vue.set(this.selections, Object.keys(course)[0], [])
                    }

                }
            },
            unSelectCourse: function (keyCode) {
                this.$delete(this.selections, keyCode)
                this.$delete(this.courses, keyCode)
                let event_id = parseInt(this.getCourseDataEvent(keyCode).split('-')[1])
                this.$delete(this.courses_date_event, event_id)
                if (this.sidebarState.focusCourse === keyCode){
                    this.sidebarState.focusCourse = null
                }
            },


            // the following 2 methods are for search and autocomplete
            search: function (input) {
                return axios.get('http://localhost:2000/getautocomplete/' + input).then(response => {
                    return response.data
                })
            },
            getResultValue(result) {
                let course = Object.values(result)[0]
                return course.code.slice(0, 6) + course.section + " " + course.courseTitle
            }
        }
    }
</script>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');
    @import "assets/css/variable.scss";


    html,
    body {
        font-family: 'Open Sans', sans-serif;
        font-weight: lighter;
        height: 100%;
        box-sizing: border-box;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    #app {
        height: 100%;
    }

    #searchArea {
        height: $schedule-search-height;
        .autocomplete {
            width: 25%;
            position: absolute;
            left: 70%;
            z-index: 3;
        }

        .cd-sidenav__semester{
            position: absolute;
            width: max-content;
            left: calc(#{$sidenav-width} + 40px);
            top: 20px;
            .cd-sidenav__semester-toggle {
                width: max-content;
                text-align: center;
                margin: 0 auto;
                display: flex;
                label {
                    margin-top: 3px;
                }
            }

            .semester-not-selected {
                opacity: 0.6;
                background: #cccccc !important;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
            }

            #winter{
                font-size: larger;
                background: linear-gradient(deepskyblue, #8eedfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-left: 5px;
            }

            .fa-snowflake {
                background: linear-gradient(deepskyblue, #8eedfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: initial; /* reset Font Awesome's display:inline-block */
                margin-left: 5px;
            }


            .fa-canadian-maple-leaf {
                background: linear-gradient(rgb(255, 0, 0), rgb(255, 163, 59));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: initial; /* reset Font Awesome's display:inline-block */
                margin-right: 5px;
            }

            #fall{
                font-size: larger;
                background: linear-gradient(rgb(255, 0, 0), rgb(255, 163, 59));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-right: 5px;
            }
        }
    }

    @for $i from 1 through 16 {

        .cd-schedule__event [data-event=#{"event-" + $i}],
        .sidebar-header[data-event=#{"event-" + $i}],
        .cd-schedule-modal[data-event=#{"event-" + $i}] .cd-schedule-modal__header {
            background:  nth($colors, $i)
        }
    }
    .cd-schedule__cover-layer {
        // layer between the content and the modal window
        position: fixed;
        z-index: 3;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background: rgba(128, 128, 128, .8);

        opacity: 1;
        transition: opacity .4s, visibility .4s;
    }

    .cover-enter-active,
    .cover-leave-active {
        transition: opacity .5s;
    }

    .cover-enter,
    .cover-leave-to
        /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }


    .dropping-enter-active,
    .dropping-leave-active {
        transition: opacity .5s;
    }

    .dropping-enter,
    .dropping-leave-to
        /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }</style>
