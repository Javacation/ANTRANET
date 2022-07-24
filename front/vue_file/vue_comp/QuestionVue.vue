<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">
        <div id="sendDiv" class="d-flex flex-column container-fluid mt-3" style="height: fit-content;">

        </div>
    </div>
</template>


<script>
import { onMounted, onUnmounted, ref, } from 'vue';
import Store from '../../store/vueStore';

export default {
    name: "QuestionVue",
    setup: (props, context)=>{
        const store = Store;

        const params = ref({
            socket_io: null,
        });

        const methods = {
            
        };

        onMounted(()=>{
            params.value.socket_io = store.state.socket;
        });

        onUnmounted(()=>{

        });

        return {
            params, methods, store
        };
    }
}
</script>


<style scoped>

</style>