const P = require('pino')
const QR = require('qrcode')
const app = require('express')()
const Baileys = require('@adiwajshing/baileys')

app.set('view engine', 'ejs')

let authFile = './session.json'
const { state, saveState } = Baileys.useSingleFileAuthState(authFile)

function connect(PORT) {
  const conn = Baileys.default({
    logger: P({ level: 'fatal' }),
    printQRInTerminal: true,
    auth: state
  })
  
  conn.ev.on('creds.update', saveState)
  
  let _qr
  conn.ev.on('connection.update', async (up) => {
    log('connection update', up)
    if (up.qr) _qr = await QR.toDataURL(up.qr)
    else if (up.connection === 'close') connect(~~(Math.random() * 1e4))
  })
  
  app.get('/', async (req, res) => {
    // log(_qr)
    res.render('index', { qrcode: _qr })
  })
  
  app.listen(PORT, () => log('App listened on port', PORT))
}

function log(...args) {
  return console.log('(', new Date().toLocaleTimeString('id', { timeZone: 'Asia/Jakarta' }), ')', ...args)
}

connect(process.env.PORT || ~~(Math.random() * 1e4))
