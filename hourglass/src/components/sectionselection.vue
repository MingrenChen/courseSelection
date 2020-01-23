<template>
    <div class="cd-schedule-modal__event-info">
        <div>
            <div>{{this.getter('courseDescription')}}</div>
            <div style="margin-top:10px">
                <div v-if="this.allTeachers !== ''">
                    <strong>Instructor:</strong>
                    <span>{{this.allTeachers}}</span>
                    </div>
                <div v-if="this.getter('prerequisite')"><strong>Prerequisites:</strong>{{this.getter('prerequisite')}}</div>
                <div v-if="this.getter('corequisite')"><strong>Corequisite: </strong>{{this.getter('corequisite')}}</div>
                <div v-if="this.getter('exclusion')"><strong>Exclusions: </strong>{{this.getter('exclusion')}}</div>
                <div class='LEC' v-if='this.getSectionWithTeachingMethod("LEC").length > 0'>
                    <label><strong>Lecture:</strong></label>
                   <section-button v-for='key in this.getSectionWithTeachingMethod("LEC")' :sectionid=key :course="getter('courseId')" :btnreload="btnreload"></section-button>
                </div>
                <div class='TUT' v-if='this.getSectionWithTeachingMethod("TUT").length > 0'>
                    <label><strong>Tutorial: </strong></label>
                    <section-button v-for='key in this.getSectionWithTeachingMethod("TUT")' :sectionid=key :course="getter('courseId')" :btnreload="btnreload"></section-button>
                    </div>
                <div class='PRA' v-if='this.getSectionWithTeachingMethod("PRA").length > 0'>
                    <label><strong>Practice: </strong></label>
                    <section-button v-for='key in this.getSectionWithTeachingMethod("PRA")' :sectionid=key :course="getter('courseId')" :btnreload="btnreload"></section-button>
                    </div>
                </div>
            </div>
        </div>
</template>

<script>
    export default {
        name: "sectionselection",
        props: ['courses', 'selections'],
        components: {
            'section-button': require('./sectionbutton').default
        },
        data: function(){
            return {
                btnreload: false
            }
        },
        watch: {
            btnreload: function (val, oldVal) {
                if (oldVal === false){
                    this.btnreload = false;
                }
            }
        },
        computed: {
            allTeachers: function () {
                let result = '';
                if (Object.keys(this.courses).includes('meetings')){
                    Object.keys(this.courses.meetings).forEach(keys => {
                        let meeting = this.courses.meetings[keys];
                        meeting.instructors.forEach(instructor => {
                            result += (instructor + '(' + keys +'), ')
                        })
                    });
                    return result.slice(0,result.length-2)
                }
            },
            courseid: function () {
                if (this.courses) {
                    return this.courses.courseId
                }
            }
        },
        methods: {
            getter: function (att) {
                if (this.courses) {
                    return this.courses[att]
                }
            },
            getSectionWithTeachingMethod: function (teachingMethod) {
                let lecs = [];
                if (this.courses) {
                    Object.keys(this.courses.meetings).forEach(key => {
                        if (this.courses.meetings[key].teachingMethod === teachingMethod) {
                            lecs.push(key)
                        }
                    })
                }
                return lecs
            },
        },
    }
</script>

<style scoped lang="scss">
    .cd-schedule-modal__body {
        background: white;
        width: inherit;
        padding: 1em;
        z-index: 3;
        opacity: 1;

        .cd-schedule-modal__event-info{
            padding: 2.5em;
        }
    }
</style>