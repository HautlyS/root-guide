<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { DEVICES, DOWNLOADS, GUIDES, variantOf } from './data/guides.js'
import StepCard from './components/StepCard.vue'

const STORAGE = 'root-wizard-v1'

const defaultState = () => ({
  deviceId: 'j4',
  pos: { p: 0, s: 0 },
  checks: {},
  fields: {},
  verify: {},
  showTrouble: false
})

let initial = defaultState()
try {
  const raw = localStorage.getItem(STORAGE)
  if (raw) initial = { ...initial, ...JSON.parse(raw) }
} catch (_) { /* ignore corrupt state */ }

const state = reactive(initial)
watch(state, (v) => localStorage.setItem(STORAGE, JSON.stringify(v)), { deep: true })

const device = computed(() => DEVICES.find((d) => d.id === state.deviceId) || DEVICES[0])
const rawGuide = computed(() => GUIDES[state.deviceId])

// 'any' = no model picked yet → both instruction sets are shown until one is chosen
const variant = computed(() => variantOf(state.fields.model))
const spec = computed(() => {
  const s = device.value.specs?.[variant.value]
  return s || { soc: device.value.soc, os: device.value.os, rootTool: device.value.rootTool }
})
const visible = (o) => !o.when || variant.value === 'any' || o.when === variant.value

const guide = computed(() => {
  const g = rawGuide.value
  if (!g) return g
  return {
    ...g,
    phases: g.phases
      .map((ph) => ({ ...ph, steps: ph.steps.filter(visible) }))
      .filter((ph) => ph.steps.length)
  }
})

const flat = computed(() => {
  const out = []
  guide.value?.phases.forEach((ph, pi) =>
    ph.steps.forEach((st, si) => out.push({ phase: ph, step: st, pi, si }))
  )
  return out
})

const idxOf = computed(() => {
  const i = flat.value.findIndex((f) => f.pi === state.pos.p && f.si === state.pos.s)
  return i < 0 ? 0 : i
})
const current = computed(() => flat.value[idxOf.value] || flat.value[0])

// Picking a model drops the other phone's steps out of the sidebar.
// Remember where we were so the wizard does not bounce back to step 1.
const nav = { idx: 0, id: null }
watch(
  () => [state.pos.p, state.pos.s],
  () => {
    const f = flat.value
    const i = f.findIndex((x) => x.pi === state.pos.p && x.si === state.pos.s)
    if (i >= 0) {
      nav.idx = i
      nav.id = f[i].step.id
    }
  },
  { immediate: true }
)
watch(
  () => state.fields.model,
  () => {
    const f = flat.value
    if (!f.length) return
    let i = f.findIndex((x) => x.step.id === nav.id)
    if (i < 0) i = Math.min(nav.idx, f.length - 1)
    const n = f[Math.max(0, i)] || f[0]
    state.pos = { p: n.pi, s: n.si }
  }
)

function checksFor(stepId) {
  if (!state.checks[stepId]) state.checks[stepId] = {}
  return state.checks[stepId]
}
function toggle(step, i) {
  const c = checksFor(step.id)
  c[i] = !c[i]
}
function stepDone(entry) {
  const st = entry.step
  const c = state.checks[st.id] || {}
  const all = st.items
    .map((it, i) => (it.t === 'check' ? i : -1))
    .filter((i) => i >= 0)
    .every((i) => c[i])
  return all && (!st.verify || state.verify[st.id] === 'ok')
}
function setVerify(step, val) {
  state.verify[step.id] = val
}

const doneCount = computed(() => flat.value.filter(stepDone).length)
const totalCount = computed(() => flat.value.length || 1)
const progress = computed(() => Math.round((doneCount.value / totalCount.value) * 100))

const skipHint = ref(false)
const navOpen = ref(false)
const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 940px)').matches

