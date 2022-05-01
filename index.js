const P = require('pino')
const Baileys = require('@adiwajshing/baileys')

let authFile = './session.data.json'
const { state, saveState } = Baileys.useSingleFileAuthState(authFile)

async function connect() {
  const conn = Baileys.default({
    // browser: Baileys.Browsers.baileys('Opera'),
    logger: P({ level: 'fatal' }),
    printQRInTerminal: true,
    auth: state
  })
  
  conn.ev.on('connection.update', (update) => {
    console.log('connection update', update)
    if (update.connection === 'close') connect()
  })
  
  conn.ev.on('creds.update', saveState)
  
  conn.ev.on('messages.upsert', (m) => console.log(m))
  
  process.on('uncaughtException', console.error)
}

connect()

