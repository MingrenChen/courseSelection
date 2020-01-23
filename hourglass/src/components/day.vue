<template>
    <li class="cd-schedule__group">
        <div class="cd-schedule__top-info" ref=header><span>{{this.day}}</span></div>
         <ul>
             <meeting v-for="(meeting) in sectionToday" :meeting="meeting" :key="meeting.meetingScheduleId"></meeting>
         </ul>
    </li>
</template>

<script>
    import NodeFactory from '../assets/js/processor.js'
    import meeting from "./meeting";

    export default {
        name: "day",
        components:{
          meeting
        },
        props: ['semester', 'day', 'dayshort'],
        computed: {
            sectionToday: function(){
                return this.$parent.sectionByDay[this.semester][this.dayshort]
            },
        },
        methods: {
            setSectionToday: function () {
                let meetings = [];
                let nodeFactory = new NodeFactory();
                nodeFactory.setProcessorForMeetings(this.sectionToday);
                for (let i=0;i<this.sectionToday.length;i++){
                    let meeting = this.sectionToday[i];
                    meetings.push(nodeFactory.create(meeting, this.dayshort))
                }
                let result = {};
                meetings.forEach(node => {
                    node.setConflictGroup(meetings);
                    delete node.conflictGroup;
                    result[node.id] = node
                });

                return result
            }
        },
    }
</script>

<style scoped lang="scss">
    @import "../assets/css/variable.scss";
    .cd-schedule__group {
        flex-basis: 0;
        flex-grow: 1;
        margin-bottom: 0;
        border-width: 0 0 0 1px;
        border-style: solid;
        border-color: #e6e4e1;
        .cd-schedule__top-info{
            text-align: center;
            // bigger screen
            @media screen and (min-width: 500px){
                height: $schedule-rows-header-height;
                span {
                    top: calc(#{$schedule-rows-header-height} / 2 - 10px);
                }
            }
            //mobile device
            @media screen and (max-width: 500px){
                height: $schedule-rows-header-height-mobile;
                span {
                    top: calc(#{$schedule-rows-header-height-mobile} / 2 - 10px);
                }
            }
            span {
                position: relative;
            }
        }
        ul {
            position: relative;

            height: calc(100% - #{$schedule-rows-header-height});
        }
    }

</style>