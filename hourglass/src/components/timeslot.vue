<template>
  <li><span>{{time}}</span></li>
</template>

<script>
export default {
  name: 'timeslot',
  props: ['time']

}
</script>

<style scoped lang="scss">
  @import "../assets/css/variable.scss";

  li {
    display: list-item;
    list-style-position:inside;
    border-top: 0.1px solid #e6e4e1;
    position: relative;
    height: $schedule-rows-height;
  }

  .cd-schedule__group {
    position: relative;
    display: flex;
    -webkit-overflow-scrolling: touch;
    overflow: visible;
    padding: 0;
    height: calc($schedule-rows-number * $schedule-rows-height);


  }

</style>
