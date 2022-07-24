<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">

        
        <router-view v-slot="{ Component }">
            <transition name="fast-fade" mode="out-in">
                <component :is="Component"></component>
            </transition>
        </router-view> 
        
        

        <div @click="methods.logout"
        id="loginValid" :class="`${store.getters.GET_IS_LOGIN? 'login': 'logout'}`">

        </div>

        <div @click="methods.chatToggle" id="chatToggle" :class="`${store.getters.IS_CHAT_SOCKET_CONNECTED? 'login': 'logout'}`">
            <h1>
                C
            </h1>
        </div>

        <div id="mainButton" @click="methods.routeUrl('/main')">
            <i class="bi bi-bricks" style="fontSize: 50px;"></i>
        </div>

        <div id="notificationWrapper" class="d-flex flex-column">
            <div 
            id="notification" class="d-flex"
            v-for="item, index in params.notifiList"
            :key="index">
                <div>{{item}}</div>
                <i id="deleteButton" class="bi bi-bell-slash-fill" @click="methods.deleteNotifi(index)"></i>
            </div>
        </div>

        <div id="chatWrapper" class="d-flex flex-column">
            <div id="chat" class="d-flex" v-for="item, index in store.getters.GET_CHAT_LIST" :key="index">  
                <pre class="p-0 m-0">{{item}}</pre>
            </div>
            <div class="d-flex justify-content-end mt-3">
                <input class="flex-grow-1" type="text" placeholder="보낼 내용을 입력해주세요." v-model="params.chat"><input @click="methods.sendChat" type="button" value="전송">
            </div>
        </div>

        <div id="questionVueWrapper">
            <question-vue></question-vue>
        </div>
    </div>
</template>


<script>
import { onMounted, onUnmounted, ref, } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import Store from '../../store/vueStore';
import { io } from 'socket.io-client'
import QuestionVue from './QuestionVue.vue';
import AXIOS from 'axios';

