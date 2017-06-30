import { observable } from 'mobx'
import meta from '../../../package.json'

const serverURL = 'wss://chat.f-list.net:9799'

export default class ChatStore {
  socket = new WebSocket(serverURL)

  @observable identity = ''

  onDisconnect = () => {}

  init(account: string, ticket: string, identity: string) {
    this.identity = identity

    this.socket.onopen = () => {
      this.sendCommand('IDN', {
        account,
        ticket,
        character: identity,
        cname: meta.name,
        cversion: meta.version,
        method: 'ticket',
      })
    }

    this.socket.onmessage = msg => {
      const data = msg.data as string
      const cmd = data.slice(0, 3)
      const params = data.length > 3 ? JSON.parse(data.slice(4)) : {}
      this.handleSocketCommand(cmd, params)
    }

    this.socket.onclose = this.socket.onerror = () => this.onDisconnect()
  }

  disconnect() {
    this.socket.close()
  }

  sendCommand(cmd: string, params?: object) {
    if (params) {
      this.socket.send(cmd + ' ' + JSON.stringify(params))
    } else {
      this.socket.send(cmd)
    }
  }

  handleSocketCommand(cmd: string, params: any) {
    const handlers: { [cmd: string]: (this: ChatStore) => any } = {
      IDN() {},
      HLO() {},
      CON() {},
      VAR() {},
      PIN() {
        this.sendCommand('PIN')
      },
    }

    if (handlers[cmd]) {
      handlers[cmd].call(this)
    } else {
      console.log(cmd, params)
    }
  }
}
