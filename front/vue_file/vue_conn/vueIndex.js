import { createApp } from 'vue';
import Store from '../../store/vueStore';
import vueRouter from '../../router/vueRoute';
import IndexVue from '../vue_comp/IndexVue';



const app = createApp(IndexVue);
app.use(vueRouter); // 라우터 등록
app.mount("#Root"); // 현재 페이지에 존재하는 루트태그에 마운트