const path       = require('path')
const express    = require('express')
const stylus     = require('stylus')
const bodyParser = require('body-parser')

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

app.use(stylus.middleware({
    src  : path.resolve('static/styles'), // Les fichiers .styl se trouvent dans `static/styles`
    dest : path.resolve('static/styles') // Les fichiers .styl sont également compilés en CSS dans `static/styles`
}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.resolve('static')))

/**
 * App routes
 */

app.get('/', (request, response) => {
    response.render('index')
})

app.post('/chat', (request, response) => {
    response.render('chat', {
        user: {
            name: request.body.pseudo
        }
    })
})

io.on('connection', (socket) => {
    console.info('Un client a ouvert un socket sur notre chat !', socket.id);
})

/**
 * App start
 */

server.listen(app.get('port'), () => console.log(`App listen on port ${app.get('port')}`))