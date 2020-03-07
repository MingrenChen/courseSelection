<template>
    <li :class='showDetail' :id="'sidebar-course-' + course.courseId">
        <div class="sidebar-header" :data-event="course.event" ref="sidebar-header" :style="this.headerStyle" @click="changeColor"></div>
        <div class="sidebar-content" ref="sidebar-content">
            <div class="sidebar-course-title" @click="sidebarCourseClick()">
                <div style="overflow-x: hidden;white-space:nowrap;width: 100%" :title="courseHeader">{{courseHeader}}</div>
            </div>
            <i class="fas fa-times remove-course" @click="removeCourse()"></i>

            <transition name="scroll" @enter="extendCourse()" @leave="closeCourse()">
                <div class="sidebar-course-body" v-if="this.showCourse">
                    <span style="font-size: small; font-weight: bold">{{this.course.courseTitle}}</span><br>
                    <span style="font-size: smaller">Instructor: {{this.instructors}}</span>
                    <div class='LEC' v-if='this.getSectionWithTeachingMethod("LEC").length > 0'>
                        <label><strong>Lecture:</strong></label>
                        <sectionbutton v-for='key in this.getSectionWithTeachingMethod("LEC")' :section=key :course="course['courseId']" :selections="selections" :all-meeting-time="allMeetingTime" :enable-hover="true"></sectionbutton>
                    </div>
                    <div class='TUT' v-if='this.getSectionWithTeachingMethod("TUT").length > 0'>
                        <label><strong>Tutorial: </strong></label>
                        <sectionbutton v-for='key in this.getSectionWithTeachingMethod("TUT")' :section=key :course="course['courseId']" :selections="selections" :all-meeting-time="allMeetingTime" :enable-hover="true"></sectionbutton>
                    </div>
                    <div class='PRA' v-if='this.getSectionWithTeachingMethod("PRA").length > 0'>
                        <label><strong>Practice: </strong></label>
                        <sectionbutton v-for='key in this.getSectionWithTeachingMethod("PRA")' :section=key :course="course['courseId']" :selections="selections" :all-meeting-time="allMeetingTime" :enable-hover="true"></sectionbutton>
                    </div>
                    <div class="sidebar-course-detail" @click="openModal()"><img src="https://img.icons8.com/offices/20/000000/details-pane.png">detail</div>
                </div>
            </transition>
        </div>
    </li>
</template>

<script>

    import EventBus from "../assets/js/EventBus.js";
    import sectionbutton from "./sectionbutton";
    import gsap from 'gsap'


    export default {
        name: "sidebar-course",
        components: {
            sectionbutton,

        },
        props: ['selections','course', 'showCourse'],
        data: function () {
            return {
                headerStyle: {height: '100%', background: this.course.color},
                classList: {"sidebar-course": true, "sidebar-show-course": this.showCourse}
            }
        },
        mounted: function(){
            this.headerStyle.height = this.$refs['sidebar-header'].offsetHeight + 'px';
        },
        updated: function(){
            this.headerStyle.background = this.course.color;
        },
        computed: {
            courseHeader: function(){
                if (!this.showCourse){
                    return this.course.code.slice(0, 6) + this.course.section + " " + this.course.courseTitle
                } else {
                    if (this.course.section === 'F'){
                        return this.course.code + " Fall"
                    } else if (this.course.section === 'S'){
                        return this.course.code + " Winter"
                    } else {
                        return this.course.code + ' All Year'
                    }
                }
            },
            allMeetingTime: function(){
                return this.$parent.$parent.allMeetingTime
            },
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
                console.log(this.finalHeight, this.currentHeight)
                gsap.to('.sidebar-show-course .sidebar-header', {scaleY: this.finalHeight/this.currentHeight, duration: 0.2, transformOrigin:"top"})
            },
            closeCourse: function(){
                gsap.to('#sidebar-course-' + this.course.courseId + ' .sidebar-header', {scaleY: 1, duration: 0.2, transformOrigin:"top", onComplete:this.removeCloseClass})
            },
            getSectionWithTeachingMethod: function (teachingMethod) {
                let lecs = [];
                for (let i=0;i < Object.keys(this.course.meetings).length;i++){
                    let sectionId = Object.keys(this.course.meetings)[i]
                    let value = Object.values(this.course.meetings)[i]
                    if (value.teachingMethod === teachingMethod){
                        let section = {}
                        section[sectionId] = JSON.parse(JSON.stringify(value))
                        lecs.push(section)
                    }
                }
                return lecs
            },
            sidebarCourseClick: function () {
                EventBus.$emit('meetingClick', this.course.courseId)
            },
            openModal: function () {
                EventBus.$emit('openModal', this.$refs['sidebar-header'].getBoundingClientRect(), this.$refs['sidebar-content'].getBoundingClientRect(), this.course.courseId)
            },
            removeCourse: function () {
                gsap.to('#sidebar-course-' + this.course.courseId, {x: -this.$el.clientWidth, duration: 0.2, transformOrigin:"right",
                    onComplete: function () {
                        EventBus.$emit('removeCourse', this.course.courseId)
                    }.bind(this)
                })
            },
            changeColor: function () {
                EventBus.$emit('changeColor', this.course.courseId)
            }
        }
    }
</script>

<style scoped lang="scss">
    @import "../assets/css/variable.scss";
    .sidebar-course-detail {
        background: white;
        color: #76c2f5;
        width: max-content;
        margin-left: 70%;
        padding: 1px 5px ;
        margin-top: 10px;
        cursor: pointer;
        img {
            vertical-align: -5px;
            margin-right: 5px;
        }
    }
    .sidebar-show-course{
        height: auto;
        box-shadow: 5px 0px 5px rgba(1, 0, 0, 0.2);

    }
    .remove-course {
        position: absolute;
        right: 2px;
        float: right;
        z-index: 1;
    }
    .sidebar-course-title {
        padding: 10px;
        height: 100%;
        width: 95%;
        left: 0;
        top: 0;
        box-sizing: border-box;
        float: left;
        cursor: pointer;
    }

    .sidebar-course-title:hover {
        background: #e9e9e9;
    }

    li {
        height: $sidebar-hide-height;
        margin-top: 0.5px;
        /*position: absolute;*/

        .sidebar-content {
            margin-left: $sidebar-header-width;
            height: 100%;
            box-sizing: border-box;

            .sidebar-course-body {
                padding: 10px;
                box-sizing: border-box;

            }
        }
        .sidebar-header {
            display: block;
            float: left;
            left: 0;
            /*height: 100%;*/
            cursor: pointer;
            width: $sidebar-header-width;
        }
    }

    .scroll-enter-active {
        transition: all .2s ease;
    }
    .scroll-leave-active {
        transition: all 0s ease;
    }
    .scroll-enter, .scroll-leave-to
        /* .slide-fade-leave-active below version 2.1.8 */ {
        transform-origin: top center;
        opacity: 0;
    }


</style>