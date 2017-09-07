const path       = require('path')
const express    = require('express')
const stylus     = require('stylus')
const bodyParser = require('body-parser')
const session    = require('express-session')

const app    = express()
const server = require('http').Server(app)
const io     = require('socket.io')(server);

/**
 * App configuration
 */

app.set('view engine', 'pug')
app.set('views', path.resolve('views'))
app.set('port', 3000)

/**
 * App middlewares
 */

app.use(session({
    secret           : 'node meow',
    cookie           : { maxAge: 60000 },
    resave           : false,
    saveUninitialized: false
}))
app.use(stylus.middleware({
    src  : path.resolve('static/styles'), // Les fichiers .styl se trouvent dans `static/styles`
    dest : path.resolve('static/styles') // Les fichiers .styl sont également compilés en CSS dans `static/styles`
}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.resolve('static')))

// Security middleware for route "/chat"
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
    // Create session
    request.session.user = {
        name : request.body.pseudo
    }

    response.redirect(302, '/chat');
})

app.get('/chat', (request, response) => {
    response.render('chat', {
        user: request.session.user
    })
})

io.on('connection', (socket) => {
    console.info('Un client a ouvert un socket sur notre chat !', socket.id);
}) 

/**
 * App start
 */

server.listen(app.get('port'), () => console.log(`App listen on port ${app.get('port')}`))