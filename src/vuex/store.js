import Vue from 'vue'
import Vuex from 'vuex'
import {Character, ChannelState, ChatMessage} from '../models'

Vue.use(Vuex)

const state = {
  account: '',
  loginData: {},
  loginStatusMessage: '',

  publicChannels: [],
  privateChannels: [],
  joinedChannels: [],
  selectedChannelIndex: 0,

  socket: null,
  serverVariables: {},

  character: '',
  onlineCharacters: new Map(),
  ignored: [],
  admins: [],

  currentOverlay: 'login'
}

const findChannel = (state, id) => state.joinedChannels.find(ch => ch.id === id)

const compareChannels = (a, b) => a.name.localeCompare(b.name)

const mutations = {
  SET_OVERLAY (state, overlay) {
    state.currentOverlay = overlay
  },

  LOGIN_REQUEST (state, account) {
    state.account = account
    state.loginStatusMessage = 'Hold on...'
  },

  LOGIN_SUCCESS (state, data) {
    state.loginData = data
    state.loginStatusMessage = 'Success!'
  },

  LOGIN_FAILURE (state, err) {
    state.loginStatusMessage = err
  },

  CHOOSE_CHARACTER (state, char) {
    state.character = char
  },

  CONNECT_REQUEST (state) {},

  SOCKET_ERROR (state, err) {
    state.loginStatusMessage = err
  },

  CHAT_IDENTIFY_REQUEST (state) {},

  CHAT_IDENTIFY_SUCCESS (state, socket) {
    state.socket = socket
  },

  SET_SERVER_VARIABLE (state, key, value) {
    state.serverVariables[key] = value
  },

  SET_IGNORE_LIST (state, ignoreList) {
    state.ignored = ignoreList
  },

  SET_ADMIN_LIST (state, adminList) {
    state.admins = adminList
  },

  HASH_CHARACTERS (state, characterInfoList) {
    for (let [name, gender, status, statusMessage] of characterInfoList) {
      state.onlineCharacters[name] = Character(name, gender, status, statusMessage)
    }
  },

  ADD_CHARACTER (state, name, gender) {
    state.onlineCharacters[name] = Character(name, gender)
  },

  REMOVE_CHARACTER (state, name) {
    delete state.onlineCharacters[name]
  },

  SET_CHARACTER_STATUS (state, name, status, statusMessage) {
    const char = state.onlineCharacters[name]
    if (char) {
      char.status = status
      char.statusMessage = statusMessage
    }
  },

  SET_PUBLIC_CHANNEL_LIST (state, channels) {
    state.publicChannels = channels.slice().sort(compareChannels)
  },

  SET_PRIVATE_CHANNEL_LIST (state, channels) {
    state.privateChannels = channels.slice().sort(compareChannels)
  },

  CHANNEL_JOIN_REQUEST (state, id, name = id) {
    state.joinedChannels.push(ChannelState(id, name))
    state.socket.joinChannel(id)
  },

  CHANNEL_INIT (state, id, namelist, mode) {
    const channel = findChannel(state, id)
    const characters = []

    for (let name of namelist) {
      const char = state.onlineCharacters[name]
      if (char) {
        characters.push(char)
      }
    }

    channel.mode = mode
    channel.characters = characters
  },

  CHANNEL_JOIN (state, id, name) {
    const channel = findChannel(state, id)
    const char = state.onlineCharacters[name]
    if (char) {
      channel.characters.push(char)
    }
  },

  CHANNEL_MESSAGE (state, id, charName, message) {
    const channel = findChannel(state, id)
    const char = state.onlineCharacters[charName]
    channel.messages.push(ChatMessage(char, message))
  },

  SEND_CHANNEL_MESSAGE (state, message) {
    const channel = state.joinedChannels[state.selectedChannelIndex]
    const msgModel = ChatMessage(state.onlineCharacters[state.character], message)
    state.socket.sendMessage(channel.id, message)
    channel.messages.push(msgModel)
  },

  CHANNEL_LEAVE_REQUEST (state, id) {
    const channel = findChannel(state, id)
    channel.status = 'leaving'
    state.socket.leaveChannel(id)
  },

  CHANNEL_LEAVE (state, id, char) {
    if (char === state.character) {
      state.joinedChannels = state.joinedChannels.filter(ch => ch.id !== id)
    } else {
      const channel = findChannel(state, id)
      channel.characters = channel.characters.filter(c => c.name !== char)
    }
  },

  SELECT_CHANNEL (state, id) {
    const index = state.joinedChannels.findIndex(ch => ch.id === id)
    state.selectedChannelIndex = index
  },

  SET_CHANNEL_DESCRIPTION (state, id, description) {
    const channel = findChannel(state, id)
    channel.description = description
  }
}

export default new Vuex.Store({ state, mutations })
