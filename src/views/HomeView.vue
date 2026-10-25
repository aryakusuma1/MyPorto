<script setup>
import AppNavbar from '../components/layout/AppNavbar.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import AboutSection from '../components/sections/AboutSection.vue'
import JourneySection from '../components/sections/JourneySection.vue'
import ProjectsSection from '../components/sections/ProjectsSection.vue'
import CertificatesSection from '../components/sections/CertificatesSection.vue'
import ContactSection from '../components/sections/ContactSection.vue'
</script>

<template>
  <div class="min-h-screen bg-surface text-ink flex flex-col">
    <!-- Sticky Navigation Bar -->
    <AppNavbar />

    <!-- Main Content One-Page Sections -->
    <main class="flex-1">
      <HeroSection />
      <AboutSection />
      <JourneySection />
      <ProjectsSection />
      <CertificatesSection />
      <ContactSection />
    </main>
  </div>
</template>
