import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

import HomeView from '../views/HomeView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue'
import CertificateDetailView from '../views/CertificateDetailView.vue'
import NotFoundView from '../views/NotFoundView.vue'

import AdminLayout from '../views/admin/AdminLayout.vue'
import LoginView from '../views/admin/LoginView.vue'
import DashboardView from '../views/admin/DashboardView.vue'
import ProfileView from '../views/admin/ProfileView.vue'
import ProjectsView from '../views/admin/ProjectsView.vue'
import CertificatesView from '../views/admin/CertificatesView.vue'
import SkillsView from '../views/admin/SkillsView.vue'
import ExperienceView from '../views/admin/ExperienceView.vue'
import EducationView from '../views/admin/EducationView.vue'
import MessagesView from '../views/admin/MessagesView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/projects/:slug',
    name: 'project-detail',
    component: ProjectDetailView,
  },
  {
    path: '/certificates/:id',
    name: 'certificate-detail',
    component: CertificateDetailView,
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: LoginView,
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: DashboardView,
      },
      {
        path: 'profile',
        name: 'admin-profile',
        component: ProfileView,
      },
      {
        path: 'projects',
        name: 'admin-projects',
        component: ProjectsView,
      },
      {
        path: 'certificates',
        name: 'admin-certificates',
        component: CertificatesView,
      },
      {
        path: 'skills',
        name: 'admin-skills',
        component: SkillsView,
      },
      {
        path: 'experience',
        name: 'admin-experience',
        component: ExperienceView,
      },
      {
        path: 'education',
        name: 'admin-education',
        component: EducationView,
      },
      {
        path: 'messages',
        name: 'admin-messages',
        component: MessagesView,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Navigasi internal yang membawa hash dari route lain (misal kembali dari detail ke /#projects)
    if (to.hash && from && from.name) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    // Saat reload/refresh atau navigasi langsung: selalu mulai dari paling atas (Hero)
    return { top: 0, left: 0 }
  },
})

// Navigation Guard untuk memproteksi rute admin
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  try {
    const { data } = await supabase.auth.getSession()
    const isAuthenticated = !!data?.session

    if (requiresAuth && !isAuthenticated) {
      next({ name: 'admin-login', query: { redirect: to.fullPath } })
    } else if (to.name === 'admin-login' && isAuthenticated) {
      next({ name: 'admin-dashboard' })
    } else {
      next()
    }
  } catch (err) {
    console.error('[RouterGuard] Gagal memeriksa sesi autentikasi:', err)
    if (requiresAuth) {
      next({ name: 'admin-login' })
    } else {
      next()
    }
  }
})

export default router
