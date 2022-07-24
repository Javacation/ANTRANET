<template>
    <div id="asdf">
        {{props.testProp}}
    </div>
</template>

<script>
export default {
    name:'testVue', // 마운트 테스트용
    props:{
        testProp: String
    },
    setup(props, context) {
        
        return {
            props
        }
    },
}
</script>

<style scoped>
#asdf{
    width: 50px;
    height: 50px;
    background: red;
}
</style>