import { Request, Response, NextFunction } from 'express'

import UserService from '../services/user'
import { NotFoundError, BadRequestError } from '../helpers/apiError'
import { UserType } from '../models/User'

// POST /users - create an user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await UserService.createUser(req, res)
  } catch (error) {
    next(new NotFoundError('Unexpected Error', error))
  }
}

//POST /users/login - login
export const logInLocal = async (
  req: Request,
  res: Response,
  user: Partial<UserType>
) => {
  try {
    await UserService.logInLocal(req, res, user)
  } catch (error) {
    throw new BadRequestError('Unauthorized Request!')
  }
}

//GET /auth/google/callback - logInGoogle
export const logInGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user
    if (user) {
      res.json(await UserService.logInGoogle(req, res, user))
    }
  } catch (error) {
    next(new NotFoundError('Unexpected Error', error))
  }
}

//GET /users/logout - logout
export const logOutUser = (req: Request, res: Response) => {
  try {
    req.logOut()
    res.clearCookie('auth-token')
    return res.json({
      status: 'success',
      message: 'Logout Successfully!',
      user: '',
    })
  } catch (error) {
    return res.json({
      status: 'error',
      message: error,
    })
  }
}

// PUT /:userId - edit user
export const editUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user
    if (user) {
      await UserService.editUserById(req, res, user)
    }
  } catch (error) {
    throw next(new NotFoundError('Unexpected Error', error))
  }
}

//GET /:userId - get user page
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (user) {
      await UserService.getUserById(req, res, user)
    }
  } catch (error) {
    throw new BadRequestError('Unauthorized Request!')
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ message: 'Unauthorized request' })
    } else {
      await UserService.authenticateToken(req, res, user)
    }
  } catch (error) {
    next(new NotFoundError('Unexpected Error', error))
  }
}
