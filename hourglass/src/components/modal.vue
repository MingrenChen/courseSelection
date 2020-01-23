<template>
    <div class="cd-schedule-modal" :style='this.getStyleWithPx' :data-event='getEvent'>
        <div class="cd-schedule-modal__header" >
            <span class="cd-schedule-modal-coursecode">{{this.course.code + this.course.section}}</span>
            <span class="cd-schedule-modal-coursetitle">{{this.course.courseTitle}}</span>
            <div class="cd-schedule-modal__coursetime" v-for="(times, sec) in sectionTimes">
                <span class="cd-schedule-modal__sectiontitle">{{sec}}: </span>
                <span v-for="time in times" class="cd-schedule-modal__sectiontime">{{time}}</span>
            </div>

        </div>
        <div class="cd-schedule-modal__content">
<!--            <i class="fas fa-times" @click="closeModal()"></i>-->
            <div>
                <span style="font-size: small; font-weight: bold" v-html="this.course.courseDescription">
                    {{this.course.courseDescription}}
                </span>
                <br>
                <span style="font-size: smaller">Instructor(s): {{this.instructors}}</span>
                <div class="relation-courses" v-if="getRelationCourses('exclusion')">Exclusion: {{getRelationCourses('exclusion')}}</div>
                <div class="relation-courses" v-if="getRelationCourses('corequisite')">Exclusion: {{getRelationCourses('corequisite')}}</div>
                <div class="relation-courses" v-if="getRelationCourses('prerequisite')">Exclusion: {{getRelationCourses('prerequisite')}}</div>
                <div class='LEC' v-if='this.getSectionWithTeachingMethod("LEC").length > 0'>
                    <label><strong>Lecture:</strong></label>
                    <sectionbutton v-for='key in this.getSectionWithTeachingMethod("LEC")'
                                   :section=key :course="course['courseId']"
                                   :selections="selections"
                                   :all-meeting-time="allMeetingTime"
                                    :enable-hover="false"></sectionbutton>
                </div>
                <div class='TUT' v-if='this.getSectionWithTeachingMethod("TUT").length > 0'>
                    <label><strong>Tutorial: </strong></label>
                    <sectionbutton v-for='key in this.getSectionWithTeachingMethod("TUT")'
                                   :section=key :course="course['courseId']"
                                   :selections="selections"
                                   :all-meeting-time="allMeetingTime" :enable-hover="false"></sectionbutton>
                </div>
                <div class='PRA' v-if='this.getSectionWithTeachingMethod("PRA").length > 0'>
                    <label><strong>Practice: </strong></label>
                    <sectionbutton v-for='key in this.getSectionWithTeachingMethod("PRA")'
                                   :section=key :course="course['courseId']"
                                   :selections="selections"
                                   :all-meeting-time="allMeetingTime" :enable-hover="false"></sectionbutton>
                </div>
                <div v-if="this.$isMobile" class="remove-course" @click="removeCourse()">
                    <img src="https://img.icons8.com/ultraviolet/20/000000/delete.png">
                    Remove
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import gsap from "gsap";
    import sectionselection from "./sectionselection";
    import sectionbutton from "./sectionbutton";
    import EventBus from "../assets/js/EventBus.js";

    export default {
        name: "modal",
        props: ['modalState', 'allMeetingTime', 'selections'],
        components: {
            sectionselection,
            sectionbutton,
        },
        data: function(){
            return {
                hidden: true
            }
        },
        mounted: function(){
            // create animation for modal open.
            let header_origin = this.modalState.headerBoundingBox;
            let content_origin = this.modalState.contentBoundingBox;
            let header_dest = JSON.parse(JSON.stringify(this.getStyle));
            header_dest.width /= 5
            let content_dest = JSON.parse(JSON.stringify(this.getStyle));
            content_dest.left += header_dest.width
            let header_x = header_origin.left - header_dest.left;
            let header_y = header_origin.top - header_dest.top;
            let header_scaleX = header_origin.width/header_dest.width;
            let header_scaleY = header_origin.height/header_dest.height;
            let content_x = content_origin.left - content_dest.left;
            let content_y = content_origin.top - content_dest.top;
            let content_scaleX = content_origin.width/content_dest.width/0.8;
            let content_scaleY = content_origin.height/content_dest.height;

            let animation_header = gsap.from('.cd-schedule-modal__header',
                {x:header_x, y:header_y, scaleX:header_scaleX,scaleY:header_scaleY,
                    duration: 0.5, onStart: this.showModal})
            let animation_content = gsap.from('.cd-schedule-modal__content',
                {x:content_x, y:content_y, scaleX:content_scaleX,scaleY:content_scaleY,duration: 0.5})

        },
        computed: {
            course: function() {return this.modalState.course},
            getStyle: function(){
                let style = {};
                let window = this.$parent.window;
                let modalWidth = (window.width *.8 > 800 ) ? 800 : window.width *.8;
                let modalHeight = ( window.height *.8 > 480 ) ? 480 : window.height *.8;
                let modalLeft = (window.width - modalWidth)/2;
                let modalTop = (window.height - modalHeight)/2.5;
                style.width = modalWidth;
                style.height = modalHeight;
                style.left = modalLeft;
                style.top = modalTop;
                return style
            },
            getStyleWithPx: function(){
                let style = JSON.parse(JSON.stringify(this.getStyle));
                style.width = style.width + 'px';
                style.height = style.height + 'px';
                style.left = style.left + 'px';
                style.top = style.top + 'px';
                if (this.hidden) {
                    style.display = 'None';
                }
                return style
            },
            getEvent: function () {
                return this.course.event
            },
            instructors: function () {
                let instructors = new Set()
                this.selections.forEach(section => {
                    let teachers = this.course.meetings[section].instructors
                    if (teachers !== []){
                        Object.values(teachers).forEach(instructor => {
                            instructors.add(instructor.firstName + ' ' + instructor.lastName)
                        })
                    }
                });
                return Array.from(instructors).join(", ")
            },
            sectionTimes: function () {
                let result = {}
                this.selections.forEach(section => {
                    let meetings = Object.values(this.course.meetings[section].schedule)
                    let meetingsStr = meetings.map(meeting => {
                        if (meeting.meetingDay){
                            return meeting.meetingDay + " " + meeting.meetingStartTime + '-' + meeting.meetingEndTime
                        } else {
                            return 'Online Meeting'
                        }
                    })
                    this.$set(result, section, meetingsStr)
                });
                return result
            },
        },
        methods: {
            getSectionWithTeachingMethod: function (teachingMethod) {
                let lecs = [];
                for (let i=0;i < Object.keys(this.course.meetings).length;i++){
                    let sectionID = Object.keys(this.course.meetings)[i]
                    let value = Object.values(this.course.meetings)[i]
                    if (value.teachingMethod === teachingMethod){
                        let section = {}
                        section[sectionID] = JSON.parse(JSON.stringify(value))
                        lecs.push(section)
                    }
                }
                return lecs
            },
            showModal: function () {
                this.hidden = false
            },
            closeModal: function () {
                EventBus.$emit('closeModal')
            },
            getRelationCourses: function (relation) {
                return this.course[relation]
            },
            removeCourse: function () {
                EventBus.$emit('removeCourse', this.course.courseId)
                EventBus.$emit('closeModal')
            }
        },
    }
