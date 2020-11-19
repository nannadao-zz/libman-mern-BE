import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { BadRequestError } from '../helpers/apiError'
import { JWT_SECRET } from '../util/secrets'
import User from '../models/User'

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['auth-token']
  if (!token) {
    res.status(401).send({
      status: 'error',
      message: 'No valid token. Please log in!',
    })
  }
  if (token) {
    jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors, decoded: any) => {
      if (err) {
        return res.json({
          status: 'error',
          message: err.name,
        })
      } else if (decoded) {
        User.findById({ _id: decoded.sub })
          .exec()
          .then((user) => {
            if (user) {
              const authenticatedUser = {
                _id: user._id,
                isAdmin: user.isAdmin,
                fullName: user.fullName,
                imageUrl: user.imageUrl,
                username: user.username,
                email: user.email,
                borrows: user.borrows,
                returns: user.returns,
              }
              req.user = authenticatedUser
              next()
            }
          })
      }
    })
  }
}

export default isAuthenticated
