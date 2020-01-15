<template>
    <div id="searchInput">
        <b-input-group class="mt-3">
            <template v-slot:append>
                <b-input-group-text><strong class="text-danger">!</strong></b-input-group-text>
            </template>
            <b-form-input></b-form-input>
        </b-input-group>
    </div>
</template>

<script>
    export default {
        name: "autocomplete"
    }
</script>

<style scoped>
    #searchInput {
        position: absolute;
        right: 20px;
        width: 20%;
    }
</style>