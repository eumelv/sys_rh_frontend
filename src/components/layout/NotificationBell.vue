<template>
    <div class="notification-bell-container" v-click-outside="closeDropdown">
        <button class="bell-button" @click="toggleDropdown" :class="{ 'has-unread': unreadCount > 0 }">
            <i class="pi pi-bell text-xl"></i>
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>

        <transition name="dropdown-fade">
            <div v-if="isOpen" class="notification-dropdown">
                <div class="dropdown-header">
                    <h3>Notificações</h3>
                    <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-all-btn">
                        Marcar todas como lidas
                    </button>
                </div>

                <div class="notifications-list" v-if="notifications.length > 0">
                    <div v-for="notif in notifications" :key="notif.id" class="notification-item"
                        :class="{ 'unread': !notif.read_at }" @click="handleNotificationClick(notif)">
                        <div class="notif-icon" :class="notif.data.type || 'info'">
                            <i :class="getIcon(notif.data.type)"></i>
                        </div>
                        <div class="notif-content">
                            <h4 class="notif-title">{{ notif.data.title }}</h4>
                            <p class="notif-message">{{ notif.data.message }}</p>
                            <span class="notif-time">{{ formatTime(notif.created_at) }}</span>
                        </div>
                        <div v-if="!notif.read_at" class="unread-indicator"></div>
                    </div>
                </div>

                <div v-else class="empty-state">
                    <i class="pi pi-bell-slash"></i>
                    <p>Nenhuma notificação</p>
                </div>

                <div class="dropdown-footer">
                    <button @click="viewAll" class="view-all-btn">Ver todas</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pt'

dayjs.extend(relativeTime)
dayjs.locale('pt')

const router = useRouter()
const isOpen = ref(false)
const unreadCount = ref(0)
const notifications = ref([])
let pollingInterval = null

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        fetchNotifications()
    }
}

const closeDropdown = () => {
    isOpen.value = false
}

const fetchUnreadCount = async () => {
    try {
        const { data } = await api.get('/notifications/unread-count')
        unreadCount.value = data.count || 0
    } catch (error) {
        unreadCount.value = 0
    }
}

const fetchNotifications = async () => {
    try {
        const { data } = await api.get('/notifications')
        notifications.value = data.data || []
    } catch (error) {
        console.error('Error fetching notifications')
    }
}

const markAsRead = async (id) => {
    try {
        await api.post(`/notifications/${id}/mark-as-read`)
        fetchUnreadCount()
    } catch (error) {
        console.error('Error marking as read')
    }
}

const markAllAsRead = async () => {
    try {
        await api.post('/notifications/mark-all-as-read')
        unreadCount.value = 0
        notifications.value.forEach(n => n.read_at = new Date())
    } catch (error) {
        console.error('Error marking all as read')
    }
}

const handleNotificationClick = (notif) => {
    if (!notif.read_at) {
        markAsRead(notif.id)
    }
    
    if (notif.data.action_url) {
        router.push(notif.data.action_url)
    }
    isOpen.value = false
}

const getIcon = (type) => {
    const icons = {
        'success': 'pi pi-check-circle',
        'warning': 'pi pi-exclamation-triangle',
        'danger': 'pi pi-exclamation-circle',
        'info': 'pi pi-info-circle'
    }
    return icons[type] || icons.info
}

const formatTime = (time) => {
    return dayjs(time).fromNow()
}

const viewAll = () => {
    router.push('/admin/notifications') // TODO: Create this view if needed
    isOpen.value = false
}

// Click outside directive
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event)
            }
        }
        document.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
    }
}

onMounted(() => {
    fetchUnreadCount()
    // Poll every 1 minute
    pollingInterval = setInterval(fetchUnreadCount, 60000)
})

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<style scoped>
.notification-bell-container {
    position: relative;
    display: inline-block;
}

.bell-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    color: #64748b;
    position: relative;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bell-button:hover {
    background-color: #f1f5f9;
    color: #3b82f6;
}

.badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
}

.notification-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 12px;
    width: 360px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    z-index: 1000;
    overflow: hidden;
}

.dropdown-header {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dropdown-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
}

.mark-all-btn {
    font-size: 12px;
    color: #3b82f6;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 600;
}

.notifications-list {
    max-height: 400px;
    overflow-y: auto;
}

.notification-item {
    padding: 12px 16px;
    display: flex;
    gap: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
    border-bottom: 1px solid #f8fafc;
}

.notification-item:hover {
    background-color: #f8fafc;
}

.notification-item.unread {
    background-color: #f0f7ff;
}

.notif-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.notif-icon.success { background-color: #dcfce7; color: #16a34a; }
.notif-icon.warning { background-color: #fef3c7; color: #d97706; }
.notif-icon.danger { background-color: #fee2e2; color: #dc2626; }
.notif-icon.info { background-color: #e0f2fe; color: #0284c7; }

.notif-content {
    flex: 1;
}

.notif-title {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
}

.notif-message {
    margin: 0 0 4px 0;
    font-size: 13px;
    color: #64748b;
    line-height: 1.4;
}

.notif-time {
    font-size: 11px;
    color: #94a3b8;
}

.unread-indicator {
    position: absolute;
    right: 16px;
    top: 16px;
    width: 8px;
    height: 8px;
    background-color: #3b82f6;
    border-radius: 50%;
}

.empty-state {
    padding: 40px 20px;
    text-align: center;
    color: #94a3b8;
}

.empty-state i {
    font-size: 32px;
    margin-bottom: 12px;
}

.dropdown-footer {
    padding: 12px;
    text-align: center;
    background-color: #f8fafc;
    border-top: 1px solid #f1f5f9;
}

.view-all-btn {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    background: none;
    border: none;
    cursor: pointer;
}

.view-all-btn:hover {
    color: #3b82f6;
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
