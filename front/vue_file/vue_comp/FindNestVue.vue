<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">
        <div class="d-flex flex-column mt-3">
            <div class="reverse-color">
                둥지이름
            </div>
            <input class="flex-grow-1" type="text" placeholder="둥지이름" v-model="params.nestName">

            <div class="reverse-color">
                페이지
            </div>
            <input class="flex-grow-1" type="text" placeholder="페이지" v-model="params.page">

            <div class="reverse-color">
                페이지크기
            </div>
            <input class="flex-grow-1" type="text" placeholder="페이지크기" v-model="params.pageSize">
            <button @click="methods.io_find_nest_request_emit">둥지찾기</button>
        </div>

        <div class="container-fluid d-flex justify-content-center mt-5 pt-5">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>둥지이름</th>
                        <th>여왕이름</th>
                        <th>방개수</th>
                        <th>개미수</th>
                        <th>소속여부</th>
                        <th>가입하기</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item, index in store.getters.GET_FIND_NEST_LIST" :key="index" class="">
                        <td>{{item.name}}</td>
                        <td>{{item.queenName}}</td>
                        <td>{{item.rooms}}</td>
                        <td>{{item.totalAnt}}</td>
                        <td>{{item.imhere}}</td>
                        <td>
                            <input v-if="!item.imhere"
                            type="button" @click="methods.registNest(index)" value="가입하기">
                            </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script>
import { onMounted, onUnmounted, ref, } from 'vue';
import Store from '../../store/vueStore';
import { useRouter } from 'vue-router';

export default {
    name: "FindNestVue", // 둥지 검색 페이지
    setup: (props, context)=>{
        const store = Store;

        const params = ref({
            socket_io: null,
            nestName: '',
            page: '',
            pageSize: '',
            paths: '',
        });

        const methods = {
            
            io_find_nest_request_emit: ()=>{ // 둥지 검색 요청
                try {
                    params.value.socket_io.emit('nests_find_request', {
                        'regex': params.value.nestName, 
                        'page': params.value.page,
                        'pageSize': params.value.pageSize
                        });
                }
                catch (error) {
                    console.log(error);
                }
            },
            registNest: (index)=>{ // 둥지 가입 요청
                var registNest= store.getters.GET_FIND_NEST_LIST[index];

                try {
                    // console.log(registNest);
                    params.value.socket_io.emit('regist_nest_request', {'name': registNest.name});
                }
                catch (error) {
                    console.log(error);
                }
            },
            prettyNestList: (nestJson)=>{ // 둥지 보이게 하기
                return JSON.stringify(nestJson, null, 2);
            },
            io_get_room_from_nest_request_emit: ()=>{ // 둥지 검색 요청 (사용중지)
                try {
                    // console.log(registNest);
                    if(/^(.*:){1}(\/[\w]{1,})+$/.test(params.value.paths)){
                        params.value.socket_io.emit('get_room_from_nest_request', {'paths': params.value.paths});
                    }
                    
                }
                catch (error) {
                    console.log(error);
                }
            }
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

.fast-fade-enter-from, .fast-fade-leave-to{
    opacity: 0;
}

.fast-fade-enter-active, .fast-fade-leave-active{
    transition: all 0.3s ease;
}

#nestFindResult{
    border: 3px black solid;
}

</style>