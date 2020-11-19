import { Response, Request } from 'express'
import User, { UserType } from '../models/User'
import generateToken from '../helpers/generateToken'
import bcrypt from 'bcrypt'

type ErrorMessage = {
  message: string;
}

async function createUser(req: Request, res: Response) {
  const { fullName, username, email, password, imageUrl } = req.body
  const existingEmail = await User.findOne({ email })
  const existingUsername = await User.findOne({ username })
  if (existingEmail) {
    return res.status(404).json({
      status: 'error',
      message: 'Email has already been registered!',
    })
  } else if (existingUsername) {
    return res.status(404).json({
      status: 'error',
      message: 'Username has already been registered!',
    })
  } else {
    const user = new User({
      fullName,
      username,
      email,
      password,
      imageUrl,
    })
    user.save()
    return res.json({
      status: 'success',
      message: 'Register Successfully!',
    })
  }
}

async function logInLocal(
  req: Request,
  res: Response,
  user: Partial<UserType>
) {
  const {
    _id,
    email,
    username,
    isAdmin,
    fullName,
    imageUrl,
    borrows,
    returns,
  } = user
  const token = await generateToken(_id)
  res.cookie('auth-token', token, { sameSite: 'none', secure: true })
  const authenticatedUser = {
    _id,
    isAdmin,
    fullName,
    imageUrl,
    username,
    email,
    borrows,
    returns,
  }
  return res.status(200).json({
    status: 'success',
    data: authenticatedUser,
    message: 'Login Successfully!',
    errors: '',
  })
}

async function logInGoogle(
  req: Request,
  res: Response,
  user: Partial<UserType>
): Promise<Partial<UserType>> {
  const { _id, email, isAdmin, fullName, borrows, returns, imageUrl } = user
  const token = await generateToken(_id)
  res.cookie('auth-token', token, { sameSite: 'none', secure: true })
  const authenticatedUser = {
    _id,
    email,
    isAdmin,
    fullName,
    borrows,
    returns,
    imageUrl,
  }
  return authenticatedUser
}

async function editUserById(
  req: Request,
  res: Response,
  user: Partial<UserType>
) {
  const existingEmail = await User.findOne({ email: req.body.email })
  const existingUsername = await User.findOne({ username: req.body.username })

  //check if updating email is already registered
  if (
    existingEmail &&
    JSON.stringify(existingEmail._id) !== JSON.stringify(user._id)
  ) {
    return res.status(404).json({
      status: 'error',
      message: 'This email is registered to another account!',
    })
  }
  //check if updating username is already registered
  else if (
    existingUsername &&
    JSON.stringify(existingUsername._id) !== JSON.stringify(user._id)
  ) {
    return res.status(404).json({
      status: 'error',
      message: 'This username is already taken!',
    })
  }
  //check if password is being updating
  else if (req.body.password) {
    return res.status(403).json({
      status: 'error',
      message: 'Permission denied!',
    })
  } else {
    //check if logged in user && user to be edited is similar
    const isAuthorized =
      JSON.stringify(user._id) === JSON.stringify(req.params.userId)
    const foundUser = await User.findOne({ _id: req.params.userId })
    if (isAuthorized && foundUser) {
      foundUser.username = req.body.username
      foundUser.email = req.body.email
      foundUser.fullName = req.body.fullName
      foundUser.imageUrl = req.body.imageUrl
      foundUser.save()
      return res.status(200).json({
        user: {
          _id: foundUser._id,
          isAdmin: foundUser.isAdmin,
          fullName: foundUser.fullName,
          imageUrl: foundUser.imageUrl,
          email: foundUser.email,
          username: foundUser.username,
          borrows: foundUser.borrows,
          returns: foundUser.returns,
        },
        status: 'success',
        message: 'Edit Successfully!',
      })
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Unexpected error! Action is not permitted',
      })
    }
  }
}

function getUserById(req: Request, res: Response, user: Partial<UserType>) {
  if (
    JSON.stringify(user._id) === JSON.stringify(req.params.userId) ||
    user.isAdmin
  ) {
    User.findOne({ _id: req.params.userId })
      .populate('borrows.book')
      .populate('returns.book')
      .exec()
      .then((foundUser) => {
        if (!foundUser) {
          res.status(404).json({
            status: 'error',
            message: 'Cannot find user',
          })
        } else {
          return res.status(200).json({
            user: {
              _id: foundUser._id,
              email: foundUser.email,
              username: foundUser.username,
              isAdmin: foundUser.isAdmin,
              fullName: foundUser.fullName,
              borrows: foundUser.borrows,
              returns: foundUser.returns,
              imageUrl: foundUser.imageUrl,
            },
            status: 'success',
            message: '',
          })
        }
      })
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Permission denied!',
    })
  }
}

function authenticateToken(
  req: Request,
  res: Response,
  user: Partial<UserType>
) {
  const {
    _id,
    email,
    isAdmin,
    fullName,
    borrows,
    returns,
    username,
    imageUrl,
  } = user
  const authenticatedUser = {
    _id,
    email,
    username,
    isAdmin,
    fullName,
    imageUrl,
    borrows,
    returns,
  }
  res.status(200).json(authenticatedUser)
}

export default {
  createUser,
  editUserById,
  logInLocal,
  logInGoogle,
  getUserById,
  authenticateToken,
}