function next() {
  if (!stepDone(current.value) && !skipHint.value) {
    skipHint.value = true
    return
  }
  skipHint.value = false
  if (idxOf.value < flat.value.length - 1) {
    const n = flat.value[idxOf.value + 1]
    state.pos = { p: n.pi, s: n.si }
    scrollTop()
  }
}
function back() {
  skipHint.value = false
  if (idxOf.value > 0) {
    const n = flat.value[idxOf.value - 1]
    state.pos = { p: n.pi, s: n.si }
    scrollTop()
  }
}
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function jump(ph, si) {
  skipHint.value = false
  state.pos = { p: ph, s: si }
  if (isMobile()) navOpen.value = false
  scrollTop()
}
function jumpToPhase(pi) {
  if (pi !== state.pos.p) jump(pi, 0)
}

// swipe horizontally on the card to move through the guide
const swipe = { x: 0, y: 0, el: null }
function onTouchStart(e) {
  const t = e.touches[0]
  swipe.x = t.clientX
  swipe.y = t.clientY
  swipe.el = e.target
}
function onTouchEnd(e) {
  if (state.showTrouble || !swipe.el) return
  const t = e.changedTouches[0]
  const dx = t.clientX - swipe.x
  const dy = t.clientY - swipe.y
  if (Math.abs(dx) < 80 || Math.abs(dy) > 50) return
  // don't hijack a swipe that starts on something horizontally scrollable
  let n = swipe.el
  while (n && n !== e.currentTarget) {
    if (n.scrollWidth > n.clientWidth + 4) return
    n = n.parentElement
  }
  swipe.el = null
  if (dx < 0) next()
  else back()
}
function reset() {
  if (!confirm('Wipe all progress and inputs?')) return
  localStorage.removeItem(STORAGE)
  Object.assign(state, defaultState())
}
function onDevice(id) {
  state.deviceId = id
  state.pos = { p: 0, s: 0 }
  state.showTrouble = false
}

