<template>
    <div class="sidenav">
        <div id="logo">
            <img src="../assets/image/logo2.png">
        </div>
        <div class="sidebar-credit">
            <span>Credit - Fall: {{getCredit('F')}} , Winter: {{getCredit('S')}} </span>
        </div>
        <div class="cd-sidenav__courses">
            <ul>
                <sidebar-course v-for="course in courses" :key="course.courseId"
                                :show-course="sidebarState.focusCourse === course.courseId"
                                :course="course" :selections="selectedSections(course)"></sidebar-course>
            </ul>
        </div>
    </div>

</template>

<script>
    import logo from '../assets/image/logo.png'

    export default {
        name: "sidebar",
        props: ['courses', 'selections', 'sidebarState'],
        data: function(){
            return {
            }
        },
        components: {
            'sidebar-course': require('./sidebar-course').default,
        },
        methods: {
            selectedSections: function (course) {
                return this.selections[course.courseId]
            },
            getCredit: function(semester) {
                return Object.keys(this.selections).map(element => {
                    if (element.split('-')[1] === semester || element.split('-')[1] === 'Y'){
                        return 1
                    }
                    return 0
                }).reduce((a,b) => a + b, 0)/2
            },
        },

    }
</script>

<style scoped lang="scss">
    @import "../assets/css/variable.scss";

    .sidenav {
        height: 100%; /* Full-height: remove this if you want "auto" height */
        width: $sidenav-width; /* Set the width of the sidebar */
        position: fixed; /* Fixed Sidebar (stay in place on scroll) */
        z-index: 1; /* Stay on top */
        top: 0; /* Stay at the top */
        left: 0;
        background-color: white; /* Black */
        overflow-x: hidden; /* Disable horizontal scroll */
        padding-top: 5px;
        box-shadow: 5px 0px 20px rgba(0, 0, 0, 0.2);
        /*overflow-y: hidden; !* Hide vertical scrollbar *!*/

        #logo{
            height: 10%;
            img {
                height: 100%;
            }
        }
        .sidebar-credit {
            height: 3%;
        }
        .cd-sidenav__courses{
            height: 87%;
            box-shadow: 0 -5px 20px -5px rgba(200, 0, 0, 0.2);

            ul {
                height: 100%;
            }
        }
    }
</style>