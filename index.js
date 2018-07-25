const express        = require('express')
const mongoose       = require('mongoose')
const ejs            = require('ejs')
const cors           = require('cors')
const flash          = require('connect-flash')
const cookieParser   = require('cookie-parser')
const session        = require('express-session')
const passport       = require('passport')
const LocalStrategy  = require('passport-local')
const methodOverride = require('method-override')
const User           = require('./models/user')
const morgan         = require('morgan')
const annonceRoute   = require("./routes/annonceRoute")
const authRoute      = require("./routes/authRoute")
const commentRoute   = require("./routes/commentRoute")
const dotenv         = require('dotenv')

dotenv.config()


const app = express()

mongoose.Promise = global.Promise
//Connexion à la base de donnée
mongoose.connect(process.env.MLAB_URI);

//Configuration de socket.io
const http = require("http").Server(app)
const io = require("socket.io")(http)
io.on('connection', (socket) => {
  console.log('a user is connected')
})

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended : true}))
app.use(morgan('dev'))
app.use(methodOverride('_method'))

app.use(cookieParser())
app.use(session({
    cookie: {
      maxAge : 3600000
    },
    secret : 'dynamizzy',
    resave : false,
    saveUninitialized : false
}))
app.use(flash())

//Configuration de Passport
app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')(passport)

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success_message = req.flash("success_message");
    res.locals.error_message   = req.flash("error_message");
    res.locals.error           = req.flash("error");
    next();
})

// Routes
app.use('/annonces', annonceRoute)
app.use(authRoute)
app.use(commentRoute)



app.listen(process.env.PORT ||3000, () => {
    console.log("App tourne sur le port 3000")
})