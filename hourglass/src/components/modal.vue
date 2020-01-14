<template>
    <div class="cd-schedule-modal" :style='this.getStyleWithPx' :data-event='getEvent'>
        <div class="cd-schedule-modal__header" >
            <span style="font-weight: bold; font-size: large">{{this.course.code + this.course.section}}</span>
            <span style="font-style: italic; margin-top: 10px">{{this.course.courseTitle}}</span>
        </div>
        <div class="cd-schedule-modal__content">
            <i class="fas fa-times" @click="closeModal()"></i>
            <div>
                <span style="font-size: small; font-weight: bold">{{this.course.courseDescription}}</span><br>
                <span style="font-size: smaller">Instructor: {{this.instructors}}</span>
                <div class='LEC' v-if='this.getSectionWithTeachingMethod("LEC").length > 0'>
                    <label><strong>Lecture:</strong></label>
                    <sectionbutton v-for='key in this.getSectionWithTeachingMethod("LEC")'
                                   :section=key :course="course['keyCode']"
                                   :selections="selections"
                                   :all-meeting-time="allMeetingTime"
                                    :enable-hover="false"></sectionbutton>
                </div>
                <div class='TUT' v-if='this.getSectionWithTeachingMethod("TUT").length > 0'>
                    <label><strong>Tutorial: </strong></label>
                    <sectionbutton v-for='key in this.getSectionWithTeachingMethod("TUT")'
                                   :section=key :course="course['keyCode']"
                                   :selections="selections"
                                   :all-meeting-time="allMeetingTime" :enable-hover="false"></sectionbutton>
                </div>
                <div class='PRA' v-if='this.getSectionWithTeachingMethod("PRA").length > 0'>
                    <label><strong>Practice: </strong></label>
                    <sectionbutton v-for='key in this.getSectionWithTeachingMethod("PRA")'
                                   :section=key :course="course['keyCode']"
                                   :selections="selections"
                                   :all-meeting-time="allMeetingTime" :enable-hover="false"></sectionbutton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import gsap from "gsap";
    import sectionselection from "./sectionselection";
    import sectionbutton from "./sectionbutton";
    import EventBus from "../js/EventBus";

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
            }
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
        z-index: 2;

    }
    .cd-schedule-modal__header {
        width: 20%;
        height: 100%;
        align-content: center;
        z-index: 3;
        transform-origin:left top;
        padding: 1em;
        -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
        -moz-box-sizing: border-box;    /* Firefox, other Gecko */
        box-sizing: border-box;
        color: white;

        span {
            display: block;
        }

    }
    .cd-schedule-modal__content {
        position: absolute;
        z-index: 3;
        padding: 1.5em 1.5em 1em 1em;
        -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
        -moz-box-sizing: border-box;    /* Firefox, other Gecko */
        box-sizing: border-box;
        top: 0;
        left: 20%;
        background: white;
        width: 80%;
        height: 100%;
        float: right;
        transform-origin:left top;

    }
    .cd-schedule-modal__header-bg {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    .cd-schedule-modal__body {
        background: white;
        width: inherit;
        /*padding: var(--space-sm);*/
        z-index: 3;
        opacity: 1;
    }

    .modal-body-enter-active, .modal-body-leave-active {
        transition: opacity 0.2s;
    }
    .modal-body-enter, .modal-body-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }

</style>