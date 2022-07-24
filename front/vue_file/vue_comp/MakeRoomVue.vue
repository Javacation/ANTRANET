<template>
    <div class="container-fluid m-5 p-0 test-border">
        <div class="container-fluid d-flex flex-column">
            부모 id<input type="text" placeholder="부모 id" v-model="params.parent_id">
            <br>
            제목<input type="text" placeholder="제목" v-model="params.title">
            <br>
            접근레벨<input type="number" placeholder="숫자만" v-model="params.accessLevel">
            <br>

            내용:
            <div v-for="item, index in params.content_count" :key="index">
                <input type="text" :id='`text${index}`' class="contents" placeholder="내용"> <input :id="`check${index}`" type="checkbox"> 참조
            </div>
            <input @click="methods.inc_content" type="button" value="내용추가">

            <input @click="methods.sendRoom" type="button" value="글쓰기">
        </div>
    </div>
</template>


<script>
import { createApp, h, onMounted, onUnmounted, ref, } from 'vue';
import Store from '../../store/vueStore';
import Axios from 'axios';

export default {
    name: "MakeRoomVue", // 방 만드는 페이지
    setup: (props, context)=>{
        const store = Store;

        const params = ref({
            socket_io: null,
            title: '', content_count: [{}, ], accessLevel: '', parent_id: '',
        });

        const methods = {
            inc_content: ()=>{ // 방에 추가할 컨텐츠 박스 추가
                params.value.content_count.push({});
            },
            sendRoom: async ()=>{ // 만들 방 정보 전송
                var bodyData = {
                    user_id: store.state.userData._id,
                    parent: params.value.parent_id,
                    title: params.value.title,
                    accessLevel: parseInt(params.value.accessLevel),
                    content_count: params.value.content_count.map((ite, index)=>{
                        var text = $(`#text${index}`).val() || '';
                        var ref = $(`#check${index}`).is(':checked');

                        var sondata = {
                            'value': text,
                            'code': ref? 10: 0,
                        }

                        return sondata;
                    }),
                };
                var result = await Axios.post('/makeRoom', {'room': bodyData});
                store.commit('ADD_NOTIFI', result.data.result);
                context.emit('WRITEEND');
            }
        };


        onMounted(()=>{
            params.value.socket_io = store.state.socket;
        });

        onUnmounted(()=>{

        });

        return {
            params, methods, store, props
        };
    }
}
</script>


<style>

.test-border{
    border: 1px black solid;
}

</style>