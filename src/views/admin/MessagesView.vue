<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Mail,
  MailOpen,
  Search,
  CheckCircle,
  X,
  ExternalLink,
  Clock,
  Send,
  User,
  Copy,
  Check,
} from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'

const messages = ref([])
const loading = ref(false)
const selectedMessage = ref(null)
const isModalOpen = ref(false)
const searchQuery = ref('')
const activeTab = ref('all') // 'all', 'unread', 'read'
const statusMessage = ref('')

async function fetchMessages() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    messages.value = data || []
  } catch (err) {
    console.error('[MessagesView] Error fetching messages:', err)
  } finally {
    loading.value = false
  }
}

const unreadCount = computed(() => messages.value.filter((m) => !m.is_read).length)

const filteredMessages = computed(() => {
  return messages.value.filter((msg) => {
    // Tab filter
    if (activeTab.value === 'unread' && msg.is_read) return false
    if (activeTab.value === 'read' && !msg.is_read) return false

    // Search filter
    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.toLowerCase()
    return (
      msg.name.toLowerCase().includes(q) ||
      msg.email.toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q)
    )
  })
})

async function viewMessage(msg) {
  selectedMessage.value = msg
  isModalOpen.value = true

  // Jika belum dibaca, otomatis tandai sudah dibaca
  if (!msg.is_read) {
    await markAsRead(msg, true)
  }
}

