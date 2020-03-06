<template>
    <div id="app" v-if="!rerender">
        <transition name="dropping">
            <Snowf v-if="droppingStart"
                    v-bind="droppingConfig" />
        </transition>
        <appheader v-if="this.selectionLoading" :all-missing-sections="this.allMissingSections"
                    :all-meeting-time="this.allMeetingTime"
        ></appheader>

        <sidebar v-if="!$isMobile && this.selectionLoading" :sidebar-state="this.sidebarState" :courses="this.sanitizeCourse"
                 :selections="this.selections">
        </sidebar>

        <timetable  v-if="this.selectionLoading" :selections="this.selections" :semester="this.semester" :courses="this.sanitizeCourse"></timetable>

        <modal v-if="modalState.course !== null" :modal-state="this.modalState"
               :all-meeting-time="this.allMeetingTime" :selections="this.selections[modalState.course.courseId]">
        </modal>
        <transition name="cover">
            <div v-if="modalState.course !== null" class="cd-schedule__cover-layer" @click="closeModal"></div>
        </transition>
        <div v-if="showDropdownCover" class="cd-schedule__dropdown-cover-layer" @click="closeDropdown"></div>
    </div>
</template>

<script>
    import timetable from './components/timetable.vue'
    import modal from './components/modal.vue'
    import EventBus from './assets/js/EventBus.js'
    import sidebar from "./components/sidebar";
    import axios from 'axios'
    import Vue from 'vue'


    // animation when change semester
    import Snowf from 'vue-snowf';
    import snowpick from './assets/image/snow.png'
    import mapleleaf from './assets/image/mapleleaf.png'
    import Appheader from "./components/appheader";

    export default {
        name: 'app',
        components: {
            Appheader,
            sidebar,
            timetable,
            modal,
            Snowf,
        },

        created() {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        },
        beforeMount(){
            // get selections from cookie.
            if (Vue.$cookies.isKey('selections')){
                this.selections = Vue.$cookies.get('selections')
            } else {
                this.selections = {}
            }
            // first create a collection of request, and send them all together.
            // after all request done, set selectionLoading to true, then timetable/sidebar render.
            let requests = [];
            Object.keys(this.selections).forEach(courseId => {
                requests.push(axios.get('http://www.talentgroup.agency:2000/course/' + courseId))
            });
            axios.all(requests).then(responses => {
                for (let i=0;i<responses.length; i++){
                    if (Object.keys(responses[i].data).length > 0){
                        let course = responses[i].data;
                        Object.assign(this.courses, course)
                    } else {
                        let url_split = responses[i].config.url.split('/');
                        let courseId = url_split[url_split.length - 1];
                        this.$delete(this.selections, courseId)
                    }
                }
                this.selectionLoading = true
            }).catch(error => {
                console.log(error)
            });
        },
        mounted() {
            // EventBus is to receive and sending request between different
            // vue component. Receiving mostly in App.vue

            // meetingClick happened when user click on the meeting
            EventBus.$on('meetingClick', courseId => {
                if (!this.$isMobile) {
                    if (this.sidebarState.focusCourse !== courseId){
                        this.sidebarState.focusCourse = courseId
                    } else {
                        this.sidebarState.focusCourse = null
                    }
                } else {
                    let config = {top: 0, height: 0, left: 0, width: 0};
                    EventBus.$emit('openModal', config, config, courseId)
                }
            });

            // to receive signal to select/unselect a section
            EventBus.$on('selectSection', info => {
                this.selectSection(info.courseId, info.sectionId)
            });
            EventBus.$on('unselectSection', info => {
                this.unSelectSection(info.courseId, info.sectionId)
            });

            // bounding box is for animation, where the color column come from.
            EventBus.$on('openModal', (headerBoundingBox, contentBoundingBox, courseId) => {
                this.openModal(headerBoundingBox, contentBoundingBox, courseId)
            });
            EventBus.$on('closeModal', ()=>{
                this.closeModal()
            });

            // to select or unselect a course
            EventBus.$on('removeCourse', courseId => {
                this.unSelectCourse(courseId)
            });
            EventBus.$on('selectCourse', course => {
                this.selectCourse(course);
                let courseId = Object.keys(course)[0];
                if (this.$isMobile){
                    // if is mobile device, open modal directly
                    let config = {top: 0, height: 0, left: 0, width: 0};
                    EventBus.$emit('openModal', config, config, courseId)
                }
            });
            EventBus.$on('emptyCourses', ()=>{
                Object.keys(this.selections).map(courseId => {
                    this.unSelectCourse(courseId)
                });
                this.$cookies.remove('selections')
            });


            EventBus.$on('openDropdownCover', ()=>{
                this.showDropdownCover = true
            });




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
                showDropdownCover: false,
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
                droppingStart: false,
                colors: [
                    [271, '23%', '26%'],   // Martinique
                    [162, '14%', '68%'],   // Edward
                    [31, '89%', '68%'],    // Rajah
                    [199, '25%', '46%'],   // gray
                    [136, '72%', '45%'],   // green
                    [195, '100%', '50%'],   // Smalt Blue
                    [349, '84%', '77%'],   // Smalt Blue
                    [293, '71%', '57%'],   // Smalt Blue
                    [44, '55%', '37%'],   // Smalt Blue
                    [247, '55%', '37%'],   // Smalt Blue
                    [81, '52%', '21%'],   // Smalt Blue
                    [11, '81%', '53%'],   // Smalt Blue
                    [240, '81%', '79%'],   // Smalt Blue
                    [308, '21%', '35%'],   // Smalt Blue
                    [176, '80%', '56%'],   // Smalt Blue
                    [359, '79%', '33%'],   // Smalt Blue
                ]
            }
        },
        watch: {
            // when selections change, we save it to cookie
            selections: function () {
                Vue.$cookies.set('selections', this.selections)
                // this.$allMeetingTime = this.allMeetingTime
            }
        },
        computed: {
            // add courseId and event number to course
            sanitizeCourse: function(){
                let courses = JSON.parse(JSON.stringify(this.courses));
                for (let i=0; i<Object.keys(courses).length;i++){
                    let courseId = Object.keys(courses)[i];
                    let course = courses[courseId];
                    course.courseId = courseId;
                    course.event = this.getCourseDataEvent(courseId)
                    course.color = this.getCourseColor(course.event);
                }
                return courses
            },
            // get all the meeting time, use for check if conflict with some meetings
            allMeetingTime: function() {
                let times = [];
                Object.values(this.sanitizeCourse).map(course => {
                    Object.keys(course.meetings).forEach(sectionCode => {
                        if (this.selections[course.courseId].includes(sectionCode)){
                            let meetings = Object.values(course.meetings[sectionCode].schedule);
                            meetings.map(meeting => {
                                meeting.section = course.section
                            });
                            times = times.concat(meetings)
                        }
                    })
                });
                return times
            },

            /*
            小明选了csc108的lec0101但没选tut，这个方程就会return {'csc108': {tut: ['tut-0101', 'tut-0201']}}
            */
            allMissingSections: function () {
                let missingSections = {};
                Object.keys(this.sanitizeCourse).map(courseId => {
                    let course = this.sanitizeCourse[courseId];
                    let selectedTeachingMethod = this.selections[courseId].map(sectionId => {
                        return sectionId.slice(0, 3)
                    });
                    let missingSectionsForThisCourse = {};
                    Object.keys(course.meetings).forEach(sectionId => {
                        let section = JSON.parse(JSON.stringify(course.meetings[sectionId]));
                        if (! selectedTeachingMethod.includes(section.teachingMethod)){
                            if (!Object.keys(missingSectionsForThisCourse).includes(section.teachingMethod)) {
                                missingSectionsForThisCourse[section.teachingMethod] = {}
                            }
                            section['section'] = course.section;
                            missingSectionsForThisCourse[section.teachingMethod][sectionId] = section;
                        }
                    });
                    if (Object.keys(missingSectionsForThisCourse).length > 0){
                        missingSections[courseId] = missingSectionsForThisCourse;
                    }
                });
                return missingSections
            },

            // config for the dropping maple leaf or snow pick
            droppingConfig: function () {
                this.droppingConfigData.image = this.dropping[this.semester];
                return this.droppingConfigData
            },


        },
        methods: {
            handleResize() {
                this.window.width = window.innerWidth;
                this.window.height = window.innerHeight
            },
            // we use data event tag for color of each course. We need to add event to this.course
            getCourseDataEvent: function(courseId){
                let data_event_id = Object.keys(this.courses_date_event)
                    .find(data_event_id => this.courses_date_event[data_event_id] === courseId);
                if (data_event_id){
                    return 'event-' + data_event_id
                } else {
                    // if there's no such course in courseDataEvent, add one
                    let i = 1;
                    while (i < 17) {
                        if (!this.courses_date_event[i]){
                            Vue.set(this.courses_date_event, i, courseId);
                            return 'event-' + i
                        }
                        i ++;
                    }
                    return null
                }
            },
            // we use data event tag for color of each course. We need to add event to this.course
            getCourseColor: function(dataEvent){
                let data_event_id = parseInt(dataEvent.split("-")[1])
                return 'hsl(' + this.colors[data_event_id].join(',') + ')'
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
            // when click on cover layer for dropdown, close drop down in navigator
            closeDropdown: function(){
                EventBus.$emit("closeDropdown");
                this.showDropdownCover = false
            },
            openModal: function(headerBoundingBox, contentBoundingBox, courseId) {
                this.modalState.course = this.sanitizeCourse[courseId];
                this.modalState.headerBoundingBox = {top: headerBoundingBox.top, left: headerBoundingBox.left,
                    width: headerBoundingBox.width, height: headerBoundingBox.height};
                this.modalState.contentBoundingBox = {top: contentBoundingBox.top, left: contentBoundingBox.left,
                    width: contentBoundingBox.width, height: contentBoundingBox.height}
            },
            closeModal: function() {
                this.modalState.course = null;
                this.modalState.headerBoundingBox = null;
                this.modalState.contentBoundingBox = null;
                if (this.$isMobile){
                    let emptyCourse = Object.keys(this.selections).filter(
                        key => this.selections[key].length === 0
                    );
                    emptyCourse.forEach(course => {
                        this.unSelectCourse(course)
                    })
                }
            },
            switchSemester: function(){
                if (this.semester === 'fall') {
                    this.semester = 'winter'
                } else {
                    this.semester = 'fall'
                }
                this.droppingStart = true;
                setTimeout(()=>{this.droppingStart = false}, 1000)
            },


            selectSection: function(courseId, sectionId) {
                let selections = JSON.parse(JSON.stringify(this.selections));
                if (!(courseId in this.selections)) {
                    selections[courseId] = [sectionId]
                } else {
                    selections[courseId].push(sectionId)
                }
                this.selections = selections
            },
            unSelectSection: function(courseId, sectionId) {
                let selections = JSON.parse(JSON.stringify(this.selections));
                selections[courseId] = this.selections[courseId].filter(e => e !== sectionId);
                this.selections = selections
            },
            selectCourse: function(course){
                if (this.courses[Object.keys(course)[0]]){
                    this.sidebarState.focusCourse = Object.keys(course)[0]
                } else {
                    let sec = Object.values(course)[0].section;
                    let fallCredit = this.getCredit('F');
                    let winterCredit = this.getCredit('S');
                    if (sec === 'Y' &&  winterCredit>= 4 && fallCredit >= 4 ||
                        sec !== 'Y' && this.getCredit(sec) >= 4){
                        let message = "The maximum course load in the Fall/Winter Session is six courses. \n";

                        this.$notification.error(message,
                            {   infiniteTimer: true,
                                position: "topCenter",
                                showCloseIcn:true,
                                title: 'You already selected 8 courses!'
                            });
                    } else {
                        Vue.set(this.courses, Object.keys(course)[0], Object.values(course)[0]);
                        Vue.set(this.selections, Object.keys(course)[0], [])
                    }

                }
            },
            unSelectCourse: function (courseId) {
                this.$delete(this.selections, courseId);
                this.$delete(this.courses, courseId);
                let event_id = parseInt(this.getCourseDataEvent(courseId).split('-')[1]);
                this.$delete(this.courses_date_event, event_id);
                if (this.sidebarState.focusCourse === courseId){
                    this.sidebarState.focusCourse = null
                }
            },



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
        width: 97%;
        box-sizing: border-box;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    #app {
        height: 100%;
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


    .cd-schedule__dropdown-cover-layer {
        // layer between the content and the dropdown
        position: fixed;
        z-index: 1;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        opacity: 1;
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
    }


</style>
