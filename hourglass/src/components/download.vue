<template>
    <a @click="downloadSnapshot">download</a>
</template>

<script>
    import $ from "jquery"
    import html2canvas from 'html2canvas'

    export default {
        name: "download",
        methods: {
            downloadSnapshot: function () {
                html2canvas($(".cd-schedule")[0]).then(response => {
                    var a = document.createElement('a');
                    // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                    a.href = response.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                    a.download = 'somefilename.jpg';
                    a.click();
                })
            }
        }
    }
</script>

<style scoped>

</style>