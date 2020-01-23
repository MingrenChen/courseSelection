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
            </div>
    </div>
</template>

<script>
    import $ from "jquery"
    import html2canvas from 'html2canvas'
    import EventBus from "../assets/js/EventBus";

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

            }
        }
    }
</script>

<style scoped lang="scss">
    .dropdown {
        @media screen and (min-width: 500px){
            display: none;
        }
        @media screen and (max-width: 500px){
            top: 16px;
            left: 4%;
            position: absolute;
            display: inline-block;
            .dropdown-content {
                position: absolute;
                background-color: #f9f9f9;
                width: 160px;
                box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                z-index: 3;

                a{
                    color: black;
                    padding: 8px 8px;
                    text-decoration: none;
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