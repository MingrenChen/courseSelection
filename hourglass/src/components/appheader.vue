<template>
    <div id="searchArea">
        <navigator :meeting-times="allMeetingTime"></navigator>
        <div class="cd-sidenav__semester">
            <div class="cd-sidenav__semester-toggle">
                <i class="fab fa-canadian-maple-leaf" :class="semesterClass('fall')"></i>
                <div id="fall" :class="semesterClass('fall')">Fall</div>
                <toggle-button
                        v-bind="this.toggleConfig"
                        @change="this.$parent.switchSemester"
                ></toggle-button>
                <div id="winter" :class="semesterClass('winter')">Winter</div>
                <i class="fas fa-snowflake" :class="semesterClass('winter')"></i>
            </div>
        </div>

        <Autocomplete :search="search"
                      :get-result-value="getResultValue"
                      @submit="this.selectCourse"
        ></Autocomplete>
    </div>
</template>

<script>
    import { ToggleButton } from 'vue-js-toggle-button'
    // autocomplete for search bar
    import Autocomplete from '@trevoreyre/autocomplete-vue'
    import '@trevoreyre/autocomplete-vue/dist/style.css'
    import Vue from 'vue'
    import EventBus from "../assets/js/EventBus";
    Vue.use(Autocomplete);
    import axios from 'axios'
    import navigator from "./navigator";

    export default {
        name: "appheader",
        components: {
            ToggleButton,
            Autocomplete,
            navigator
        },
        props: [
            "allMissingSections",
            'allMeetingTime'
        ],
        mounted() {
        },
        computed: {
            toggleConfig: function () {
                let config = {color: {checked: 'deepskyblue', unchecked: 'rgb(242, 122, 41)'}}
                if (this.$isMobile) {
                    config.height = 12
                    config.width = 25
                }
                return config
            }
        },
        methods: {
            semesterClass: function (semester) {
                return {
                    'semester-not-selected': this.$parent.semester !== semester,
                    'fa-2x': !this.$isMobile
                }
            },
            // the following 2 methods are for search and autocomplete
            search: function (input) {
                return axios.get('http://localhost:2000/getautocomplete/' + input).then(response => {
                    return response.data
                })
            },
            getResultValue(result) {
                console.log(result)
                let course = Object.values(result)[0];
                if (!this.$isMobile){
                    return course.code.slice(0, 6) + course.section + " " + course.courseTitle
                } else {
                    let section = "Full Year";
                    if (course.section === 'F'){
                        section = 'Fall'
                    } else if (course.section === 'S'){
                        section = 'Winter'
                    }
                    return course.code.slice(0, 6) + ' ' + section
                }
            },
            selectCourse: function (course) {
                EventBus.$emit('selectCourse', course)
            }
        }
    }
</script>

<style lang="scss">
    @import "../assets/css/variable.scss";

    #searchArea {
        @media screen and (min-width: 500px){
            height: $schedule-search-height;
        }
        @media screen and (max-width: 500px) {
            height: $schedule-search-height-mobile;
        }

        .autocomplete {
            @media screen and (min-width: 500px){
                width: 25%;
                position: absolute;
                left: 70%;
                z-index: 3;
            }
            @media screen and (max-width: 500px) {
                position: absolute;
                width: 55%;
                top: 5px;
                left: 45%;
                z-index: 3;
                height: $schedule-search-height-mobile;
                .autocomplete-input {
                    height: 100%;
                }
                .autocomplete-result {
                    font-size: x-small;
                }
            }

        }

        .cd-sidenav__semester{

            @media screen and (min-width: 500px){
                position: absolute;
                width: max-content;
                left: calc(#{$sidenav-width} + 40px);
                top: 20px;
            }
            @media screen and (max-width: 500px){
                position: absolute;
                width: max-content;
                left: 13%;
                top: 20px;
            }


            .cd-sidenav__semester-toggle {
                width: max-content;
                text-align: center;
                margin: 0 auto;
                display: flex;
                label {
                    margin-top: 3px;
                }
            }

            .semester-not-selected {
                opacity: 0.6;
                background: #cccccc !important;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
            }

            #winter{
                // bigger screen
                @media screen and (min-width: 500px){
                    font-size: larger;
                    margin-left: 5px;
                }
                //mobile device
                @media screen and (max-width: 500px){
                    font-size: small;
                    margin-left: 2px;
                }
                background: linear-gradient(deepskyblue, #8eedfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .fa-snowflake {
                background: linear-gradient(deepskyblue, #8eedfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: initial; /* reset Font Awesome's display:inline-block */
                margin-left: 5px;
                //mobile device
                @media screen and (max-width: 500px){
                    // hide on mobile
                    display: none;
                }
            }


            .fa-canadian-maple-leaf {
                background: linear-gradient(rgb(255, 0, 0), rgb(255, 163, 59));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: initial; /* reset Font Awesome's display:inline-block */
                margin-right: 5px;
                //mobile device
                @media screen and (max-width: 500px){
                    // hide on mobile
                    display: none;
                }
            }

            #fall{
                // bigger screen
                @media screen and (min-width: 500px){
                    font-size: larger;
                    margin-right: 5px;

                }
                //mobile device
                @media screen and (max-width: 500px){
                    font-size: small;
                    margin-right: 2px;
                }
                background: linear-gradient(rgb(255, 0, 0), rgb(255, 163, 59));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }
    }
</style>