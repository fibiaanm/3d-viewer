import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '@/views/CatalogView.vue'
import PreviewerView from '@/views/PreviewerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/catalog' },
    { path: '/catalog', name: 'catalog', component: CatalogView },
    { path: '/product/:id', name: 'product', component: PreviewerView },
  ],
})

export default router
