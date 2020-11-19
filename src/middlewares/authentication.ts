import passport from 'passport'
import { Request } from 'express'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy } from 'passport-jwt'
import { JWT_SECRET, GOOGLE_CLIENT_ID } from '../util/secrets'
const GoogleTokenStrategy = require('passport-google-id-token')

import User, { UserType } from '../models/User'

const cookieExtractor = (req: Request) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies['auth-token']
  }
  return token
}

export const jwtMethod = passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      const foundUser = await User.findById({ _id: payload.sub })
      if (!foundUser) {
        return done(null, false)
      } else if (payload.exp > Date.now()) {
        return done(null, false, {
          message: 'Expired',
          expiredAt: payload.exp,
        })
      } else {
        return done(null, foundUser, {
          message: `Authenticated user: ${foundUser.fullName}`,
        })
      }
    }
  )
)

export const localMethod = passport.use(
  'local-login',
  new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username })
    if (!user) {
      done(null, false)
    }
    //IF USERNAME CAN BE FOUND
    const isMatching = await user?.comparePassword(password)
    if (isMatching === false) {
      done(null, false)
    } else if (isMatching === true) {
      done(null, user)
    }
  })
)

type GoogleTokenStrategy = {
  payload: {
    given_name: string;
    family_name: string;
    email: string;
    picture: string;
  };
}

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
    },
    async (
      parsedToken: GoogleTokenStrategy,
      googleId: string,
      done: Function
    ) => {
      const { payload } = parsedToken
      const { given_name, family_name, email, picture } = payload
      let isAdmin = false
      const domain = email.substring(email.lastIndexOf('@') + 1)
      if (domain === 'integrify.io') {
        isAdmin = true
      }
      const newUser = {
        googleId: googleId,
        isAdmin: isAdmin,
        fullName: `${given_name} ${family_name}`,
        email: email,
        imageUrl: picture,
      }
      try {
        let user = await User.findOne({ email: newUser.email })
        if (!user) {
          user = await User.create<Partial<UserType>>(newUser)
        }
        done(null, user)
      } catch (error) {
        done(null, error)
      }
    }
  )
)
