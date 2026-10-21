<script setup>
import { computed } from 'vue'
import { Mail, Github, Linkedin, ArrowUpRight } from 'lucide-vue-next'
import { useProfileStore } from '../../stores/profile.store'
import SectionTitle from '../ui/SectionTitle.vue'
import BaseCard from '../ui/BaseCard.vue'

const profileStore = useProfileStore()
const currentYear = new Date().getFullYear()

const contacts = computed(() => {
  const p = profileStore.profile
  return [
    {
      name: 'Email',
      value: p?.email || 'aryakusuma863@gmail.com',
      url: `mailto:${p?.email || 'aryakusuma863@gmail.com'}`,
      icon: Mail,
      desc: 'Kirimkan pesan langsung ke kotak masuk saya.',
      isExternal: false,
    },
    {
      name: 'GitHub',
      value: 'github.com/aryakusuma1',
      url: p?.github_url || 'https://github.com/aryakusuma1',
      icon: Github,
      desc: 'Lihat repositori kode dan kontribusi open source saya.',
      isExternal: true,
    },
    {
      name: 'LinkedIn',
      value: 'linkedin.com/in/aryakusuma',
      url: p?.linkedin_url || 'https://www.linkedin.com',
      icon: Linkedin,
      desc: 'Mari terhubung secara profesional dan perluas jejaring.',
      isExternal: true,
    },
  ]
})
</script>

<template>
  <footer id="contact" class="py-20 border-t border-border/60 bg-surface-alt/40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        tag="Kontak Langsung"
        title="Mari Terhubung & Berkolaborasi"
        subtitle="Saya selalu terbuka untuk mendiskusikan proyek baru, peluang karir, maupun diskusi teknis."
        align="center"
      />

      <!-- Contact Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
        <a
          v-for="item in contacts"
          :key="item.name"
          :href="item.url"
          :target="item.isExternal ? '_blank' : '_self'"
          :rel="item.isExternal ? 'noopener noreferrer' : ''"
          class="block group"
        >
          <BaseCard :hoverable="true" class="h-full flex flex-col justify-between">
            <div>
              <div class="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                <component :is="item.icon" class="w-5 h-5" />
              </div>
              <h3 class="font-heading font-semibold text-lg text-ink group-hover:text-accent transition-colors flex items-center justify-between">
                {{ item.name }}
                <ArrowUpRight class="w-4 h-4 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </h3>
              <p class="text-ink-muted text-xs sm:text-sm mt-1 leading-relaxed">
                {{ item.desc }}
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-border/50">
              <span class="text-xs font-mono text-accent truncate block">
                {{ item.value }}
              </span>
            </div>
          </BaseCard>
        </a>
      </div>

      <!-- Copyright Bar -->
      <div class="pt-8 border-t border-border/50 text-center">
        <p class="text-ink-muted text-xs sm:text-sm">
          &copy; {{ currentYear }} <span class="text-ink font-medium">Arya Kusuma</span>. Seluruh Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  </footer>
</template>
