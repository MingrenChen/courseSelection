<template>
  <div class="cd-schedule margin-top-lg margin-bottom-lg js-cd-schedule" :class="timetableClass">
    <div class="cd-schedule__timeline">
      <ul class="timetable">
        <timeslot v-for="time in times" :time="time"></timeslot>
      </ul>
    </div>
    <div class="cd-schedule__events">
      <ul >
        <day v-for="(day, i) in dayHeaders" :day="day" :semester="semester" :dayshort='daysshort[i]'></day>
      </ul>
    </div>

  </div>
</template>

<script>
import timeslot from './timeslot';
import day from "./day";

export default {
  name: 'timetable',
  props: ['selections', 'courses', 'semester'],
  components: {
    timeslot,
    day,
  },
  data: function () {
    return {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      daysshort: ['MO', 'TU', 'WE', 'TH', 'FR'],
      timetable: []
    }
  },
  computed: {
    dayHeaders: function(){
      if (this.$isMobile){
        return this.daysshort
      }
      return this.days
    },
    // times is to build the timetable with proper time
    times: function () {
      let timeList = []
      for (let h = 9; h < 22; h++) {
        if (h === 9) {
          h = '09'
        }
        timeList.push(h + ':' + '00')
      }
      return timeList
    },

    sectionByDay: function () {
      let fall = { 'MO': [], 'TU': [], 'WE': [], 'TH': [], 'FR': [] }
      let winter = { 'MO': [], 'TU': [], 'WE': [], 'TH': [], 'FR': [] }
      let result = { 'fall': fall, 'winter': winter }
      for (let i = 0; i < Object.keys(this.selections).length; i++) {
        let courseId = Object.keys(this.selections)[i]
        let sections = this.selections[courseId]
        let course = this.courses[courseId]
        sections.forEach(section => {
          let meetings = this.courses[courseId]['meetings'][section]['schedule']
          Object.keys(meetings).forEach(meetingId => {
            let meeting = meetings[meetingId]
            if (meeting.meetingDay){
              meeting.keyCode = courseId
              meeting.section = course.section
              meeting.selectedSectionId = section
              meeting.event = course.event
              meeting.code = course.code
              meeting.courseTitle = course.courseTitle
              if (meeting.section === 'F'||meeting.section === 'Y'){
                result.fall[meeting.meetingDay].push(meeting)
              }
              if (meeting.section === 'S'||meeting.section === 'Y'){
                result.winter[meeting.meetingDay].push(meeting)
              }
            }
          })
        })
      }
      return result
    },
    timetableClass: function () {
      return {mobile: this.$isMobile}
    }
  }
}
</script>

<style scoped lang="scss">
  @import "../assets/css/variable.scss";
  :root {
    --font-primary: 'Source Sans Pro', sans-serif;
  }

  .cd-schedule:not(.mobile){
    width: calc(100% - #{$sidenav-width} - 15px);
    max-width: calc(100% - #{$sidenav-width} - 15px);
    position: relative;
    height: calc(#{$schedule-rows-number + 1} * #{$schedule-rows-height});
    left: calc(#{$sidenav-width} + 15px);
  }

  .cd-schedule.mobile{
    width: 100%;
    max-width: 100%;
    position: relative;
    height: calc(#{$schedule-rows-number + 1} * #{$schedule-rows-height-mobile});

  }

  .cd-schedule__timeline {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    // bigger screen
    @media screen and (min-width: 400px){
      padding-top: $schedule-rows-header-height;
    }
    //mobile device
    @media screen and (max-width: 400px){
      padding-top: $schedule-rows-header-height-mobile;
    }

    ul {
      padding-left: 0;
      margin-top: 0;
      height: 100%;
    }

    .timetable {
      display: block;
    }
  }


  .cd-schedule__events {
    position: relative;
    width: calc(100% - 60px);
    margin-left: 60px;
    height: 100%;

    ul {
      padding-left: 0;
      display: flex;
      flex-wrap: nowrap;
      height: 100%;
      border-right: 0.1px solid #e6e4e1;
      border-top: 0.1px solid #e6e4e1;

    }
  }
</style>
