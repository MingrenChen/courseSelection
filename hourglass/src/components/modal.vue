<template>
    <div class="cd-schedule-modal" :style='this.getStyle'>
        <div class="cd-schedule-modal__header" :data-event='getEvent'>

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
        computed: {
            course: function() {return this.modalState.course},
            getStyle: function(){
                if (!this.style) {
                    return {}
                }
                let style = this.style;
                let window = this.$parent.window;
                let modalWidth = (window.width *.8 > 800 ) ? 800 : window.width *.8;
                let modalHeight = ( window.height *.8 > 480 ) ? 480 : window.height *.8;
                let modalLeft = (window.width - modalWidth)/2;
                let modalTop = (window.height - modalHeight)/2.5;
                style.width = modalWidth + 'px';
                style.height = modalHeight + 'px';
                style.left = modalLeft + 'px';
                style.top = modalTop + 'px';
                return style
            },
            getEvent: function () {
                return this.course.event
            },
        },
        methods: {
            closeModalClick: function (event) {
                this.$parent.closeModal()
                event.preventDefault()
            },
            onClassChange: function(classAttrValue) {
                const classList = classAttrValue.split(' ');
                if (classList.includes('cd-schedule-modal__opening')){
                    this.modalOpenAnimate()
                }
                if (classList.includes('cd-schedule-modal__closing')){
                    this.style.visibility = 'hidden';
                    this.modalCloseAnimate()
                }
            },
            modalShowEventDetail: function () {
                this.showModalBody = true
            },
            afterModalBodyEnter: function() {
                this.$parent.modalState.modalIsOpening = false
            },

            modalOpenAnimate: function () {
                // get meeting block's rectangle
                let meetingRec = this.$parent.modalState.selectedMeeting.$el.getBoundingClientRect();
                // get modal header's rec, header is the left column of modal
                let modalHeaderRec = this.$refs.header.getBoundingClientRect();
                // get width of the whole modal, we want to set header column 20% of modal
                let width = parseInt(this.getStyle.width.slice(0, this.getStyle.width.length-2));
                this.headerStyle.width = width * 0.2+'px';
                // input to myEle is the final location of modal header.
                let myele = new myEle(modalHeaderRec.left, modalHeaderRec.top, width * 0.2, modalHeaderRec.height);
                let transition_header__bg =
                    myele.styleMoveAndScaleFrom(meetingRec.left, meetingRec.top, meetingRec.width, meetingRec.height, 0.5);

                // add a call back function here on complete
                transition_header__bg.onComplete = this.modalShowEventDetail;
                // make the modal visible when animation start
                transition_header__bg.onStart = this.hideShowModal;
                gsap.from('.cd-schedule-modal__opening .cd-schedule-modal__header-bg', transition_header__bg);

                // header content are only for course code and title part of header
                let transition_header__content =
                    myele.styleMoveFrom(meetingRec.left, meetingRec.top, 0.5);
                gsap.from('.cd-schedule-modal__opening .cd-schedule-modal__content', transition_header__content);
            },
            modalCloseAnimate: function () {
                this.showModalBody = false;
                this.$parent.modalState.modalIsClosing = false
            },
            hideShowModal: function () {
                this.style.visibility = this.style.visibility === 'hidden' ? 'visible' : 'hidden'
            },


        },
    }
</script>

<style scoped lang="scss">
    .cd-schedule-modal__header {
        align-content: center;
        z-index: 4;
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