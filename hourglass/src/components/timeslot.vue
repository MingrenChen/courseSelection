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

  span{
    font-size: small;
  }

  li {
    display: list-item;
    list-style-position:inside;
    border-width: 1px 0 0 0;
    border-style: solid;
    border-color: #e6e4e1;
    position: relative;
    //bigger device
    @media screen and (min-width: 400px){
      height: $schedule-rows-height;
    }
    //mobile device
    @media screen and (max-width: 400px){
      height: $schedule-rows-height-mobile;
    }
  }

  .cd-schedule__group {
    position: relative;
    display: flex;
    -webkit-overflow-scrolling: touch;
    overflow: visible;
    padding: 0;
    // bigger screen
    @media screen and (min-width: 400px){
      height: calc(#{$schedule-rows-number} * #{$schedule-rows-height});
    }
    //mobile device
    @media screen and (max-width: 400px){
      height: calc(#{$schedule-rows-number} * #{$schedule-rows-height-mobile});
    }

  }

</style>
