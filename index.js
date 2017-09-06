const path    = require('path')
const express = require('express')
const stylus  = require('stylus')

const app     = express()

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
app.use(express.static(path.resolve('static')))

/**
 * App routes
 */

app.get('/', (request, response) => {
    response.render('master', {pageName:'home'})
})

/**
 * App start
 */

app.listen(app.get('port'), () => console.log(`App listen on port ${app.get('port')}`))