import { createRouter, createWebHistory } from 'vue-router';
import MemeGenerator from '@/components/MemeGenerator.vue'; // 导入你的组件

const routes = [
  {
    path: '/', // 默认路径
    name: 'Home',
    component: MemeGenerator,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
