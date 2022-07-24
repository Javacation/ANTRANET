<template>
    <div id="rootVue" class="container-fluid d-flex flex-wrap justify-content-around align-content-around text-center">
        <div class="d-flex flex-column container-fluid mt-3" style="height: fit-content;">
            <transition name="fast-fade" mode="out-in">
            <table v-if="params.isVisible">
                <thead>
                    <tr class="reverse-color">
                        <th colspan="5">
                            개미들
                        </th>
                    </tr>
                    <tr>
                        <th>
                            개미이름
                        </th>
                        <th>
                            권한
                        </th>
                        <th>
                            권한명
                        </th>
                        <th>
                            변경할 값
                        </th>
                        <th>
                            변경하기
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item, index in params.antList" :key="index">
                        <td>
                            {{item.decodeName}}
                        </td>
                        <td>
                            {{item.level.level}}
                        </td>
                        <td>
                            {{item.level.nickName}}
                        </td>
                        <td>
                            <select name="" :id="`modi_${index}`">
                                <option v-for="item2, index2 in params.nest.info.antConfig.levelMap" :key="index2">
                                    {{`${item2.level} ${item2.nickName}`}}
                                </option>
                            </select>
                        </td>
                        <td>
                            <input type="button" value="변경" @click="methods.changeAuth(item, index)">
                        </td>
                    </tr>
                </tbody>
                <thead>
                    <tr class="reverse-color">
                        <th colspan="5">
                            개미들
                        </th>
                    </tr>
                    <tr>
                        <th>
                            추가할 권한 레벨
                        </th>
                        <th>
                            권한명
                        </th>
                        <th>
                           
                        </th>
                        <th>
                            
                        </th>
                        <th>
                            
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <input type="number" v-model="params.authNum">
                        </td>
                        <td>
                            <input type="text" v-model="params.authName">
                        </td>
                        <td colspan="3">
                            <input type="button" value="추가" @click="methods.addAuth">
                        </td>
                    </tr>
                </tbody>
            </table>
            </transition>
        </div>
    </div>
</template>


<script>
import { onMounted, onUnmounted, ref, } from 'vue';
import Store from '../../store/vueStore';
import { useRouter } from 'vue-router';
import AXIOS from 'axios';

export default {
    name: "AuthVue", // 권한을 추가, 변경할 페이지
    setup: (props, context)=>{
        const store = Store;
        const Router = useRouter();

        const params = ref({
            socket_io: null, isVisible: false,
            loginValue: '', antList: [], nest: {},
            authNum: 0, authName: ''
        });

        const methods = {
            getAntsList: async ()=>{ // 현재 입장한 둥지의 개미 리스트를 받아오는 메소드
                params.value.isVisible = false;
                var result = await AXIOS.post('/getAntsList', {user_id: store.state.userData._id});
                params.value.antList = result.data.result.ants;
                params.value.nest = result.data.result.nest;
                params.value.isVisible = true;
            },
            changeAuth: async (item, index)=>{ // 특정 개미의 권한을 변경하는 메소드
                var selector = $(`#modi_${index}`).val();
                var bodyData = {
                    change_id: item.ant._id,
                    changeAuth: parseInt(selector.split(' ')[0]),
                    user_id: store.state.userData._id
                };

                var result = await AXIOS.post('/changeAntAuth', bodyData);

                store.commit('ADD_NOTIFI', result.data.result);

                methods.getAntsList();
            },
            addAuth: async ()=>{ // 둥지에 권한을 추가하는 메소드 처리후 다시 개미 리스트를 받아온다.
                console.log(params.value.authNum, params.value.authName);
                var bodyData = {
                    user_id: store.state.userData._id,
                    addAuth: {
                        level: parseInt(params.value.authNum),
                        nickName: params.value.authName,
                    }
                };

                var result = await AXIOS.post('/addAuth', bodyData);
                params.value.authNum = 0;
                params.value.authName = '';

                store.commit('ADD_NOTIFI', result.data.result);

                methods.getAntsList();
            }
        };

        onMounted(()=>{
            params.value.socket_io = store.state.socket;

            if(!store.getters.GET_IS_LOGIN || !store.state.currentNest){ // 로그인 상태가 아니거나 둥지가 없는 경우 main으로 돌려보냄
                Router.push('/main');
            }

            methods.getAntsList();
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

</style>