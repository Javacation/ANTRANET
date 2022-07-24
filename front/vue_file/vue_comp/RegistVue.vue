<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">
        <div class="d-flex flex-column container-fluid mt-3">
            <div class="reverse-color">
                회원가입
            </div>
            <input class="flex-grow-1" type="text" placeholder="사용할 아이디" v-model="params.id">
            <input class="flex-grow-1" type="text" placeholder="사용할 이름" v-model="params.name">
            <button @click="methods.io_regist_emit">회원가입</button>
        </div>
    </div>
</template>


<script>
import { onMounted, onUnmounted, ref, } from 'vue';
import Store from '../../store/vueStore';

export default {
    name: "RegistVue", // 회원가입 페이지
    setup: (props, context)=>{
        const store = Store;

        const params = ref({
            socket_io: null,
            id: '', name:''
        });

        const methods = {
            
            io_regist_emit: ()=>{ // 회원가입 요청
                try {
                    if(params.value.name && params.value.id){
                        params.value.socket_io.emit('regist_request', {'id': params.value.id, 'name': params.value.name});
                        params.value.id = '';
                        params.value.name = '';
                    }  
                }
                catch (error) {
                    console.log(error);
                }
            },
            
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



.reverse-color{
    background: black;
    color: white;
}

</style>