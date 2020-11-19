import { Request, Response, NextFunction } from 'express'

import BookService from '../services/book'
import { BadRequestError, NotFoundError } from '../helpers/apiError'

//POST /books - createBook
export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return await BookService.createBook(req, res)
  } catch (error) {
    next(new BadRequestError('Unexpected request', error))
  }
}

//DELETE /:bookId - deleteBookById
export const deleteBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.bookId
    await BookService.deleteBookById(res, bookId)
  } catch (error) {
    return res.status(404).json({ message: error })
  }
}

//GET /:bookId - getBookById
export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.bookId
    await BookService.getBookById(bookId, res)
  } catch (error) {
    next(new NotFoundError('Unexpected request', error))
  }
}

//PUT /:bookId - editBookById
export const editBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.bookId
    const changes = req.body
    await BookService.editBookById(bookId, changes, res)
  } catch (error) {
    return res.status(404).json({ message: error })
  }
}

//PUT /:bookId/borrow - borrowBook
export const borrowBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user
    if (user) {
      await BookService.borrowBook(req, res, user)
    }
  } catch (error) {
    throw new NotFoundError('Unexpected request', error)
  }
}

//PUT /:bookId/return - returnBook
export const returnBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user
    if (user) {
      await BookService.returnBook(req, res, user)
    }
  } catch (error) {
    throw new NotFoundError('Unexpected request', error)
  }
}

//GET /books - getAll
export const getAllBySearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryCondition = req.query
    console.log(queryCondition)
    res.json(await BookService.getAllBySearch(queryCondition))
  } catch (error) {
    next(new NotFoundError('Cannot find any book', error))
  }
}

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await BookService.getAll())
  } catch (error) {
    next(new NotFoundError('Cannot find any book', error))
  }
}
