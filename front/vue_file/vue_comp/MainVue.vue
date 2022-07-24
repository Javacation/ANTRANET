<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">
        <div class="container-fluid">
            <img src="https://st.depositphotos.com/1763233/1271/i/600/depositphotos_12714008-stock-photo-big-red-ant-isolated-on.jpg" alt="">
        </div>
        <div class="container-fluid mb-5">
            <h1><strong>Welcome to Antranet</strong></h1>
            <h2 v-if="store.getters.GET_IS_LOGIN">어서오세요 {{store.state.name}} 님</h2>
            <h2 v-if="store.getters.GET_IS_LOGIN && store.state.currentNest">지금 입장중인 둥지이름 {{store.state.currentNest.name}}</h2>
        </div>

        <router-link to="/main/regist">회원가입 페이지</router-link>
        <router-link to="/main/login"  v-if="!store.getters.GET_IS_LOGIN">로그인 페이지</router-link> 
        <router-link v-if="store.getters.GET_IS_LOGIN" to="/main/entranceNest">둥지입장</router-link>
        <router-link v-if="store.getters.GET_IS_LOGIN" to="/main/makeNest">둥지만들기</router-link>
        <router-link v-if="store.getters.GET_IS_LOGIN" to="/main/findNest">둥지찾기</router-link>
        <router-link v-if="store.getters.GET_IS_LOGIN && store.state.currentNest" to="/main/auth">권한관리</router-link>
        <router-link to="" @click="methods.clickme">---------</router-link>
        
    </div>
</template>


<script>
import { onMounted, onUnmounted, ref, createApp,  } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import Store from '../../store/vueStore';
import TestMountVue from './TestMounterVue.vue';

export default {
    name: "MainVue", // 메인화면 
    setup: (props, context)=>{
        const store = Store;
        const router = useRouter();
        const route = useRoute();
        const params = ref({
            socket_io: null,
            loginValue: '',
            myName: '',
        });

        const methods = {
            routeUrl: (url)=>{ // 라우팅 메소드 등록
                router.push(url);
            },
            clickme: (e)=>{ // 클릭 테스트 메소드
                console.log(e.target.parentElement.parentElement);
            }
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