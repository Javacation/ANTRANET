<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">
        <div
        id="sendDiv" class="d-flex flex-column container-fluid mt-3" style="height: fit-content;">
            <div class="reverse-color">
                로그인
            </div>
            <input class="flex-grow-1" type="text" v-model="params.loginValue">
            <button @click="methods.io_login_emit">로그인</button>
        </div>
    </div>
</template>


<script>
import { onMounted, onUnmounted, ref, } from 'vue';
import Store from '../../store/vueStore';

export default {
    name: "LoginVue", // 로그인 페이지
    setup: (props, context)=>{
        const store = Store;

        const params = ref({
            socket_io: null,
            loginValue: '',
        });

        const methods = {
            
            io_login_emit: ()=>{ // 로그인 요청
                try {
                    if(params.value.loginValue){
                        params.value.socket_io.emit('login_request', params.value.loginValue);
                        params.value.loginValue = '';
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