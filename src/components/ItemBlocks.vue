<script setup>
import { computed, ref } from 'vue'
import { DOWNLOADS } from '../data/guides.js'

const props = defineProps({
  items: { type: Array, required: true },
  stepId: { type: String, required: true },
  checks: { type: Object, required: true },
  fields: { type: Object, required: true }
})
const emit = defineEmits(['toggle'])

const byId = computed(() => Object.fromEntries(DOWNLOADS.map((d) => [d.id, d])))
const copiedIdx = ref(-1)

function toggle(i) { emit('toggle', i) }
function isChecked(i) { return !!props.checks[i] }
function copied(text, i) {
  navigator.clipboard?.writeText(text)
  copiedIdx.value = i
}
</script>

<template>
  <div class="items">
    <template v-for="(it, i) in items" :key="i">
      <!-- plain text -->
      <p v-if="it.t === 'text'" class="text">{{ it.v }}</p>

      <!-- warning -->
      <div v-else-if="it.t === 'warn'" class="warnbox">
        <span aria-hidden>⚠️</span><span>{{ it.v }}</span>
      </div>

      <!-- checklist item -->
      <label v-else-if="it.t === 'check'" class="checkline" :class="{ done: isChecked(i) }">
        <input type="checkbox" :checked="isChecked(i)" @change="toggle(i)" />
        <span>{{ it.v }}</span>
      </label>

      <!-- download link -->
      <div v-else-if="it.t === 'link'" class="linkline">
        <div class="linkmain">
          <a :href="byId[it.ref].url" target="_blank" rel="noopener">{{ byId[it.ref].name }} ↗</a>
          <div class="note">{{ byId[it.ref].what }}</div>
        </div>
        <label v-if="it.check" class="checkline mini" :class="{ done: isChecked(i) }">
          <input type="checkbox" :checked="isChecked(i)" @change="toggle(i)" />
          <span>done</span>
        </label>
      </div>

      <!-- command -->
      <div v-else-if="it.t === 'cmd'" class="cmdline">
        <div class="codeblock">
          {{ it.v }}
          <button class="copy ghost" @click="copied(it.v, i)">{{ copiedIdx === i ? 'copied' : 'copy' }}</button>
        </div>
        <div v-if="it.hint" class="note">{{ it.hint }}</div>
      </div>

      <!-- input field -->
      <div v-else-if="it.t === 'field'" class="fieldline">
        <label :for="`${stepId}-${it.key}`">{{ it.label }}</label>
        <select
          v-if="it.type === 'select'"
          :id="`${stepId}-${it.key}`"
          v-model="fields[it.key]"
        >
          <option value="" disabled>choose…</option>
          <option v-for="o in it.options" :key="o" :value="o">{{ o }}</option>
        </select>
        <input
          v-else
          :id="`${stepId}-${it.key}`"
          type="text"
          v-model="fields[it.key]"
          :placeholder="it.placeholder || ''"
          autocomplete="off"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.items { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
.text { margin: 0; color: #cdd7e3; }
.note { color: var(--muted); font-size: 13px; margin-top: 5px; }

.warnbox {
  display: flex; gap: 10px; align-items: flex-start;
  background: rgba(210, 153, 34, .09);
  border: 1px solid #9e6a03; border-left-width: 4px;
  padding: 10px 12px; border-radius: 10px; color: #f2cc60; font-size: 14px;
}

.checkline {
  display: flex; gap: 11px; align-items: center;
  background: var(--panel); border: 1px solid var(--border);
  padding: 11px 13px; border-radius: 10px; cursor: pointer; transition: .15s;
}
.checkline:hover { border-color: #3d4b5f; }
.checkline.done { border-color: #238636; background: rgba(63, 185, 80, .07); }
.checkline.done span { color: var(--accent); }
.checkline input { width: 17px; height: 17px; accent-color: var(--accent); cursor: pointer; }
.checkline.mini { padding: 6px 10px; font-size: 13px; flex: none; }

.linkline {
  display: flex; gap: 12px; align-items: center; justify-content: space-between;
  background: var(--panel); border: 1px solid var(--border);
  padding: 11px 13px; border-radius: 10px;
}
.linkmain a { font-weight: 600; }
.linkmain .note { margin-top: 3px; }

.cmdline .note { margin-top: 6px; }

.fieldline { display: flex; flex-direction: column; gap: 6px; }
.fieldline label { font-size: 13px; color: var(--muted); }
.fieldline input, .fieldline select {
  background: var(--bg-soft); color: var(--text);
  border: 1px solid var(--border); border-radius: 9px;
  padding: 10px 12px; font: inherit; outline: none;
}
.fieldline input:focus, .fieldline select:focus { border-color: var(--accent-2); }

@media (max-width: 940px) {
  .items { gap: 11px; margin-top: 13px; }
  .text { font-size: 14.7px; }
  .note { font-size: 13px; }
  .warnbox { font-size: 13.7px; padding: 11px 12px; }
  .checkline { padding: 13px; gap: 12px; min-height: 48px; font-size: 14.7px; }
  .checkline input { width: 20px; height: 20px; }
  .checkline.mini { padding: 9px 12px; min-height: 42px; justify-content: center; }
  .linkline { flex-direction: column; align-items: stretch; gap: 9px; }
  .linkline .linkmain a { font-size: 15px; }
  .fieldline input, .fieldline select {
    font-size: 16px; padding: 12px; border-radius: 11px;
  }
  .cmdline .codeblock { font-size: 12.5px; padding: 12px 72px 12px 12px; }
}
</style>