</script>

<style scoped lang="scss">
    i.fa-times {
        position: absolute;
        right: 10px;
        top: 10px
    }
    .cd-schedule-modal {
        position: absolute;
        z-index: 4;

    }
    .cd-schedule-modal__header {
        // bigger screen
        @media screen and (min-width: 500px){
            padding: 1em;
            width: 20%;
            .cd-schedule-modal-coursecode{
                font-weight: bold;
                font-size: large
            }
            .cd-schedule-modal-coursetitle{
                font-style: italic;
                margin-top: 10px
            }
            .cd-schedule-modal__coursetime {
                margin-top: 10px;
                .cd-schedule-modal__sectiontime {
                    font-size: smaller;
                    margin-left: 10px;
                }
                .cd-schedule-modal__sectiontitle {
                    font-size: small;
                }
            }
        }
        //mobile device
        @media screen and (max-width: 500px){
            padding: 0.5em;
            width: 30%;
            .cd-schedule-modal-coursecode{
                font-weight: bold;
                font-size: smaller
            }
            .cd-schedule-modal-coursetitle{
                font-style: italic;
                margin-top: 3px;
                font-size: x-small;
            }
            .cd-schedule-modal__coursetime {
                margin-top: 5px;
                font-size: x-small;
                .cd-schedule-modal__sectiontime {
                    font-size: smaller;
                    margin-left: 5px;
                }
                .cd-schedule-modal__sectiontitle {
                    font-size: small;
                }
            }
        }
        height: 100%;
        align-content: center;
        z-index: 4;
        transform-origin:left top;
        -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
        -moz-box-sizing: border-box;    /* Firefox, other Gecko */
        box-sizing: border-box;
        color: white;
        overflow: scroll;
        span {
            display: block;
        }


    }
    .cd-schedule-modal__content {
        // bigger screen
        @media screen and (min-width: 500px){
            width: 80%;
            left: 20%;
            padding: 1.5em 1.5em 1em 1em;
            overflow-y: scroll;
        }
        //mobile device
        @media screen and (max-width: 500px){
            width: 70%;
            left: 30%;
            padding: 0.5em 1em 0.5em 0.5em;
            overflow-y: scroll;
        }
        position: absolute;
        -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
        -moz-box-sizing: border-box;    /* Firefox, other Gecko */
        box-sizing: border-box;
        top: 0;
        background: white;
        height: 100%;
        float: right;
        transform-origin:left top;
        .relation-courses {
            font-size: smaller;
        }
    }

    .modal-body-enter-active, .modal-body-leave-active {
        transition: opacity 0.2s;
    }
    .modal-body-enter, .modal-body-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }
    .remove-course {
        img{
            vertical-align: middle;
            color: white;
        }
        width: max-content;
        padding: 1px 5px ;
        color: #76c2f5;
        margin-top: 10px;
        margin-left: 100px;
        cursor: pointer;
    }


</style>