async function markAsRead(msg, isRead) {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: isRead })
      .eq('id', msg.id)

    if (error) throw error

    msg.is_read = isRead
    if (selectedMessage.value && selectedMessage.value.id === msg.id) {
      selectedMessage.value.is_read = isRead
    }
  } catch (err) {
    console.error('Gagal memperbarui status pesan:', err)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const isEmailCopied = ref(false)

function copyEmail(email) {
  if (!email || !navigator.clipboard) return
  navigator.clipboard.writeText(email).then(() => {
    isEmailCopied.value = true
    setTimeout(() => {
      isEmailCopied.value = false
    }, 2500)
  }).catch(() => {})
}

function handleReplyEmail(msg) {
  if (!msg) return
  const subject = encodeURIComponent(`Re: Kontak Portofolio Arya - ${msg.name}`)
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)

  if (isMobile) {
    window.location.href = `mailto:${msg.email}?subject=${subject}`
  } else {
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=${subject}`,
      '_blank',
      'noopener,noreferrer'
    )
  }
}

onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold font-heading text-ink">Pesan Masuk</h1>
        <p class="text-ink-muted text-sm mt-1">
          Daftar pesan dan formulir kontak yang dikirim oleh pengunjung portfolio.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <BaseBadge v-if="unreadCount > 0" variant="accent" size="md">
          {{ unreadCount }} Pesan Baru
        </BaseBadge>
        <BaseBadge v-else variant="neutral" size="md">
          Semua Telah Dibaca
        </BaseBadge>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div class="flex items-center gap-2 border-b border-canvas-subtle/30 pb-2 md:border-b-0 md:pb-0">
        <button
          @click="activeTab = 'all'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="
            activeTab === 'all'
              ? 'bg-canvas-card text-accent border border-canvas-subtle/60 shadow-sm font-semibold'
              : 'text-ink-muted hover:text-ink'
          "
        >
          Semua ({{ messages.length }})
        </button>

        <button
          @click="activeTab = 'unread'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
          :class="
            activeTab === 'unread'
              ? 'bg-canvas-card text-accent border border-canvas-subtle/60 shadow-sm font-semibold'
              : 'text-ink-muted hover:text-ink'
          "
        >
          <span class="w-2 h-2 rounded-full bg-accent"></span>
          Belum Dibaca ({{ unreadCount }})
        </button>

        <button
          @click="activeTab = 'read'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="
            activeTab === 'read'
              ? 'bg-canvas-card text-accent border border-canvas-subtle/60 shadow-sm font-semibold'
              : 'text-ink-muted hover:text-ink'
          "
        >
          Sudah Dibaca ({{ messages.length - unreadCount }})
        </button>
      </div>

      <div class="relative min-w-[240px]">
        <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pengirim, email, isi..."
          class="w-full pl-9 pr-4 py-2 bg-canvas-card border border-canvas-subtle/40 rounded-xl text-sm text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 4"
        :key="i"
        class="h-20 rounded-2xl bg-canvas-card border border-canvas-subtle/20 animate-pulse"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredMessages.length === 0"
      class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-12 text-center"
    >
      <div class="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
        <Mail class="w-6 h-6" />
      </div>
      <h3 class="text-base font-semibold text-ink font-heading">Kotak Masuk Kosong</h3>
      <p class="text-ink-muted text-sm mt-1 max-w-sm mx-auto">
        {{ searchQuery ? 'Tidak ada pesan yang sesuai dengan filter pencarian.' : 'Belum ada pesan yang masuk melalui formulir kontak portfolio.' }}
      </p>
    </div>

    <!-- Message List -->
    <div v-else class="space-y-2.5">
      <div
        v-for="msg in filteredMessages"
        :key="msg.id"
        @click="viewMessage(msg)"
        class="bg-canvas-card border rounded-2xl p-4.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
        :class="
          !msg.is_read
            ? 'border-accent/40 bg-accent/[0.02] shadow-sm hover:border-accent'
            : 'border-canvas-subtle/30 hover:border-canvas-subtle/70'
        "
      >
        <div class="flex items-start gap-3.5 min-w-0">
          <!-- Unread indicator dot -->
          <div class="pt-1.5 shrink-0">
            <span
              v-if="!msg.is_read"
              class="block w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(255,107,0,0.6)]"
              title="Pesan baru"
            />
            <span v-else class="block w-2.5 h-2.5 rounded-full bg-canvas-subtle/60" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h4
                class="text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate"
                :class="{ 'font-bold': !msg.is_read }"
              >
                {{ msg.name }}
              </h4>
              <span class="text-xs text-ink-muted truncate">
                &lt;{{ msg.email }}&gt;
              </span>
            </div>

            <p class="text-xs text-ink-muted/90 mt-1 line-clamp-1">
              {{ msg.message }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-canvas-subtle/20">
          <span class="text-[11px] text-ink-muted font-mono flex items-center gap-1">
            <Clock class="w-3 h-3" />
            {{ formatDate(msg.created_at) }}
          </span>

          <BaseButton variant="ghost" size="sm" @click.stop="viewMessage(msg)">
            Lihat
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Detail Message Modal -->
    <div
      v-if="isModalOpen && selectedMessage"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm"
    >
      <div
        class="bg-canvas-card border border-canvas-subtle/40 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-canvas-subtle/30 bg-canvas/50">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-lg bg-accent/10 text-accent">
              <MailOpen class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-heading font-semibold text-ink">
                Detail Pesan Masuk
              </h3>
              <p class="text-[11px] text-ink-muted font-mono">
                {{ formatDate(selectedMessage.created_at) }}
              </p>
            </div>
          </div>

          <button
            @click="isModalOpen = false"
            class="p-2 text-ink-muted hover:text-ink hover:bg-canvas-subtle/20 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <!-- Sender Card -->
          <div class="p-4 bg-canvas border border-canvas-subtle/30 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <User class="w-4 h-4 text-accent" />
                <span class="text-xs text-ink-muted uppercase tracking-wider font-medium">Pengirim:</span>
                <span class="text-sm font-semibold text-ink">{{ selectedMessage.name }}</span>
              </div>

              <button
                @click="markAsRead(selectedMessage, !selectedMessage.is_read)"
                class="text-xs text-ink-muted hover:text-accent font-medium underline transition-colors"
              >
                {{ selectedMessage.is_read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca' }}
              </button>
            </div>

            <div class="flex items-center gap-2">
              <Mail class="w-4 h-4 text-accent" />
              <span class="text-xs text-ink-muted uppercase tracking-wider font-medium">Email:</span>
              <button
                type="button"
                @click="handleReplyEmail(selectedMessage)"
                class="text-sm text-accent hover:underline font-mono cursor-pointer flex items-center gap-1.5"
                title="Buka untuk membalas email"
              >
                <span>{{ selectedMessage.email }}</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Message Content -->
          <div>
            <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
              Isi Pesan
            </label>
            <div class="p-4 bg-canvas border border-canvas-subtle/30 rounded-xl text-ink text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {{ selectedMessage.message }}
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-canvas-subtle/30 bg-canvas/50">
          <BaseButton variant="ghost" @click="isModalOpen = false">
            Tutup
          </BaseButton>

          <div class="flex items-center gap-2.5">
            <BaseButton
              variant="secondary"
              size="md"
              @click="copyEmail(selectedMessage.email)"
              class="cursor-pointer"
            >
              <Check v-if="isEmailCopied" class="w-4 h-4 mr-1.5 text-green-400" />
              <Copy v-else class="w-4 h-4 mr-1.5" />
              <span>{{ isEmailCopied ? 'Email Tersalin!' : 'Salin Email' }}</span>
            </BaseButton>

            <BaseButton
              variant="primary"
              size="md"
              @click="handleReplyEmail(selectedMessage)"
              class="cursor-pointer shadow-lg hover:shadow-accent/25"
            >
              <Send class="w-4 h-4 mr-2" />
              Balas Pesan via Email
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>\n