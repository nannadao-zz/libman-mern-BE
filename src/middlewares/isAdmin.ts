import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { BadRequestError } from '../helpers/apiError'
import { JWT_SECRET } from '../util/secrets'
import { UserType } from '../models/User'

type Help = Express.User & {
  isAdmin: boolean;
}

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user: UserType = req.user as UserType
  if (user && user.isAdmin === false) {
    return res.status(401).send({
      status: 'error',
      message: 'Permission denied!',
    })
  } else if (user && user.isAdmin === true) {
    next()
  }
}

export default isAdmin
