<template>
  <main class="flex-column">
    <section class="scroll-v" style="height: 5rem; padding: 0.3rem 0.6rem">
      <character-status v-bind="character"></character-status>
    </section>
    <section class="flex-grow bg-color-darken-1 scroll-v" v-auto-scroll>
      <message v-for="(message, i) in messages" v-bind="message" :key="i"></message>
    </section>
    <section class="bg-color-main flex-row" style="height: 5rem; padding: 0.3rem;">
      <chatbox class="flex-grow" @submit="sendMessage"></chatbox>
    </section>
  </main>
</template>

<script>
import { parseBBC } from '@/bbc'
import store from '@/store'
import CharacterStatus from '@/components/chat/character/CharacterStatus.vue'
import Message from '@/components/chat/Message.vue'
import Chatbox from '@/components/chat/Chatbox.vue'

export default {
  components: {
    CharacterStatus,
    Message,
    Chatbox,
  },
  props: {
    partner: String,
    messages: Array,
  },
  methods: {
    parseBBC,
    sendMessage(message) {
      store.chat.sendPrivateMessage(this.partner, message)
    },
  },
  computed: {
    character() {
      return store.chat.characters.getCharacter(this.partner)
      // return this.$store.getters.getCharacter(this.partner)
    },
  },
}
</script>
