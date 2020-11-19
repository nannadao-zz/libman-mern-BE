import express from 'express'
import passport from 'passport'

require('../middlewares/authentication')

import {
  createUser,
  editUserById,
  logInLocal,
  logOutUser,
  getUserById,
  authenticateToken,
} from '../controllers/user'
import isAuthenticated from '../middlewares/isAuthenticated'
import isAdmin from '../middlewares/isAdmin'
const router = express.Router()

//Path prefix: /api/v1/users

router.post('/register', createUser)

router.post('/login', (req, res, next) => {
  passport.authenticate(
    'local-login',
    { session: false },
    (err, user, info) => {
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Username or Password is incorrect!',
        })
      } else if (err) {
        return res.status(404).json({
          status: 'error',
          message: 'Internal error. Please try again!',
        })
      } else if (info) {
        return res.status(401).json({
          status: 'error',
          message: info.message,
        })
      } else if (user) {
        logInLocal(req, res, user)
      }
    }
  )(req, res, next)
})

router.get('/logout', logOutUser)

router.get('/authenticate', isAuthenticated)

router.get('/:userId', isAuthenticated, getUserById)

router.put('/:userId/edit', isAuthenticated, editUserById)

export default router
