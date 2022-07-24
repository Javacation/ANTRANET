import { createWebHistory, createRouter } from "vue-router"; 

import MainPage from '../vue_file/vue_comp/MainVue';
import LoginPage from '../vue_file/vue_comp/LoginVue';
import AuthPage from '../vue_file/vue_comp/AuthVue';
import RegistPage from '../vue_file/vue_comp/RegistVue';
import MakeNestPage from '../vue_file/vue_comp/MakeNestVue';
import FindNestPage from '../vue_file/vue_comp/FindNestVue';
import EntranceNestPage from '../vue_file/vue_comp/EntranceNestVue';

const routes = [
    { path: '/', redirect: '/main' }, // '/' 로 갈경우 '/main'으로 리다이렉트
    { path: '/main', component: MainPage},
    { path: '/main/login', component: LoginPage},
    { path: '/main/auth', component: AuthPage},
    { path: '/main/regist', component: RegistPage},
    { path: '/main/makeNest', component: MakeNestPage},
    { path: '/main/findNest', component: FindNestPage},
    { path: '/main/entranceNest', component: EntranceNestPage},
    { path: '/:pathMatch(.*)*', redirect: '/main'} // 잘못된 라우팅은 main으로 
]; 

const router = createRouter({
    history : createWebHistory(), // 유저의 라우팅을 브라우저의 URL단에서 보여주는 라우팅 방식
    routes
});

export default router;