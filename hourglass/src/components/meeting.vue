<template>
    <li :class="meetingClassList" :style="getStyle" @click="meetingClick" >
        <a v-if="showCurrentMeeting" :data-start="this.startTime" :data-end="this.endTime" :data-event="this.dataevent" href="#0" ref="meeting">
            <strong class="cd-schedule__name">{{this.courseCode}}</strong><br>
            <span>{{this.meeting.selectedSectionId}}</span><br>
            <em class="cd-schedule__name" v-if="isOverflow() && !this.$isMobile">{{this.courseTitle}}</em>
        </a>
    </li>
</template>

<script>
    import gsap from 'gsap'
    import EventBus from '../assets/js/EventBus.js'
    import html2canvas from 'html2canvas'

    export default {
        name: "meeting",
        props: ['meeting'],
        data: function(){
            return {
                selected: false,
                style: {},
                meetingClassList: ['cd-schedule__event'],
                hideTitle: false,
                showCurrentMeeting: true
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
            // slot is a little bigger than height in css because the border
            slotHeight: function () {
                if (this.$isMobile){
                    return 56
                }
                return 65
            }

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
                // console.log(this.slotHeight,start,timelineStart)
                let eventTop = this.slotHeight*(start - timelineStart)/timelineUnitDuration - 1 + 'px';
                let eventHeight = this.slotHeight*duration/timelineUnitDuration + 'px';
                let processorTotal = 0;
                let processor = 0;
                this.$parent.setSectionToday();
                for (let i=0;i<this.$parent.sectionToday.length;i++){
                    if (this.$parent.sectionToday[i].meetingScheduleId === this.meeting.meetingScheduleId){
                        processorTotal = this.$parent.sectionToday[i]['processorTotal'];
                        processor = this.$parent.sectionToday[i]['processor']
                    }
                }
                let eventWidth = 100/processorTotal + 1;
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
                this.snap()
                // EventBus.$emit('meetingClick', this.meeting.keyCode);
                this.showCurrentMeeting = false;
            },
            isOverflow: function () {
                let start = this.getScheduleTimestamp(this.meeting.meetingStartTime)
                let end = this.getScheduleTimestamp(this.meeting.meetingEndTime);
                let processorTotal = this.meeting.processorTotal
                return (end - start) > 60 && processorTotal === 1
            },
            snap: function () {
                html2canvas(this.$el).then(response => {
                    response.style.top = this.getStyle.top
                    console.log(this.getStyle)
                    let {width, height} = response;
                    const ctx = response.getContext("2d");
                    const originalData = ctx.getImageData(0, 0, width, height);
                    
                    this.$el.appendChild(response)
                    // response.style.height =
                    // for (let x = 0; x < width; ++x) {
                    //     for (let y = 0; y < height; ++y) {
                    //         // show block pixel or original pixel
                    //         // 这里的 i 决定像素密度（相当于把每一个像素分布到几个 canvas 上）
                    //         for (let i = 0; i < 4; i++) {
                    //             // console.log('(' + imageDatas.data[y * width + x], imageDatas.data[y * width + x + 1],imageDatas.data[y * width + x+2],imageDatas.data[y * width + x + 3], ')')
                    //         }
                    //     }
                    // }
                })
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
        //bigger device
        @media screen and (min-width: 400px){

            span {
                font-size: small;
            }
        }
        //mobile device
        @media screen and (max-width: 400px){

            strong {
                font-size: smaller;
            }
            span {
                font-size: x-small;
            }
        }
    }

</style>