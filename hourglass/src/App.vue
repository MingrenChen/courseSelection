<template>
    <div id="app">
        <div id="searchArea">
            <!--      <search></search>-->
        </div>

        <sidebar v-if="sidebarState.showSidebar && this.selectionLoading" :sidebar-state="this.sidebarState" :courses="this.courses"
                 :selections="this.selections">
        </sidebar>

        <timetable  v-if="this.selectionLoading" :selections="this.selections" :courses="this.courses"></timetable>

        <modal v-if="modalState.course !== null" :modal-state="this.modalState">
        </modal>
        <transition name="cover">
            <div v-if="this.modalState.selectedMeeting !== undefined" class="cd-schedule__cover-layer" v-on:click="closeModal"></div>
        </transition>
    </div>
</template>

<script>
    import timetable from './components/timetable.vue'
    import modal from './components/modal.vue'
    import EventBus from '@/js/EventBus'
    import sidebar from "./components/sidebar";
    import axios from 'axios'

    export default {
        name: 'app',
        components: {
            sidebar,
            timetable,
            modal
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
                // this.modalState.selectedMeeting = meeting;
                // this.openModal(meeting.courseCode)
            });
            EventBus.$on('selectSection', info => {
                this.selectSection(info.courseID, info.sectionID)
            })
            EventBus.$on('unselectSection', info => {
                this.unSelectSection(info.courseID, info.sectionID)
            })
            // bounding box is for animation, where the color column come from.
            EventBus.$on('openModal', (boundingBox, keyCode) => {
                this.modalState.course = this.courses[keyCode]

                this.modalState.boundingBox = {top: boundingBox.top, left: boundingBox.left,
                    width: boundingBox.width, height: boundingBox.height}
                this.modalState.sections = this.selections[keyCode]
            })

            // first create a collection of request, and send them all together.
            // after all request done, set selectionLoading to true, then timetable/sidebar render.
            let requests = [];
            Object.keys(this.selections).forEach(courseID => {
                requests.push(axios.get('http://localhost:2000/course/' + courseID))
            })
            axios.all(requests).then(responses => {
                for (let i=0;i<responses.length; i++){
                    let course = responses[i].data
                    course[Object.keys(course)[0]].event = 'event-' + i
                    course[Object.keys(course)[0]].keyCode = Object.keys(course)[0]
                    Object.assign(this.courses, course)
                }
                this.selectionLoading = true
            })
        },
        destroyed() {
            window.removeEventListener('resize', this.handleResize)
        },
        data: function() {
            return {
                selectionLoading: false,
                // course and sections which user selected. Cache on local.
                selections: {
                    'MAT137Y1-Y-20199': ['LEC-0101'],
                    'CSC148H1-F-20199': ['LEC-0101', 'TUT-0201'],
                    'CSC165H1-F-20199': []
                },
                // the popup's state.
                modalState: {
                    sections: null,
                    boundingBox: null,
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
                courses: {}
            }
        },
        computed: {
            // get all the selected course info with selected section info.
            allSelectedCourses: function() {
                let result = {}
                for (let i = 0; i < Object.keys(this.selections).length; i++) {
                    let key = Object.keys(this.selections)[i]
                    let values = this.selections[key]
                    result[key] = {}
                    values.forEach(value => {
                        result[key][value] = {}
                        result[key][value] = this.getCourseSectionInfo(key, value)
                        result[key][value]['event'] = 'event-' + i
                    })
                }

                return result
            },

            // get all the meeting time, use for check if conflict with some meetings
            allMeetingTime: function() {
                let times = []
                Object.keys(this.allSelectedCourses).forEach(courseID => {
                    let sections = this.allSelectedCourses[courseID]
                    Object.values(sections).forEach(section => {
                        let meetings = Object.values(section.meetings.schedule)
                        times = times.concat(meetings)
                    })
                })
                return times
            }
        },
        methods: {
            handleResize() {
                this.window.width = window.innerWidth;
                this.window.height = window.innerHeight
            },
            // get the course by course id from server
            getCourseInfo: function(courseId) {
                let resultCourse = null;
                if (this.courses[courseId]) {
                    resultCourse = JSON.parse(JSON.stringify(this.courses[courseId]));
                    resultCourse.keyCode = courseId
                    return resultCourse
                }
            },
            // remove all
            getCourseSectionInfo: function(courseId, sectionId) {
                let course = JSON.parse(JSON.stringify(this.getCourseInfo(courseId)));
                course['meetings'] = course['meetings'][sectionId];
                course.selectedSectionId = sectionId;
                return course
            },
            openModal: function(courseId) {
                this.modalState.currentModalEvent = this.getCourseInfo(courseId);
                this.modalState.modalIsOpening = true
            },
            closeModal: function() {
                this.modalState.selectedMeeting = undefined;
                this.modalState.modalIsClosing = true
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
    }

    .cd-schedule__event [data-event="event-0"],
    .sidebar-header[data-event="event-0"],
    .cd-schedule-modal[data-event="event-0"] .cd-schedule-modal__header-bg,
    .cd-schedule-modal[data-event="event-0"] .cd-schedule-modal__content {
        // this is used to set a background color for the event and the modal window
        background: $color-event-0;
    }

    .cd-schedule__event [data-event="event-1"],
    .sidebar-header[data-event="event-1"],
    .cd-schedule-modal[data-event="event-1"] .cd-schedule-modal__header-bg {
        // this is used to set a background color for the event and the modal window
        background: $color-event-1;
    }

    .cd-schedule__event [data-event="event-2"],
    .sidebar-header[data-event="event-2"],
    .cd-schedule-modal[data-event="event-2"] .cd-schedule-modal__header-bg {
        background: $color-event-2;
    }

    .cd-schedule__event [data-event="event-3"],
    .sidebar-header[data-event="event-3"],
    .cd-schedule-modal[data-event="event-3"] .cd-schedule-modal__header-bg {
        background: $color-event-3
    }

    .cd-schedule__event [data-event="event-4"],
    .sidebar-header[data-event="event-4"],
    .cd-schedule-modal[data-event="event-4"] .cd-schedule-modal__header-bg {
        background: $color-event-4
    }

    .cd-schedule__cover-layer {
        // layer between the content and the modal window
        position: fixed;
        z-index: 2;
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
</style>
