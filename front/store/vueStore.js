import Vuex from 'vuex';
import {io} from 'socket.io-client';

const makeDate = ()=>{ // 날짜 만드는 함수
    var datte = new Date();
    var result = '';

    result += datte.getFullYear()+'-';
    result += datte.getMonth()+1+'-';
    result += datte.getDate()+' ';
    result += datte.getHours()+':';
    result += datte.getMinutes()+':';
    result += datte.getSeconds();

    return result;
};

export default new Vuex.Store({
    state: { // store에서 사용할 정보 모음
        socket: null, chatSocket: null,
        name: null, userData: null,
        isLogin: false,
        notifiList: [], chatList: [],
        findList: [],
        resultRoom: null, currentNest: null,
    },
    mutations: { // state의 변수를 수정하기 위한 메소드 모음
        REGIST_SOCKET: (state, payload)=>{
            state.socket = payload.socket;
        },
        LOGIN: (state, payload)=>{
            if(payload.code === 0){
                state.isLogin = true;
            }
        },
        LOGOUT: (state)=>{
            state.name = null;
            state.isLogin = false;
        },
        ADD_NOTIFI: (state, payload)=>{
            state.notifiList.push(payload);

            if(state.notifiList.length > 5) state.notifiList.shift();
        },
        ADD_CHAT: (state ,payload)=>{
            state.chatList.push(`${makeDate()} ${payload.name}: ${payload.content}`);

            if(state.chatList.length > 10) state.chatList.shift();
        },
        CHAT_SOCKET_TOGGLE: (state)=>{
            if(state.chatSocket === null){
                state.chatSocket = io('http://127.0.0.1:3000/chat', {path: '/socket.io'});

                state.chatSocket.on('connect', (data)=>{
                    state.chatList.push('채팅방이 연결됬습니다!');
                    if(state.chatList.length > 7) state.chatList.shift();

                    state.chatSocket.on('plain_chat_result', (data)=>{
                        state.chatList.push(`${makeDate()} ${data.sender}: ${data.content}`);

                        if(state.chatList.length > 7) state.chatList.shift();
                    });

                    state.chatSocket.on('disconnect', (data)=>{
                        state.chatList.push('채팅방이 종료됬습니다!');
                        if(state.chatList.length > 7) state.chatList.shift();
                    })
                })
            } else{
                state.chatSocket.close();
                state.chatSocket = null;
            }
        },
        SET_RESULT_ROOM: (state, payload)=>{
            state.resultRoom = payload;
        }
    },
    actions: { // 비동기 처리를 위한 메소드 모음

    },
    getters: { // computed 처리로 값을 받아올 getter 메소드 모음
        GET_IS_LOGIN: (state)=>{
            return state.isLogin;
        },
        GET_FIND_NEST_LIST: (state)=>{
            return state.findList;
        },
        GET_CHAT_LIST: (state)=>{
            return state.chatList;
        },
        GET_CHAT_SOCKET: (state)=>{
            return state.chatSocket;
        },
        IS_CHAT_SOCKET_CONNECTED: (state)=>{
            return state.chatSocket? state.chatSocket.connected? true: false: false;
        },
        GET_RESULT_ROOM: (state)=>{
            return state.resultRoom;
        }
    },

});