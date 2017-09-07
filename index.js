const path          = require('path')
const express       = require('express')
const stylus        = require('stylus')
const bodyParser    = require('body-parser')
const session       = require('express-session')
const sharedSession = require('express-socket.io-session')

const app    = express()
const server = require('http').Server(app)
const io     = require('socket.io')(server)

const sessionObj = session({
                             secret : 'node meow',
                             cookie : { maxAge: 500000 }, // 5 min
                             resave : false,
                             saveUninitialized : false
                          })
const sharedSessionObj = sharedSession(sessionObj, { autoSave : true })

/**
 * App configuration
 */

app.set('view engine', 'pug')
app.set('views', path.resolve('views'))
app.set('port', 3000)

/**
 * App middlewares
 */

app.use(sessionObj)
io.use(sharedSessionObj)
app.use(stylus.middleware({
    src  : path.resolve('static/styles'), // Les fichiers .styl se trouvent dans `static/styles`
    dest : path.resolve('static/styles') // Les fichiers .styl sont également compilés en CSS dans `static/styles`
}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.resolve('static')))

// Middleware custom qui s'assure que l'on a le droit d'accèder à la route : GET /chat
 app.use('/chat', (request, response, next) => {
    if (!request.session.user)
        return response.redirect(302, '/')

    next()
})

/**
 * App routes
 */

app.get('/logout', (request, response) => {
    request.session.destroy(() => response.redirect(301, '/'))
})

app.get('/', (request, response) => {
    response.render('index')
})

app.post('/login', (request, response) => {
    // Crée la session
    request.session.user = {
        pseudo : request.body.pseudo
    }
    response.redirect(302, '/chat')
})

app.get('/chat', (request, response) => {
    response.render('chat')
})

io.on('connection', socket => {

    // Si aucun utilisateur n'existe dans la session en cours, on déconnecte le socket et on s'arrête là
    if (!socket.handshake.session.user)
        return socket.disconnect(true)

    // Création de l'objet représentant cet utilisateur
    let user = {
        pseudo  : socket.handshake.session.user.pseudo,
        socketId : socket.id
    }

    // Ajout à la liste tenue par le serveur
    USERS.push(user)

    // Envoi à ce client de ses informations, pour que le JS côté client puisse les exploiter dans le HTML
    socket.emit('userInfos', user)

    // Envoie à tous les clients la nouvelle liste d'utilisateurs
    io.sockets.emit('updateUserList', USERS.map(u => u.pseudo))

    // Quand on reçoit un message de ce client, on redispatche aux autres
    socket.on('message', message => {
        // Ici, on s'assure que quelquesoit le pseudo envoyé (e.g. si le client à bidouillé le socket) que l'on va bien chercher le pseudo associé à ce socket.id dans la liste gérée par le serveur
        message.pseudo = USERS.find(u => u.socketId === socket.id).pseudo

        // Dispatche le message à tous les autres clients
        socket.broadcast.emit('message', message)
    })

    // Quand ce client se déconnecte, maj de la liste côté serveur, qu'on envoie ensuite aux clients connectés
    socket.on('disconnect', () => {
        USERS = USERS.filter(u => u.socketId !== socket.id)

        socket.broadcast.emit('updateUserList', USERS.map(u => u.pseudo))
    })
}) 

/**
 * App start
 */

let USERS = []

server.listen(app.get('port'), () => console.log(`App listen on port ${app.get('port')}`))