import {Store} from 'vuex'

export function pushOverlay (store: Store, overlay: string) {
  store.dispatch('PushOverlay', overlay)
}

export function popOverlay (store: Store) {
  store.dispatch('PopOverlay')
}

export function setOverlay (store: Store, overlay: string) {
  popOverlay(store)
  pushOverlay(store, overlay)
}