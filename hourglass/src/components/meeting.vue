<template>
    <li :class="meetingClassList" :style="getStyle" @click="meetingClick" >
        <a :data-start="this.startTime" :data-end="this.endTime" :data-event="this.dataevent" href="#0" ref="meeting">
            <strong class="cd-schedule__name" ref="code">{{this.courseCode}}</strong><br>
            <span style="font-size: small" ref="section">{{this.meeting.selectedSectionId}}</span><br>
            <em class="cd-schedule__name" v-if="isOverflow()" ref="title">{{this.courseTitle}}</em>
        </a>
    </li>
</template>

<script>
    import EventBus from '@/js/EventBus'
    export default {
        name: "meeting",
        props: ['meeting'],
        data: function(){
            return {
                selected: false,
                style: {},
                meetingClassList: ['cd-schedule__event'],
                hideTitle: false
            }
        },
        mounted: function () {
            this.setupStyle();
            this.siblingMeetings.forEach(sibling => sibling.setupStyle())

        },
        destroyed: function(){
            this.siblingMeetings.forEach(sibling => sibling.setupStyle())
        },
        computed: {
            courseCode: function () {
                return this.meeting['code'].slice(0, 6)
            },
            courseTitle: function () {
                return this.meeting['courseTitle']
            },
            startTime: function () {
                return this.meeting['meetingStartTime']
            },
            endTime: function () {
                return this.meeting['meetingEndTime']
            },
            getStyle: function () {
                if (this.style) {
                    return this.style
                }
            },
            dataevent: function () {
                return this.meeting.event
            },
            siblingMeetings: function () {
                var thisMeeting = this;
                return this.$parent.$children.filter(e => e!== thisMeeting)
            },
            

        },
        methods: {
            setupStyle: function(){
                let duration = this.getScheduleTimestamp(this.endTime) - this.getScheduleTimestamp(this.startTime);
                let timelineStart = this.getScheduleTimestamp('9:00');
                let start = this.getScheduleTimestamp(this.startTime);
                let timelineUnitDuration = this.getScheduleTimestamp('10:00') - timelineStart;
                if (!this.$parent.$refs.header){
                    return
                }
                let slotHeight = this.$parent.$refs.header.offsetHeight;
                let eventTop = slotHeight*(start - timelineStart)/timelineUnitDuration - 1 + 'px';
                let eventHeight = slotHeight*duration/timelineUnitDuration + 2 + 'px';
                let processorTotal = 0;
                let processor = 0;
                this.$parent.setSectionToday();
                for (let i=0;i<this.$parent.sectionToday.length;i++){
                    if (this.$parent.sectionToday[i].meetingScheduleId === this.meeting.meetingScheduleId){
                        processorTotal = this.$parent.sectionToday[i]['processorTotal'];
                        processor = this.$parent.sectionToday[i]['processor']
                    }
                }
                let eventWidth = 100/processorTotal;
                let eventLeft = eventWidth * (processor - 1) + '%';
                this.style = {'top': eventTop, 'height': eventHeight, 'width': eventWidth + "%", 'left': eventLeft};
            },
            getScheduleTimestamp: function (time) {
                //accepts hh:mm format - convert hh:mm to timestamp
                time = time.replace(/ /g,'');
                let timeArray = time.split(':');
                return parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]);;
            },
            meetingClick: function () {
                EventBus.$emit('meetingClick', this.meeting.keyCode);
            },
            isOverflow: function () {
                let start = this.getScheduleTimestamp(this.meeting.meetingStartTime)
                let end = this.getScheduleTimestamp(this.meeting.meetingEndTime);
                let processorTotal = this.meeting.processorTotal
                return (end - start) > 60 && processorTotal === 1
            }
        },
    }
</script>

<style scoped lang="scss">
    li {
        position: absolute;
        flex-shrink: 0;
        float: left;
        z-index: 1;

        a {
            position: relative;
            box-sizing: border-box;
            padding: 3px;
            text-align: center;
            display: block;
            height: 100%;
            box-shadow: inset 0 -3px 0 rgba(#000, .2);
            text-decoration: none;
            border-right: solid white 1px;
            color: white;
            overflow: scroll;
            overflow-x: hidden;
            overflow-y: hidden;
        }
    }

</style>