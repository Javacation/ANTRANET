<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">
        <transition name="fast-fade" mode="out-in">
            <div v-if="!store.state.currentNest"
            id="sendDiv" class="d-flex flex-column container mt-3" style="height: fit-content;">
                <div class="reverse-color">
                    둥지입장
                </div>
                <input class="flex-grow-1" type="text" placeholder="둥지이름을 입력해주세요." v-model="params.nestName">
                <input type="button" @click="methods.entrance_nest_emit" value="입장">
            </div>
            <div v-else class="d-flex flex-column container mt-3" style="height: fit-content;">
                <input type="button" @click="methods.out_nest_emit" value="둥지나가기">
            </div>
        </transition>

        <div class="d-flex flex-column container-fluid mt-3" style="height: fit-content;">
            <h2 v-if="store.getters.GET_IS_LOGIN && store.state.currentNest">지금 입장중인 둥지이름 {{store.state.currentNest.name}}</h2>
            <input class="m-5" @click="methods.makeRoom" v-if="store.getters.GET_IS_LOGIN && store.state.currentNest" type="button" value="글쓰기">
        </div>

        <transition name="fast-fade" mode="out-in">
            <div v-if="store.state.currentNest"
            class="d-flex flex-column container">
                <table>
                    <thead>
                        <tr>
                            <th>작성자</th>
                            <th>방제목</th>
                            <th>접근레벨</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item, index in store.state.currentNest.info.rooms" :key="index">
                            <td>
                                {{item.oid.makeAnt.name}}
                            </td>
                            <td class="over-cursor" @click="methods.openRoom(item.oid._id)">
                                {{item.oid.title}}
                            </td>
                            <td>
                                {{item.oid.accessLevel}}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </transition>

        <transition name="fast-fade" mode="out-in">
            <make-room-vue @WRITEEND='methods.writeEnd'
            style="marginTop:50px;" v-if="store.getters.GET_IS_LOGIN && store.state.currentNest && params.isWrite"></make-room-vue>
        </transition>
        <br>

        <transition name="fast-fade" mode="out-in">
        <div id="roomContainer" class="d-flex flex-column container mt-5" v-if="params.currentVisibleRoom">
            <table>
                <thead>
                    <tr>
                        <th colspan="4">
                            <input type="button" value="닫기" @click="methods.closeRoom">
                        </th>
                    </tr>
                    <tr>
                        <th>ID: {{params.currentVisibleRoom._id}}</th>
                        <th>작성자: {{params.currentVisibleRoom.makeAnt.name}}</th>
                        <th>방제목: {{params.currentVisibleRoom.title}}</th>
                        <th>접근레벨: {{params.currentVisibleRoom.accessLevel}}</th>
                    </tr>
                </thead>
                <tbody class="text-start" style="border: 1px black solid;">
                    <tr>
                        <td class="container-fluid" colspan="4">
                            <transition name="fast-fade" mode="out-in">
                                <room-vue @OPENROOM="methods.openRoom" v-if="params.isVisible"
                                :Room="params.currentVisibleRoom" :depth="0"></room-vue>
                            </transition>
                        </td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
        </transition>
    </div>
</template>


<script>
import { createApp, onMounted, onUnmounted, ref, h } from 'vue';
import Store from '../../store/vueStore';
import RoomVue from './RoomVue.vue';
import MakeRoomVue from './MakeRoomVue.vue';
import  Axios  from 'axios';

export default {
    components: {
        RoomVue, MakeRoomVue
    },
    name: "EntranceNestVue", // 둥지 입장 페이지
    setup: (props, context)=>{
        const store = Store;

        const params = ref({
            socket_io: null,
            nestName: '',
            currentVisibleRoom: null, isVisible: false,
            roomVue: null,
            isWrite: false,
        });

        const methods = {
            writeEnd: ()=>{
                params.value.isWrite = false;
            },
            makeRoom: ()=>{
                params.value.isWrite = !params.value.isWrite;
            },
            entrance_nest_emit: ()=>{ // 둥지 입장 요청 메소드
                try {
                    if(params.value.nestName){ 
                        params.value.socket_io.emit('entrance_nest_request', {'nestName': params.value.nestName});
                        params.value.nestName = '';
                    }  
                }
                catch (error) {
                    console.log(error);
                }
            },
            out_nest_emit: ()=>{ // 둥지 퇴장 요청 메소드
                try {
                    params.value.socket_io.emit('out_nest_request');
                    params.value.currentVisibleRoom = null;
                }
                catch (error) {
                    console.log(error);
                }
            },
            openRoom: async (roomModel)=>{ // 특정 방을 여는 메소드
                params.value.isVisible = false;

                var data = await Axios.post('/getRoom', {'user_id': store.state.userData._id, "room_id": roomModel});

                if(data.data.code === 0){
                    params.value.currentVisibleRoom = data.data.room;
                    params.value.isVisible = true;
                }

                store.commit('ADD_NOTIFI', data.data.result);
            },
            closeRoom: ()=>{
                params.value.currentVisibleRoom = null;
            },
            getContent: ()=>{
                return 'sajdlnsakdsakdn';
            },
            
        };

        onMounted(()=>{
            params.value.socket_io = store.state.socket;
            params.value.currentVisibleRoom = null;

            params.value.socket_io.on('request_room_result', (data)=>{
                var tempData = data.room;
                
                params.value.currentVisibleRoom = tempData;
            });
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

.fast-fade-enter-from, .fast-fade-leave-to{
    opacity: 0;
}

.fast-fade-enter-active, .fast-fade-leave-active{
    transition: all 0.3s ease;
}

td, tr{
    border: 1px black solid;
}



</style>