import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Public routes
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false, layout: 'blank' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false, layout: 'blank' },
  },
  {
    path: '/careers',
    name: 'CareersPortal',
    component: () => import('@/views/public/CareersPortal.vue'),
    meta: { requiresAuth: false, layout: 'blank' },
  },

  // Super Admin routes
  {
    path: '/super-admin',
    component: () => import('@/layouts/SuperAdminLayout.vue'),
    meta: { requiresAuth: true, requiresSuperAdmin: true },
    children: [
      {
        path: '',
        redirect: '/super-admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'SuperAdminDashboard',
        component: () => import('@/views/super-admin/Dashboard.vue'),
      },
      {
        path: 'companies',
        name: 'Companies',
        component: () => import('@/views/super-admin/Companies.vue'),
      },
      {
        path: 'plans',
        name: 'Plans',
        component: () => import('@/views/super-admin/Plans.vue'),
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/views/admin/Employees.vue'),
      },
      {
        path: 'employees/:id',
        name: 'EmployeeDetail',
        component: () => import('@/views/admin/EmployeeDetail.vue'),
      },
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('@/views/admin/Departments.vue'),
      },
      {
        path: 'positions',
        name: 'Positions',
        component: () => import('@/views/admin/Positions.vue'),
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/admin/Users.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/admin/Settings.vue'),
      },
      {
        path: 'payroll',
        name: 'Payroll',
        component: () => import('@/views/admin/Payroll.vue'),
      },
      {
        path: 'recruitment',
        name: 'Recruitment',
        component: () => import('@/views/admin/Recruitment.vue'),
      },
      {
        path: 'leaves',
        name: 'Leaves',
        component: () => import('@/views/admin/Leaves.vue'),
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/views/admin/Attendance.vue'),
      },
      {
        path: 'work-schedules',
        name: 'WorkSchedules',
        component: () => import('@/views/admin/WorkSchedules.vue'),
      },
    ],
  },

  // Employee routes
  {
    path: '/employee',
    component: () => import('@/layouts/EmployeeLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/employee/dashboard',
      },
      {
        path: 'dashboard',
        name: 'EmployeeDashboard',
        component: () => import('@/views/employee/Dashboard.vue'),
      },
      {
        path: 'profile',
        name: 'EmployeeProfile',
        component: () => import('@/views/employee/Profile.vue'),
      },
      {
        path: 'attendance',
        name: 'EmployeeAttendance',
        component: () => import('@/views/employee/Attendance.vue'),
      },
      {
        path: 'leaves',
        name: 'EmployeeLeaves',
        component: () => import('@/views/employee/Leaves.vue'),
      },
      // ✅ NOVAS ROTAS ADICIONADAS AQUI
      {
        path: 'documents',
        name: 'EmployeeDocuments',
        component: () => import('@/views/employee/Documents.vue'),
      },
      {
        path: 'requests',
        name: 'EmployeeRequests',
        component: () => import('@/views/employee/Requests.vue'),
      },
      {
        path: 'announcements',
        name: 'EmployeeAnnouncements',
        component: () => import('@/views/employee/Announcements.vue'),
      },
      {
        path: 'financial',
        name: 'EmployeeFinancial',
        component: () => import('@/views/employee/Financial.vue'),
      },
      {
        path: 'settings',
        name: 'EmployeeSettings',
        component: () => import('@/views/employee/Settings.vue'),
      },
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { layout: 'blank' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // If we have a token but no user, and not already loading, fetch user
  if (authStore.isAuthenticated && !authStore.user && !authStore.isLoading) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      return next('/login')
    }
  }

  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Redirect authenticated users away from auth pages
  if (!to.meta.requiresAuth && authStore.isAuthenticated) {
    if (authStore.isSuperAdmin && to.path.startsWith('/login')) {
      return next('/super-admin/dashboard')
    } else if (authStore.isAdmin && to.path.startsWith('/login')) {
      return next('/admin/dashboard')
    } else if (to.path.startsWith('/login')) {
      return next('/employee/dashboard')
    }
  }

  // Check super admin
  if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    return next('/admin/dashboard')
  }

  // Check admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/employee/dashboard')
  }

  // Check feature access
  if (to.meta.requiresFeature) {
    if (!authStore.hasFeature(to.meta.requiresFeature)) {
      return next('/admin/dashboard')
    }
  }

  next()
})

export default router