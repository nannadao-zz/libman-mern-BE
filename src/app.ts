import express from 'express'
import cors from 'cors'
import compression from 'compression'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import lusca from 'lusca'
/* import mongo from 'connect-mongo' */
/* import flash from 'express-flash' */
/* import path from 'path' */
import mongoose from 'mongoose'
import passport from 'passport'
import bluebird from 'bluebird'

import { MONGODB_URI, SESSION_SECRET } from './util/secrets'

import bookRouter from './routers/book'
import authRouter from './routers/auth'
import userRouter from './routers/user'
import User from './models/User'

import apiErrorHandler from './middlewares/apiErrorHandler'

const app = express()
app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:3600',
      'https://silly-torvalds-9f7def.netlify.app',
    ],
  })
)
const mongoUrl = MONGODB_URI

mongoose.Promise = bluebird
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch((err: Error) => {
    console.log(
      'MongoDB connection error. Please make sure MongoDB is running. ' + err
    )
    process.exit(1)
  })

// Express configuration
app.set('port', process.env.PORT || 8080)

// Use common 3rd-party middlewares
app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))

//Passport config
type PassportUser = {
  id: string | null;
  username?: string;
}

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
)

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user: PassportUser, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  const foundUser = await User.findById(id)
  if (!foundUser) {
    console.log('Problem in deserializing user id')
  }
  done(null, foundUser)
})

// Use book router
app.use('/api/v1/books', bookRouter)
app.use('/auth', authRouter)
app.use('/api/v1/users', userRouter)

// Custom API error handler
app.use(apiErrorHandler)

export default app
