<template>
    <div class="dropdown" @click="clickDropdown">
        <img src="https://img.icons8.com/officel/25/000000/menu.png" class="dropbtn">
            <div class="dropdown-content" v-if="isOpen">
                <a @click="saveScreenShot">
                    <img src="https://img.icons8.com/dotty/20/000000/save.png">
                    Save Calendar
                </a>
                <a @click="removeAllCourses">
                    <img src="https://img.icons8.com/dotty/20/000000/trash.png">
                    Empty courses</a>
                <a @click="reportBug">
                    <img src="https://img.icons8.com/dotty/20/000000/bug.png">
                    Report Bug
                </a>
                <a @click="generateTimetableClick">
                    <img src="https://img.icons8.com/dotty/20/000000/bug.png">
                    Generate Timetable
                </a>
            </div>
    </div>
</template>

<script>
    import $ from "jquery"
    import html2canvas from 'html2canvas'
    import EventBus from "../assets/js/EventBus";
    import author from '../assets/image/author.jpg'

    export default {
        name: "navigator",

        data: function() {
            return {
                isOpen: false
            }
        },
        mounted() {
            EventBus.$on("closeDropdown", function () {
                this.isOpen = false
            }.bind(this))
        },
        methods: {
            clickDropdown: function () {
                this.isOpen = !this.isOpen
                if (this.isOpen){
                    EventBus.$emit('openDropdownCover')
                }
            },
            saveScreenShot: function () {
                html2canvas($(".cd-schedule")[0]).then(response => {
                    let a = document.createElement('a');
                    // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                    a.href = response.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                    a.download = 'calendar.jpg';
                    a.click();
                })
            },
            removeAllCourses: function (){
                EventBus.$emit("emptyCourses")
            },

            reportBug: function () {
                this.$fire({
                    title: "<img src=\"https://img.icons8.com/nolan/30/bug.png\">Find A Bug?",
                    text: "Add author's WeChat!",
                    imageUrl: author,
                    imageWidth: 200,
                    imageHeight: 200,
                }).then(r => {
                    console.log(r.value);
                });
            },

            generateTimetableClick: function () {
                this.$fire({
                    title: 'Preferences',
                    input: 'select',
                    inputOptions: {
                        1: 'Early',
                        2: 'Balance',
                        3: 'Late',
                        4: 'Long Weekend'
                    },
                    inputValue: 2,
                    showCancelButton: true,
                }).then(value => {
                    this.generateTimetable()
                })

            },
            generateTimetable: function (value) {
                console.log(this.$parent.$parent.allMissingSections.length)
                this.$parent.$parent.allMissingSections.forEach(courseId => {
                    console.log(courseId)
                })
            }
        }
    }
</script>

<style scoped lang="scss">
    .dropdown {
        @media screen and (min-width: 500px){
            /*display: none;*/
            right: 90px;
            top: 30px;
            display: inline-block;
            position: absolute;
            .dropdown-content {
                position: absolute;
                right: 0;

            }
        }
        @media screen and (max-width: 500px){
            top: 16px;
            left: 4%;
            position: absolute;
            display: inline-block;
            .dropdown-content {
                position: absolute;
            }
        }
        .dropdown-content {
            position: absolute;
            background-color: #f9f9f9;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            z-index: 3;
            width: max-content;

            a{
                color: black;
                padding: 8px 8px;
                text-decoration: none;
                cursor: pointer;
                display: block;
                font-size: smaller;
                img{
                    vertical-align: middle;
                    color: white;
                }
            }
            a:hover {
                background: gray;
            }
        }
        img {
            cursor: pointer;
        }

    }
    .dropdown-enter-active,
    .dropdown-leave-active {
        transition: opacity .5s;
    }

    .dropdown-enter,
    .dropdown-leave-to
        /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }
</style>