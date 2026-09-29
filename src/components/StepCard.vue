<script setup>
import { computed } from 'vue'
import ItemBlocks from './ItemBlocks.vue'

const props = defineProps({
  step: { type: Object, required: true },
  stepNo: { type: Number, required: true },
  total: { type: Number, required: true },
  checks: { type: Object, required: true },
  fields: { type: Object, required: true },
  verify: { type: String, default: '' }
})
const emit = defineEmits(['toggle', 'verify'])

const checkIdx = computed(() =>
  props.step.items.map((it, i) => (it.t === 'check' ? i : -1)).filter((i) => i >= 0)
)

const allChecked = computed(() => checkIdx.value.every((i) => props.checks[i]))

const isDone = computed(() => {
  const needVerify = !!props.step.verify
  return allChecked.value && (!needVerify || props.verify === 'ok')
})

const chosen = computed(() => {
  if (!props.step.verify || !props.verify || props.verify === 'ok') return null
  return props.step.verify.options.find((o) => o.help && props.verify === `bad:${o.label}`) || null
})
</script>

<template>
  <article class="card">
    <header class="head">
      <div>
        <div class="eyebrow">Step {{ stepNo }} / {{ total }}</div>
        <h2>{{ step.title }}</h2>
      </div>
      <span class="chip" :class="{ ok: isDone }">{{ isDone ? '✓ completed' : 'in progress' }}</span>
    </header>

    <p v-if="step.lead" class="lead">{{ step.lead }}</p>

    <ItemBlocks
      :items="step.items"
      :step-id="step.id"
      :checks="checks"
      :fields="fields"
      @toggle="emit('toggle', $event)"
    />

    <div v-if="step.verify" class="verify">
      <div class="vq">{{ step.verify.q }}</div>
      <div class="opts">
        <button
          v-for="o in step.verify.options"
          :key="o.label"
          :class="{ primary: o.ok, ghost: !o.ok }"
          @click="emit('verify', o.ok ? 'ok' : `bad:${o.label}`)"
        >
          {{ o.label }}
        </button>
      </div>
      <div v-if="chosen" class="help">
        <strong>Not yet — </strong>{{ chosen.help }}
      </div>
      <div v-else-if="verify === 'ok'" class="good">Checkpoint passed ✓</div>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px 24px;
}
.head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.eyebrow { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
h2 { margin: 4px 0 0; font-size: 21px; line-height: 1.3; }
.lead { color: #b9c4d2; margin: 12px 0 0; }

.verify {
  margin-top: 20px; padding-top: 18px; border-top: 1px dashed var(--border);
}
.vq { font-weight: 600; margin-bottom: 10px; }
.opts { display: flex; flex-wrap: wrap; gap: 10px; }
.help {
  margin-top: 12px; background: rgba(210, 153, 34, .1);
  border: 1px solid #9e6a03; border-radius: 10px; padding: 11px 13px;
  color: #f2cc60; font-size: 14px;
}
.good { margin-top: 12px; color: var(--accent); font-weight: 600; }
</style>