const phaseStatus = (pi) => {
  const ph = guide.value.phases[pi]
  const d = ph.steps.filter((st) => stepDone({ step: st })).length
  return { d, t: ph.steps.length }
}
const fwLink = computed(() => {
  const m = state.fields.model
  if (m) return `https://samfw.com/firmware/${m}`
  return variant.value === 'j4core'
    ? 'https://samfw.com/firmware/SM-J410G'
    : 'https://samfw.com/firmware/SM-J400F'
})
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="logo">root</span><span class="logo accent">wizard</span>
      </div>

      <nav class="devices" aria-label="Device">
        <button
          v-for="d in DEVICES"
          :key="d.id"
          class="dev"
          :class="{ active: d.id === state.deviceId, planned: d.status === 'planned' }"
          @click="onDevice(d.id)"
        >
          {{ d.name }}
          <span v-if="d.status === 'planned'" class="tag">soon</span>
        </button>
      </nav>

      <div class="topright">
        <div class="progress" :title="`${doneCount}/${totalCount} steps`">
          <div class="bar"><i :style="{ width: progress + '%' }" /></div>
          <span>{{ progress }}%</span>
        </div>
        <div
          class="ring"
          :style="{ '--p': progress }"
          role="img"
          :aria-label="`${progress}% done, ${doneCount} of ${totalCount} steps`"
        >
          <span>{{ progress }}</span>
        </div>
        <button class="ghost" @click="state.showTrouble = true">
          <span class="btext">Troubleshoot</span><span class="bshort">Help</span>
        </button>
        <button class="ghost" @click="reset">
          <span class="btext">Reset</span><span class="bshort">↺</span>
        </button>
      </div>
    </header>

    <!-- device without a guide yet -->
    <main v-if="!guide" class="coming">
      <div class="card">
        <h2>{{ device.name }} — guide coming soon</h2>
        <p class="muted">The J4 guide is complete. This device is already profiled:</p>
        <ul class="spec">
          <li><b>SoC</b> {{ device.soc }}</li>
          <li><b>OS</b> {{ device.os }}</li>
          <li><b>Root tool</b> {{ device.rootTool }}</li>
          <li><b>Models</b> {{ device.models.join(', ') }}</li>
        </ul>
        <button class="primary" @click="onDevice('j4')">Back to the Galaxy J4 guide</button>
      </div>
    </main>

    <main v-else class="layout">
      <!-- sidebar -->
      <aside class="side">
        <button
          class="sidetoggle"
          :aria-expanded="navOpen ? 'true' : 'false'"
          aria-controls="steps-panel"
          @click="navOpen = !navOpen"
        >
          <span class="sticon" aria-hidden="true"><i /><i /><i /></span>
          <span class="stlabel">Steps</span>
          <span class="stcount">{{ doneCount }}/{{ totalCount }} · {{ progress }}%</span>
          <span class="scaret" :class="{ up: navOpen }" aria-hidden="true">▾</span>
        </button>

        <div id="steps-panel" class="sidepanel" :class="{ open: navOpen }">
          <div class="specbox">
            <div class="specname">{{ device.name }}</div>
            <div class="specline">{{ spec.soc }}</div>
            <div class="specline">{{ spec.os }}</div>
            <div class="specline tool">{{ spec.rootTool }}</div>
            <div class="models">
              <span
                v-for="m in device.models"
                :key="m"
                class="chip"
                :class="{ on: m === state.fields.model }"
              >{{ m }}</span>
            </div>
            <div v-if="variant === 'any'" class="pickhint">
              Pick your model in step 3 — the steps below switch for SM‑J410G (J4 Core).
            </div>
            <div v-else-if="variant === 'j4core'" class="pickhint">
              Galaxy J4 Core path: boot image → BL slot.
            </div>
            <div v-else class="pickhint">
              Galaxy J4 (2018) path: patched AP → AP slot.
            </div>
          </div>

          <div v-for="(ph, pi) in guide.phases" :key="ph.id" class="phase">
            <div class="phasehead">
              <span>{{ ph.icon }} {{ ph.title }}</span>
              <span class="cnt">{{ phaseStatus(pi).d }}/{{ phaseStatus(pi).t }}</span>
            </div>
            <ol class="steps">
              <li
                v-for="(st, si) in ph.steps"
                :key="st.id"
                :class="{
                  current: state.pos.p === pi && state.pos.s === si,
                  done: stepDone({ step: st })
                }"
              >
                <button @click="jump(pi, si)">
                  <i class="dot" />
                  <span>{{ st.title }}</span>
                  <em v-if="st.when" class="wtag">{{ st.when === 'j4core' ? 'J410' : 'J400' }}</em>
                </button>
              </li>
            </ol>
          </div>

          <div class="sidefoot">
            <b>{{ doneCount }} / {{ totalCount }}</b> steps done
          </div>
        </div>
      </aside>

      <!-- content -->
      <section
        class="content"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <!-- mobile: jump straight to a phase -->
        <nav class="phasenav" aria-label="Phase">
          <button
            v-for="(ph, pi) in guide.phases"
            :key="ph.id"
            :class="{ active: pi === current.pi, done: phaseStatus(pi).d === phaseStatus(pi).t }"
            @click="jumpToPhase(pi)"
          >
            <span aria-hidden="true">{{ ph.icon }}</span>
            {{ ph.title }}
            <span class="pc">{{ phaseStatus(pi).d }}/{{ phaseStatus(pi).t }}</span>
          </button>
        </nav>

        <Transition name="step" mode="out-in">
          <StepCard
            :key="current.step.id"
            :step="current.step"
            :step-no="idxOf + 1"
            :total="flat.length"
            :checks="checksFor(current.step.id)"
            :fields="state.fields"
            :verify="state.verify[current.step.id] || ''"
            @toggle="toggle(current.step, $event)"
            @verify="setVerify(current.step, $event)"
          />
        </Transition>

        <div class="fw" v-if="current.step.items.some((i) => i.key === 'model')">
          <span class="muted">Firmware link for your model:</span>
          <a :href="fwLink" target="_blank" rel="noopener">{{ fwLink }} ↗</a>
        </div>

        <div v-if="skipHint" class="skipnote">
          This step is not marked complete yet — press <b>Next</b> again to skip it anyway.
        </div>

        <footer class="nav">
          <button class="ghost navbtn" :disabled="idxOf === 0" @click="back">← Back</button>
          <div class="navtitle">
            <span class="navphase">{{ current.phase.title }}</span>
            <span class="navpos">{{ idxOf + 1 }}/{{ flat.length }}</span>
          </div>
          <button class="primary navbtn" :disabled="idxOf === flat.length - 1" @click="next">
            {{ stepDone(current) ? 'Next →' : 'Continue →' }}
          </button>
        </footer>
      </section>
    </main>

    <!-- troubleshooting drawer -->
    <Transition name="sheet">
      <div v-if="state.showTrouble" class="drawer" @click.self="state.showTrouble = false">
        <div class="drawerbody">
          <div class="drawerhead">
            <h2>Troubleshooting</h2>
            <button class="ghost" @click="state.showTrouble = false">Close</button>
          </div>
          <div v-for="t in guide?.troubleshoot || []" :key="t.id" class="trouble">
            <h3>{{ t.title }}</h3>
            <p>{{ t.body }}</p>
          </div>
          <div class="trouble">
            <h3>All download links</h3>
            <ul class="allinks">
              <li v-for="d in DOWNLOADS" :key="d.id">
                <a :href="d.url" target="_blank" rel="noopener">{{ d.name }} ↗</a>
                <div class="muted">{{ d.what }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.shell { min-height: 100%; display: flex; flex-direction: column; }

.topbar {
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  padding: 14px 22px; border-bottom: 1px solid var(--border);
  background: rgba(13, 17, 23, .8); backdrop-filter: blur(8px);
  position: sticky; top: 0; z-index: 5;
}
.brand { font-weight: 800; font-size: 18px; letter-spacing: -.02em; }
.logo.accent { color: var(--accent); }
.devices { display: flex; gap: 8px; flex-wrap: wrap; }
.dev {
  padding: 7px 13px; font-size: 13.5px; border-radius: 999px;
  background: transparent;
}
.dev.active { border-color: var(--accent-2); background: rgba(88, 166, 255, .12); }
.dev.planned { opacity: .6; }
.tag { font-size: 10.5px; color: var(--warn); margin-left: 5px; text-transform: uppercase; }
.topright { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.progress { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--muted); }
.bar { width: 130px; height: 7px; background: var(--panel-2); border-radius: 99px; overflow: hidden; }
.bar i { display: block; height: 100%; background: linear-gradient(90deg, #238636, var(--accent)); transition: width .4s cubic-bezier(.2,.8,.2,1); }
.bshort { display: none; }

/* circular progress — shown on small screens instead of the bar */
.ring {
  display: none; position: relative; width: 38px; height: 38px; flex: none;
  border-radius: 50%;
  background: conic-gradient(var(--accent) calc(var(--p) * 1%), var(--panel-2) 0);
}
.ring::after { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: var(--bg); }
.ring span {
  position: absolute; inset: 0; z-index: 1; display: grid; place-items: center;
  font-size: 10.5px; font-weight: 700; color: var(--text);
}

/* ---- collapsible step list (small screens) ---- */
.sidetoggle { display: none; }
.sidepanel { display: flex; flex-direction: column; gap: 16px; }

.layout { display: grid; grid-template-columns: 310px minmax(0, 1fr); gap: 24px; padding: 24px; align-items: start; }
@media (max-width: 940px) { .layout { grid-template-columns: 1fr; } }

.side { position: sticky; top: 78px; display: flex; flex-direction: column; gap: 16px; }
@media (max-width: 940px) { .side { position: static; } }
.specbox { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 15px; }
.specname { font-weight: 700; font-size: 16px; }
.specline { color: var(--muted); font-size: 12.7px; margin-top: 3px; }
.specline.tool { color: var(--accent); }
.models { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
.pickhint {
  margin-top: 10px; padding-top: 9px; border-top: 1px dashed var(--border);
  font-size: 12.5px; color: var(--accent);
}

.phase { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.phasehead {
  display: flex; justify-content: space-between; padding: 10px 13px;
  font-size: 13px; font-weight: 600; background: var(--panel-2);
  color: #cdd7e3;
}
.cnt { color: var(--muted); font-weight: 500; }
.steps { list-style: none; margin: 0; padding: 6px; }
.steps li button {
  width: 100%; display: flex; gap: 9px; align-items: flex-start;
  background: transparent; border: none; padding: 8px 9px; border-radius: 8px;
  font-size: 13.3px; text-align: left; color: #b9c4d2;
}
.steps li button:hover { background: var(--panel-2); }
.steps li.current button { background: rgba(88, 166, 255, .14); color: var(--text); }
.steps li.done button { color: var(--accent); }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); flex: none; margin-top: 6px; }
.steps li.done .dot { background: var(--accent); }
.steps li.current .dot { background: var(--accent-2); box-shadow: 0 0 0 3px rgba(88,166,255,.25); animation: dotpulse 2.6s ease-in-out infinite; }
@keyframes dotpulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(88, 166, 255, .25); }
  50% { box-shadow: 0 0 0 6px rgba(88, 166, 255, .08); }
}
.sidefoot { font-size: 13px; color: var(--muted); padding: 0 4px; }

.content { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.fw { font-size: 13.5px; display: flex; gap: 8px; flex-wrap: wrap; padding: 0 4px; }
.skipnote {
  background: rgba(210,153,34,.1); border: 1px solid #9e6a03;
  color: #f2cc60; padding: 10px 13px; border-radius: 10px; font-size: 14px;
}
.nav { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.navtitle {
  display: flex; flex-direction: column; align-items: center; line-height: 1.25;
  color: var(--muted); font-size: 13px; min-width: 0; text-align: center;
}
.navphase { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 42vw; }
.navpos { font-size: 11.5px; opacity: .75; letter-spacing: .04em; }
.navbtn { min-height: 42px; }

/* phase chips above the card (small screens) */
.phasenav { display: none; }

/* step change animation */
.step-enter-active { transition: opacity .22s ease, transform .22s cubic-bezier(.2,.8,.2,1); }
.step-leave-active { transition: opacity .12s ease; }
.step-enter-from { opacity: 0; transform: translateY(12px); }
.step-leave-to { opacity: 0; }

/* troubleshooting sheet */
.sheet-enter-active, .sheet-leave-active { transition: opacity .2s ease; }
.sheet-enter-active .drawerbody, .sheet-leave-active .drawerbody {
  transition: transform .26s cubic-bezier(.2,.8,.2,1);
}
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .drawerbody, .sheet-leave-to .drawerbody { transform: translateX(24px); }

.coming { padding: 60px 24px; display: grid; place-items: center; }
.card {
  background: var(--panel); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 28px; max-width: 560px;
}
.card h2 { margin-top: 0; }
.muted { color: var(--muted); }
.spec { list-style: none; padding: 0; margin: 14px 0 20px; display: grid; gap: 7px; font-size: 14px; }
.spec b { color: var(--muted); font-weight: 600; display: inline-block; width: 92px; }

.drawer { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 20; display: flex; justify-content: flex-end; }
.drawerbody {
  width: min(560px, 100%); background: var(--bg-soft); height: 100%;
  overflow-y: auto; padding: 22px; border-left: 1px solid var(--border);
}
.drawerhead { display: flex; justify-content: space-between; align-items: center; }
.drawerhead h2 { margin: 0; }
.trouble { margin-top: 18px; background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 15px; }
.trouble h3 { margin: 0 0 7px; font-size: 15px; }
.trouble p { margin: 0; color: #c3ccda; font-size: 14px; }
.allinks { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; font-size: 14px; }
.allinks .muted { font-size: 12.7px; margin-top: 2px; }

/* ---------------- small screens ---------------- */
@media (max-width: 940px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 13px;
    padding: 13px 12px calc(98px + env(safe-area-inset-bottom));
  }

  /* compact top bar */
  .topbar { padding: 8px 11px calc(8px + env(safe-area-inset-top)); gap: 9px; flex-wrap: nowrap; }
  .brand { font-size: 15.5px; }
  .devices {
    flex: 1 1 auto; min-width: 0; flex-wrap: nowrap;
    overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
  }
  .devices::-webkit-scrollbar { display: none; }
  .dev { padding: 7px 11px; font-size: 12.5px; white-space: nowrap; }
  .topright { gap: 7px; }
  .topright button { padding: 8px 11px; min-height: 38px; }
  .progress { display: none; }
  .ring { display: block; }
  .btext { display: none; }
  .bshort { display: inline; }

  /* collapsible steps panel */
  .side { position: static; gap: 11px; }
  .sidetoggle {
    display: flex; align-items: center; gap: 10px; width: 100%; min-height: 46px;
    padding: 10px 13px; background: var(--panel);
    border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px;
  }
  .sticon { display: flex; flex-direction: column; gap: 3px; width: 15px; flex: none; }
  .sticon i { display: block; height: 2px; border-radius: 2px; background: var(--muted); }
  .stlabel { font-weight: 600; }
  .stcount { margin-left: auto; color: var(--muted); font-size: 12.5px; }
  .scaret { color: var(--muted); transition: transform .2s ease; }
  .scaret.up { transform: rotate(180deg); }
  .sidepanel { display: none; }
  .sidepanel.open { display: flex; }
  .specbox { padding: 13px; }
  .steps li button { padding: 10px 9px; font-size: 14px; }

  /* phase chips above the card */
  .phasenav {
    display: flex; gap: 7px; overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; margin: 0 -12px; padding: 0 12px 2px;
  }
  .phasenav::-webkit-scrollbar { display: none; }
  .phasenav button {
    flex: none; display: flex; align-items: center; gap: 6px; white-space: nowrap;
    min-height: 38px; padding: 8px 12px; font-size: 12.5px;
    border-radius: 999px; background: var(--panel); color: #b9c4d2;
  }
  .phasenav button.active { border-color: var(--accent-2); background: rgba(88, 166, 255, .13); color: var(--text); }
  .phasenav button.done { color: var(--accent); }
  .phasenav .pc { color: var(--muted); font-size: 11px; }

  /* thumb-reachable action bar */
  .nav {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 15;
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
    gap: 10px; border-top: 1px solid var(--border);
    background: rgba(13, 17, 23, .94); backdrop-filter: blur(12px);
  }
  .navbtn { flex: 1; min-height: 47px; font-size: 15px; }
  .navtitle { flex: none; max-width: 34vw; }

  /* full-screen troubleshooting sheet */
  .drawerbody {
    width: 100%; border-left: none; overscroll-behavior: contain;
    padding: 0 14px calc(26px + env(safe-area-inset-bottom));
  }
  .drawerhead {
    position: sticky; top: 0; z-index: 2; margin: 0 -14px;
    padding: calc(14px + env(safe-area-inset-top)) 14px 12px; gap: 12px;
    background: var(--bg-soft); border-bottom: 1px solid var(--border);
  }
  .drawerhead h2 { font-size: 18px; }
  .trouble { margin-top: 14px; }

  .coming { padding: 34px 14px; }
  .card { padding: 20px 16px; }
  .spec b { width: 78px; }
}

@media (max-width: 400px) {
  .brand { font-size: 14px; }
  .ring { width: 34px; height: 34px; }
  .navtitle { max-width: 30vw; }
}
</style>
