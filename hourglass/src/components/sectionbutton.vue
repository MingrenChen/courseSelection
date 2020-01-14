<template>
    <button :class='{
                    button_conflict: this.hasConflict,
                    button_selected: this.hasSelected,
                    sectionButton: true}'
            v-on:click='this.buttonClick'>{{Object.keys(section)[0]}}</button>

</template>

<script>
    import NodeFactory from "../js/processor";
    import EventBus from '@/js/EventBus'

    export default {
        name: "sectionbutton",
        props: ['section', 'course', 'selections'],
        data: function(){
            return {
                selected: false,
            }
        },
        computed: {
            hasSelected: function (){
                return this.selections.includes(Object.keys(this.section)[0])
            },
            hasConflict: function (){
                let has_conflict = false;
                let times = this.$parent.$parent.$parent.allMeetingTime;
                let buttonTime = Object.values(Object.values(this.section)[0].schedule);
                buttonTime.forEach(currenttime => {
                    let start = currenttime.meetingStartTime;
                    let end = currenttime.meetingEndTime;
                    times.forEach(time => {
                        if (currenttime.meetingScheduleId !== time.meetingScheduleId &&
                            currenttime.meetingDay === time.meetingDay){
                            if (start < time.meetingStartTime && end > time.meetingStartTime){
                                has_conflict = true
                            } else if (time.meetingStartTime < start && time.meetingEndTime > start){
                                has_conflict = true
                            } else if (time.meetingStartTime === start && time.meetingEndTime === end){
                                has_conflict = true
                            }
                        }
                    })
                });
                return has_conflict
            },
        },
        methods: {
            buttonClick: function () {
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

        },
    }
</script>

<style scoped lang="scss">
    .sectionButton {
        margin: 5px;
        font-size: small;
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