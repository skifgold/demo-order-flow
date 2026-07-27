import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'

import { CatalogueView } from '@/features/catalogue'
import { CheckoutView } from '@/features/ordering'

export function createAppRouter(
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) {
  return createRouter({
    history,
    routes: [
      {
        path: '/',
        name: 'catalogue',
        component: CatalogueView,
      },
      {
        path: '/checkout',
        name: 'checkout',
        component: CheckoutView,
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/',
      },
    ],
  })
}

export default createAppRouter()
