import express from 'express'
import passport from 'passport'

import { logInGoogle } from '../controllers/user'

require('../middlewares/authentication')

const router = express.Router()

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback', passport.authenticate('google'))

router.post(
  '/google-authenticate',
  passport.authenticate('google-id-token'),
  logInGoogle
)

export default router