export default {
    components: {
        QuestionVue
    },
    name: "IndexVue", // 인덱스 페이지
    setup: (props, context)=>{
        const store = Store;
        const router = useRouter();
        const route = useRoute();
        const params = ref({
            notifiList: store.state.notifiList,
            chat: '',
        });

        const socket_io = io("http://127.0.0.1:3000");

        socket_io.on('connect', (data)=>{ // 서버 연결 리스너 등록
            store.commit('LOGOUT');
            store.commit('ADD_NOTIFI', '서버가 연결 됬습니다!');
            router.push('/main');
        });

        socket_io.on('disconnect', (data)=>{ // 서버 연결 끊김 리스너 등록
            store.commit('LOGOUT');
            store.state.currentNest = null;
            store.commit('ADD_NOTIFI', '서버가 종료 됬습니다!');
            router.push('/main');
        });

        store.commit("REGIST_SOCKET", {'socket': socket_io}); // 스토어에 소켓등록

        const methods = {
            io_on: ()=>{
                try {

                    socket_io.on('regist_result', (data)=>{ // 회원 가입 리스너 등록
                        router.push('/main');
                        store.commit('ADD_NOTIFI', data.result);
                    });

                    socket_io.on('login_result', (data)=>{ // 로그인 결과 리스너 등록
                        store.commit('LOGIN', data);
                        if(data && data.code === 0){
                            store.state.name = data.name;
                            store.state.userData = data;

                            router.push('/main');

                            AXIOS.post('/getRoom', {'user_id': store.state.userData._id, 'room_id': ''})
                            .then((res)=>{
                                console.log(res.data);
                            })
                            .catch((err)=>{
                                console.log(err);
                            });
                        }

                        store.state.findList = [];
                        store.commit('ADD_NOTIFI', data.result);
                    });

                    socket_io.on('logout_result', (data)=>{ // 로그아웃 리스너 등록
                        store.commit('LOGOUT');
                        router.push('/main');
                        store.state.currentNest = null;
                        
                        store.commit('ADD_NOTIFI', data.result);
                    });

                    socket_io.on('login_please', (data)=>{ // 서버에서의 로그인 요청 리스너 등록
                        store.commit('LOGOUT');
                        router.push('/main/login');
                        store.state.currentNest = null;
                        store.commit('ADD_NOTIFI', '로그인 후 이용가능 합니다.');
                    });

                    socket_io.on('nests_find_result', (data)=>{ // 둥지 검색 결과 리스너 등록
                        store.commit('ADD_NOTIFI', `검색된 둥지 갯수: ${data.result.length}`);
                        store.state.findList = data.result;
                        store.state.resultRoom = null;
                    });

                    socket_io.on('make_nest_result', (data)=>{ // 둥지 제작 리스너 등록
                        store.commit('ADD_NOTIFI', data.result);
                        router.push('/main');
                    });

                    socket_io.on('regist_nest_result', (data)=>{ // 둥지 가입 리스너 등록
                        store.commit('ADD_NOTIFI', data.result);
                        router.push('/main');
                    });

                    socket_io.on('entrance_nest_result', (data)=>{ // 둥지 입장 리스너 등록
                        let tempDate = data;
                        if(tempDate.code === 0){
                            store.state.currentNest = tempDate.nest;
                        }
                        
                        store.commit('ADD_NOTIFI', tempDate.result);
                    })

                    socket_io.on('out_nest_result', (data)=>{ // 둥지 퇴장 리스너 등록
                        store.state.currentNest = null;
                        store.commit('ADD_NOTIFI', '둥지에서 나왔습니다.');
                    })
                }
                catch (error) {
                    console.log(error);
                }
            },
            sendChat: ()=>{ // 채팅 전송 메소드
                var socket = store.getters.GET_CHAT_SOCKET;
                if(params.value.chat && socket){
                    store.getters.GET_CHAT_SOCKET.emit('plain_chat_request', {'sender': store.state.name, 'content': params.value.chat});
                    params.value.chat = '';
                }
            },
            routeUrl: (url)=>{ // 라우팅 메소드 등록
                router.push(url);
            },
            deleteNotifi: (index)=>{ // 알림 삭제 메소드
                params.value.notifiList.splice(index, 1);
            },
            logout: ()=>{ // 로그아웃 메소드
                socket_io.emit("logout_request", '');
            },
            chatToggle: ()=>{ // 채팅방 입/퇴장 메소드
                store.commit('CHAT_SOCKET_TOGGLE', {});
            }
        };

        onMounted(()=>{
            methods.io_on(); // 기본 소켓 리스너 등록
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

#loginValid{
    position: fixed;
    cursor: pointer;
    width: 50px;
    height: 50px;
    top: 10px;
    left: 10px;
}

#chatToggle{
    position: fixed;
    cursor: pointer;
    width: 50px;
    height: 50px;
    top: 10px;
    left: 70px;
}

#mainButton{
    position: fixed;
    width: 50px;
    height: 50px;
    top: 70px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    cursor: pointer;
}

#notificationWrapper{
    position: fixed;
    width: fit-content;
    min-width: 30vw;
    height: fit-content;
    min-height: 10px;
    left: 10px;
    bottom: 10px;
    background-color: rgba(0, 0, 0, 0.7);
}

#chatWrapper{
    position: fixed;
    width: fit-content;
    max-width: 60vw;
    min-width: 30vw;
    height: fit-content;
    min-height: 10px;
    right: 10px;
    bottom: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
}

#deleteButton{
    cursor: pointer;
}

#notification{
    color: white;
}

.login{
    background: green;
}

.logout{
    background: red;
}

.fast-fade-enter-from, .fast-fade-leave-to{
    opacity: 0;
}

.fast-fade-enter-active, .fast-fade-leave-active{
    transition: all 0.3s ease;
}

</style>