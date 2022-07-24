<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">
        <div class="d-flex flex-column mt-3">
            <div class="reverse-color">
                둥지이름
            </div>
            <input class="flex-grow-1" type="text" placeholder="둥지이름" v-model="params.nestName">
            <button @click="methods.io_make_nest_request_emit">둥지만들기</button>
        </div>
    </div>
</template>


<script>
import { onMounted, onUnmounted, ref, } from 'vue';
import Store from '../../store/vueStore';
import { useRouter } from 'vue-router';

export default {
    name: "MakeNestVue", // 둥지 생성 페이지
    setup: (props, context)=>{
        const store = Store;

        const params = ref({
            socket_io: null,
            nestName: ''
        });

        const methods = {
            
            io_make_nest_request_emit: ()=>{ // 둥지 생성 요청 메소드
                try {
                    if(params.value.nestName){
                        params.value.socket_io.emit('make_nest_request', {'name': params.value.nestName});
                        params.value.nestName = '';
                    }  
                }
                catch (error) {
                    console.log(error);
                }
            },
            
        };

        onMounted(()=>{
            if(!store.getters.GET_IS_LOGIN) { // 로그인 확인
                useRouter().push('/main');
            }
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



.reverse-color{
    background: black;
    color: white;
}

</style>