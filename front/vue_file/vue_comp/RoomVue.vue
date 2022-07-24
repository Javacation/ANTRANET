<template>
    <div class="container-fluid m-0 p-0 test-border">
        <tr id="firstTrtag" class="container-fluid" style="border: none;">
        </tr>
    </div>
</template>


<script>
import { createApp, h, onMounted, onUnmounted, ref, } from 'vue';
import Store from '../../store/vueStore';
import Axios from 'axios';

export default {
    name: "RoomVue", // 계층적방을 구성할 수 있도록 도와주는 컴포넌트
    props: {
        Room: JSON,
        depth: Number,
    },
    setup: (props, context)=>{
        const store = Store;

        const params = ref({
            socket_io: null,
            currentVisibleRoom: props.Room,
        });

        const methods = {
            getRoom: async (parent, room_id, depth)=>{ // 특정 방 렌더링 메소드
                // 전달받은 방 ID의 정보를 서버에서 받아온다.
                var axiosResult = (await Axios.post('/getRoom', {'room_id': room_id, 'user_id': store.state.userData._id})).data;

                // 받아온 정보로부터 컨텐츠들을 tr로 감싸 innerHtml로 값을 삽입한 노드로 만든다.
                var array = axiosResult.room.contents.map((item, index)=>{
                        if(item.code === 10){ // 만약 참조인경우 클릭시 다시 방 렌더링 메소드를 호출하도록 노드를 작성한다.
                            return h(
                                'tr',{ // 해당 위치에 마운팅 시킬 수 있도록 tr의 ID값을 유일하게 만들어준다.
                                    'id': 'a'+room_id+index+depth,
                                    'class': 'container-fluid test-border'
                                },
                                h(
                                    'input',
                                    {
                                        'type': 'button',
                                        onClick: async (e)=>{ 
                                            var temp = e.target.parentElement; // 클릭 시 현재 태그의 부모 엘리먼트의 id 값을 받아오고 렌더링 메소드를 실행한다.
                                            temp = temp.id;
                                            methods.getRoom(`${temp}`, item.value, depth+1);
                                        },
                                        'value': '참조열기'
                                    },
                                )
                            );
                            
                        } else{ // 일반 내용일 경우 Html로 삽입한다.
                            return h(
                                'tr',
                                {
                                    'class': 'container-fluid test-border'
                                },
                                h(
                                    'td', 
                                    {
                                        colspan: 4,
                                        'innerHTML': item.value,
                                    },
                                )
                            );
                        }
                    });

                if(depth == 1){ // 처음으로 방을 연 상태라면 해당 방의 자식방들로 들어갈 수 있도록 만든다.
                    array.push(h(
                        'div',
                        {
                            'class': 'm-3',
                        },
                        axiosResult.room.children.map((item, index)=>{
                            return h(
                                'input',
                                {
                                    'type': 'button',
                                    onClick: async (e)=>{ // 클릭시 여기서 렌더링 메소드를 사용하지 않고 현재 컴포넌트의 부모가 처음부터 다시 렌더링 하도록 emit한다.
                                        context.emit("OPENROOM", item.oid._id);
                                    },
                                    'value': item.oid.title
                                },
                            );
                        })
                    ));
                } else{ // 만약 첫번째 방이 아니라면 현재 참조가 보여지게 된 내용이 어디 방에서 기인했는지 작성한다.
                    var room_id = axiosResult.room._id;
                    array.unshift(h(
                        'div', 
                        {
                            'style': 'color: red;',
                            'innerText': `${room_id} 에서 참조`
                        },

                    ));
                }
                

                // 위에 적힌 내용을 자식으로 가지는 div 태그를 렌더링 한다.
                var tempApp = createApp(h(
                    'div',
                    {
                        'class': 'container-fluid test-border d-flex-flex-column p-3'
                    },
                    array
                ));

                // 마운팅이 요청된 이름에 #이 없는경우 붙여서 마운트를 진행한다.
                if(parent.indexOf('#') === -1) parent = '#'+parent;

                tempApp.mount(parent);
            },
            makeRoomContent: async ()=>{ // 해당 컴포넌트가 처음 방을 호출해야하는 경우 실행한다.
                methods.getRoom('firstTrtag', props.Room._id, 1);
            },
            render: (tag, option, value)=>{
                return h(tag, option, value);
            }
        };

        methods.makeRoomContent();

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