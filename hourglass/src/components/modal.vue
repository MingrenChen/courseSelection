<template>
    <div class="cd-schedule-modal" :style='this.getStyleWithPx' :data-event='getEvent'>
        <div class="cd-schedule-modal__header" >

        </div>
    </div>
</template>

<script>
    import myEle from "../js/animation";
    import gsap from "gsap";
    import sectionselection from "./sectionselection";

    export default {
        name: "modal",
        props: ['modalState'],
        components: {
            sectionselection,
        },
        data: function(){
            return {

            }
        },
        mounted: function(){
            let origin = this.modalState.boundingBox;
            let dest = this.getStyle;
            let x = origin.left - dest.left;
            let y = origin.top - dest.top;
            let scaleX = origin.width/dest.width;
            let scaleY = origin.height/dest.height;
            gsap.from('.cd-schedule-modal__header', {x:x, y:y, scaleX:scaleX,scaleY:scaleY,duration: 0.5})
        },
        computed: {
            course: function() {return this.modalState.course},
            getStyle: function(){
                let style = {};
                let window = this.$parent.window;
                let modalWidth = (window.width *.8 > 800 ) ? 800 : window.width *.8;
                let modalHeight = ( window.height *.8 > 480 ) ? 480 : window.height *.8;
                let modalLeft = (window.width - modalWidth)/2;
                let modalTop = (window.height - modalHeight)/2.5;
                style.width = modalWidth;
                style.height = modalHeight;
                style.left = modalLeft;
                style.top = modalTop;
                return style
            },
            getStyleWithPx: function(){
                let style = JSON.parse(JSON.stringify(this.getStyle));
                style.width = style.width + 'px';
                style.height = style.height + 'px';
                style.left = style.left + 'px';
                style.top = style.top + 'px';
                return style
            },
            getEvent: function () {
                return this.course.event
            },
        },
        methods: {



        },
    }
</script>

<style scoped lang="scss">
    .cd-schedule-modal {
        position: absolute;
        background: white;
        z-index: 2;

    }
    .cd-schedule-modal__header {
        width: 20%;
        height: 100%;
        align-content: center;
        z-index: 4;
        transform-origin:left top;

    }
    .cd-schedule-modal__content {
        position: absolute;
        z-index: 3;
        display: block;
        align-items: center;
        padding: 1em;
        -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
        -moz-box-sizing: border-box;    /* Firefox, other Gecko */
        box-sizing: border-box;
        top: 0;
        left: 0;
        color: white;

        span,h3,h4 {
            margin: 0;
        }
    }
    .cd-schedule-modal__header-bg {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    .cd-schedule-modal__body {
        background: white;
        width: inherit;
        /*padding: var(--space-sm);*/
        z-index: 3;
        opacity: 1;
    }

    .modal-body-enter-active, .modal-body-leave-active {
        transition: opacity 0.2s;
    }
    .modal-body-enter, .modal-body-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }

</style>