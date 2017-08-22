<template>
  <main class="flex-row fullscreen" @click="closeCharacterMenu" @contextmenu="activateCharacterMenu">
    <section class="bg-color-darken-2 scroll-v">
      <chat-action icon='forum' @click.native.prevent="openChannelList"></chat-action>
      <chat-action icon='account-multiple' @click.native.prevent="openCharacterBrowser"></chat-action>
    </section>

    <section class="bg-color-darken-1 flex-column scroll-v">
      <chat-tab v-for="(tab, index) in tabs" :key="index" :active="index === tabIndex" @activate="tabIndex = index">
        <chat-tab-content v-bind="tab"></chat-tab-content>
      </chat-tab>
    </section>

    <section class="bg-color-darken-0 flex-grow">
      <template v-if="currentTab">
        <channel-view v-if="currentTab.type === 'channel'" v-bind="currentTab.channel" class="fill-area"></channel-view>
        <private-chat-view v-if="currentTab.type === 'privateChat'" v-bind="currentTab.privateChat" class="fill-area"></private-chat-view>
      </template>
    </section>

    <component v-if="overlay" :is="overlay.component" v-on="overlay.events || {}" v-bind="overlay.props || {}" @close="closeOverlay"></component>

    <transition name="fade-in">
      <character-menu v-if="characterMenu" v-bind="characterMenu.props"></character-menu>
    </transition>
  </main>
</template>

<script>
import ChatAction from './ChatAction'
import ChatTab from './ChatTab'
import ChatTabContent from './ChatTabContent'
import ChannelView from './ChannelView'
import PrivateChatView from './PrivateChatView'
import ChannelList from './ChannelList'
import CharacterBrowser from './CharacterBrowser'
import CharacterMenu from './CharacterMenu'

export default {
  components: {
    ChatAction,
    ChannelList,
    ChatTab,
    ChatTabContent,
    ChannelView,
    PrivateChatView,
    CharacterMenu,
  },
  data() {
    return {
      overlay: null,
      tabIndex: 0,
      characterMenu: null,
    }
  },
  computed: {
    joinedChannels() {
      const { chat } = this.$store.state
      return Object.keys(chat.joinedChannels).map(id => chat.channels[id])
    },
    privateChats() {
      const { chat } = this.$store.state
      return Object.values(chat.privateChats)
    },
    tabs() {
      const channelTabs = this.joinedChannels.map(channel => {
        return { type: 'channel', channel }
      })

      const privateChatTabs = this.privateChats.map(privateChat => {
        return { type: 'privateChat', privateChat }
      })

      return channelTabs.concat(privateChatTabs)
    },
    currentTab() {
      return this.tabs[this.tabIndex]
    }
  },
  created() {
    this.createViews()
  },
  methods: {
    createViews() {
      this.channelListView = {
        component: ChannelList,
      }

      this.characterBrowserView = {
        component: CharacterBrowser
      }
    },

    openOverlay(overlay) {
      this.overlay = overlay
    },

    closeOverlay() {
      this.overlay = null
    },

    openChannelList() {
      this.openOverlay(this.channelListView)
      this.$store.dispatch('fetchChannelList')
    },

    openCharacterBrowser() {
      this.openOverlay(this.characterBrowserView)
    },

    closeCharacterMenu() {
      this.characterMenu = null
    },

    activateCharacterMenu(event) {
      this.characterMenu = null

      const characterElement = event.path.find(el => el.dataset && el.dataset.character != null)
      if (characterElement) {
        this.characterMenu = {
          character: characterElement.dataset.character,
          props: { x: event.clientX, y: event.clientY }
        }
        event.preventDefault()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.action-icon {
  font-size: 200%;
  margin: 0.5rem;
  display: block;
  opacity: 0.5;

  &:hover {
    opacity: 0.75;
  }
}
</style>