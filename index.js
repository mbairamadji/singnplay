const express        = require('express')
const mongoose       = require('mongoose')
const ejs            = require('ejs')
const session        = require('express-session')
const passport       = require('passport')
const LocalStrategy  = require('passport-local')
const methodOverride = require('method-override')
const User           = require('./models/user')
const morgan         = require('morgan')
const routes         = require('./routes')
const dotenv         = require('dotenv')
dotenv.config()

const app = express()

//Connexion à la base de donnée
mongoose.connect(process.env.MLAB_URI);

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(morgan('dev'))
app.use(methodOverride('_method'))

//Configuration de Passport
app.use(session({
    secret : 'dynamizzy',
    resave : false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
passport.use(new LocalStrategy(User.authenticate()))

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

app.use('/', routes)


app.listen(3000, () => {
    console.log("App tourne sur le port 3000")
})