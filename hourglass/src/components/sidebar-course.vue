<template>
    <li :class='showDetail' :id="'sidebar-course-' + course.keyCode">
        <div class="sidebar-header" :data-event="course.event" ref="sidebar-header" :style="this.headerStyle"></div>
        <div class="sidebar-content" ref="sidebar-content">
            <div @click="sidebarCourseClick()"><span>{{course.code}}</span></div>
            <transition name="scroll" @enter="extendCourse()" @leave="closeCourse()">
                <div v-if="this.showCourse">
                    <span style="font-size: small; font-weight: bold">{{this.course.courseTitle}}</span><br>
                    <span style="font-size: smaller">Instructor: {{this.instructors}}</span>
                    <div class='LEC' v-if='this.getSectionWithTeachingMethod("LEC").length > 0'>
                        <label><strong>Lecture:</strong></label>
                        <sectionbutton v-for='key in this.getSectionWithTeachingMethod("LEC")' :section=key :course="course['keyCode']" :selections="selections"></sectionbutton>
                    </div>
                    <div class='TUT' v-if='this.getSectionWithTeachingMethod("TUT").length > 0'>
                        <label><strong>Tutorial: </strong></label>
                        <sectionbutton v-for='key in this.getSectionWithTeachingMethod("TUT")' :section=key :course="course['keyCode']" :selections="selections"></sectionbutton>
                    </div>
                    <div class='PRA' v-if='this.getSectionWithTeachingMethod("PRA").length > 0'>
                        <label><strong>Practice: </strong></label>
                        <sectionbutton v-for='key in this.getSectionWithTeachingMethod("PRA")' :section=key :course="course['keyCode']" :selections="selections"></sectionbutton>
                    </div>
                    <button @click="openModal()">detail</button>
                </div>
            </transition>
        </div>
    </li>
</template>

<script>

    import EventBus from "../js/EventBus";
    import sectionbutton from "./sectionbutton";
    import gsap from 'gsap'

    export default {
        name: "sidebar-course",
        components: {
            sectionbutton
        },
        props: ['selections','course', 'showCourse'],
        data: function () {
            return {
                headerStyle: {height: '100%'},
                classList: {"sidebar-course": true, "sidebar-show-course": this.showCourse}
            }
        },
        mounted: function(){
            this.headerStyle.height = this.$refs['sidebar-header'].offsetHeight + 'px'
        },
        computed: {
            showDetail: function (){
                this.classList['sidebar-show-course'] = this.showCourse;
                return this.classList
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
            extendCourse: function(){
                this.finalHeight = this.$refs['sidebar-content'].offsetHeight;
                this.currentHeight = this.$refs['sidebar-header'].offsetHeight;
                gsap.to('.sidebar-show-course .sidebar-header', {scaleY: this.finalHeight/this.currentHeight, duration: 0.2, transformOrigin:"top"})
            },
            closeCourse: function(){
                gsap.to('#sidebar-course-' + this.course.keyCode + ' .sidebar-header', {scaleY: 1, duration: 0.2, transformOrigin:"top", onComplete:this.removeCloseClass})
            },
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
            sidebarCourseClick: function () {
                EventBus.$emit('meetingClick', this.course.keyCode)
            },
            openModal: function () {
                EventBus.$emit('openModal', this.$refs['sidebar-header'].getBoundingClientRect(), this.course.keyCode)
            }
        }
    }
</script>

<style scoped lang="scss">
    @import "../assets/css/variable.scss";
    .sidebar-show-course{
        height: auto;
        box-shadow: 5px 0px 5px rgba(1, 0, 0, 0.2);

    }

    li {
        height: $sidebar-hide-height;
        margin-top: 0.5px;
        /*position: absolute;*/

        .sidebar-content {
            margin-left: $sidebar-header-width;
            padding: 10px;
            height: 100%;
        }
        .sidebar-header {
            display: block;
            float: left;
            left: 0;
            /*height: 100%;*/
            width: $sidebar-header-width;
        }
    }

    .scroll-enter-active {
        transition: all .3s ease;
    }
    .scroll-leave-active {
        transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .scroll-enter, .scroll-leave-to
        /* .slide-fade-leave-active below version 2.1.8 */ {
        transform: scaleY(0.2);
        transform-origin: top;
        opacity: 0;
    }
</style>