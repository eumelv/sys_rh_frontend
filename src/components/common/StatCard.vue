<template>
    <div class="stat-card" :style="{ borderLeftColor: color }">
        <div class="stat-content">
            <div class="stat-label">{{ label }}</div>
            <div class="stat-value">{{ formattedValue }}</div>
        </div>
        <div class="stat-icon" :style="{ backgroundColor: hexToRGBA(color, 0.1), color: color }">
            <i :class="icon"></i>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    value: {
        type: [Number, String],
        required: true
    },
    icon: {
        type: String,
        default: 'pi pi-chart-bar'
    },
    color: {
        type: String,
        default: '#3b82f6'
    },
    format: {
        type: String,
        default: 'number' // 'number', 'currency', 'percentage'
    }
})

const formattedValue = computed(() => {
    if (props.format === 'currency') {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA'
        }).format(props.value / 100)
    }

    if (props.format === 'number' && typeof props.value === 'number') {
        return props.value.toLocaleString('pt-AO')
    }

    return props.value
})

const hexToRGBA = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style scoped>
.stat-card {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    border-left-width: 4px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}
</style>
