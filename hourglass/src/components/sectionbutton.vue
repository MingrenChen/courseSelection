<template>
    <button :class='{
                    button_conflict: this.hasConflict,
                    button_selected: this.hasSelected,
                    sectionButton: true}'
            @click='this.buttonClick' @mouseover="hover=true" @mouseleave="hover=false">{{Object.keys(section)[0]}}</button>

</template>

<script>
    import NodeFactory from "../js/processor";
    import EventBus from '@/js/EventBus'

    export default {
        name: "sectionbutton",
        props: ['section', 'course', 'selections','allMeetingTime','enableHover'],
        data: function(){
            return {
                timeout: null,
                hover: false,
                hoverSelected: false,
                selected: false,
            }
        },
        watch: {
           hover: function (hover) {
                if (!this.enableHover){
                    return
                }
                if (hover){
                   this.timeout = setTimeout(function (){
                       this.selectCourse();
                       this.hoverSelected = true
                   }.bind(this), 500)
                } else {
                   clearTimeout(this.timeout);
                   if (this.hoverSelected) {
                       this.selectCourse()
                       this.hoverSelected = false
                   }

                }
           }
        },
        computed: {
            hasSelected: function (){
                return this.selections.includes(Object.keys(this.section)[0])
            },
            hasConflict: function (){
                let has_conflict = false;
                let times = this.allMeetingTime;
                let buttonTime = Object.values(Object.values(this.section)[0].schedule);
                buttonTime.forEach(currenttime => {
                    let start = currenttime.meetingStartTime;
                    let end = currenttime.meetingEndTime;
                    times.forEach(time => {
                        if (currenttime.meetingScheduleId !== time.meetingScheduleId &&
                            currenttime.meetingDay === time.meetingDay){
                            if (!(start >= time.meetingEndTime || end <= time.meetingStartTime)){
                                has_conflict = true
                            }
                        }
                    })
                });
                return has_conflict
            },
        },
        methods: {
            selectCourse: function () {
                if (this.hasSelected){
                    EventBus.$emit('unselectSection',
                        {
                            courseID: this.course,
                            sectionID: Object.keys(this.section)[0]
                        })
                } else {
                    EventBus.$emit('selectSection',
                        {
                            courseID: this.course,
                            sectionID: Object.keys(this.section)[0]
                        })
                }
            },
            buttonClick: function () {
                clearTimeout(this.timeout)
                if (this.hoverSelected) {
                    this.hoverSelected = false
                } else {
                    this.selectCourse()
                }
            }
        },
    }
</script>

<style scoped lang="scss">
    .sectionButton {
        margin: 3px;
        font-size: small;
        padding: 0 3px 0 3px;
        color: #33cc33;
        border: 1px solid #33cc33;
        width: max-content;
        height: 21px;
        word-wrap: break-word;
        background: white;
    }

    .sectionButton:hover {
        color: #009933;
        border: 1px solid #009933;
    }

    .sectionButton.button_selected {
        background: #33cc33;
        color: whitesmoke;
    }

    .sectionButton.button_conflict {
        border-color: red;
        color: red;
    }

    .sectionButton.button_conflict:hover {
        border-color: rgb(204, 0, 0);
        color: rgb(204, 0, 0);
    }

    .sectionButton.button_selected.button_conflict {
        border-color: red;
        color: whitesmoke;
        background: red;
    }
</style>