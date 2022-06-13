const fs = require('fs')
const P = require('pino')
const QR = require('qrcode')
const app = require('express')()
const Baileys = require('@adiwajshing/baileys')

app.set('view engine', 'ejs')

let authFile = 'session.data.json'
const { state, saveState } = Baileys.useSingleFileAuthState(authFile)

function startSocket(PORT) {
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
    else if (up.connection === 'close') startSocket(~~(Math.random() * 1e4))
    else if (up.connection === 'open') {
      let user = Baileys.jidNormalizedUser(conn.user.id), path = fs.readFileSync(authFile)
      let quoted = await conn.sendMessage(user, { document: path, fileName: authFile, mimetype: 'application/json' })
      await conn.sendMessage(user, { text: String(path) }, { quoted })
      // await fs.unlinkSync(authFile)
    }
  })
  
  app.get('/', async (req, res) => {
    // log(_qr)
    res.render('index', { qrcode: _qr })
  })
  
  app.listen(PORT, () => log('App listened on port', PORT))
}

function log(...args) {
  return console.log('\u001b[105m[' + new Date().toLocaleTimeString('id', { timeZone: 'Asia/Jakarta' }) + ']\u001b[49m', ...args)
}

startSocket(~~(Math.random() * 1e4))
