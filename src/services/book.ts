import { Request, Response, NextFunction } from 'express'

import User, { UserType } from '../models/User'
import Book, { BookType } from '../models/Book'
import { BadRequestError, NotFoundError } from '../helpers/apiError'
import { error } from 'winston'

async function createBook(req: Request, res: Response) {
  const {
    isbn,
    title,
    authors,
    publisher,
    categories,
    quantity,
    publishYear,
    imageUrl,
    description,
  } = req.body
  const existingBook = await Book.findOne({ title: title }).exec()
  if (existingBook) {
    return res.status(400).json({
      status: 'error',
      message: 'This book has already been created!',
    })
  } else {
    const book = new Book({
      isbn,
      title,
      authors,
      publisher,
      publishYear,
      categories,
      quantity,
      imageUrl,
      description,
      status: 'available',
    })
    book.save((err) => {
      if (err) {
        return res.status(404).json({
          status: 'error',
          message: err.message,
        })
      }
      return res.status(200).json({
        status: 'success',
        message: 'Create Book Successfully!',
      })
    })
  }
}

function getBookById(
  bookId: string,
  res: Response
): Promise<BookType | Response> {
  return Book.findOne({ _id: bookId })
    .exec()
    .then((foundBook) => {
      if (!foundBook) {
        return res.status(404).json({
          message: 'Cannot find book',
        })
      }
      return res.status(200).json(foundBook)
    })
}

function editBookById(
  bookId: string,
  changes: Partial<BookType>,
  res: Response
) {
  Book.findByIdAndUpdate(
    bookId,
    changes,
    { runValidators: true },
    (err, foundBook) => {
      if (err) {
        res.status(404).json({
          status: 'error',
          message: err.message,
        })
      } else if (foundBook) {
        res.status(200).json({
          status: 'success',
          message: 'Edit Successfully!',
        })
      }
    }
  )
}

function deleteBookById(res: Response, bookId: string) {
  Book.findOneAndRemove({ _id: bookId }).exec((err, foundBook) => {
    if (!foundBook) {
      return res.status(404).json({
        status: 'error',
        message: 'Cannot find book',
      })
    } else if (err) {
      return res.status(404).json({
        status: 'error',
        message: 'Cannot delete book. Please try again!',
      })
    }
    return res.status(200).json({
      status: 'success',
      message: 'Delete Successfully!',
    })
  })
}

function borrowBook(req: Request, res: Response, user: Partial<UserType>) {
  User.findById({ _id: user._id }, (err, foundUser) => {
    if (err) {
      return res.status(404).json({
        status: 'error',
        message: 'Cannot find user',
      })
    } else if (foundUser) {
      const existingBorrow = foundUser.borrows.filter(
        (item) =>
          JSON.stringify(item.book) === JSON.stringify(req.params.bookId)
      )
      if (existingBorrow.length > 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Return book before borrowing again!',
        })
      } else if (existingBorrow.length === 0) {
        foundUser.borrows.push({
          book: req.params.bookId,
        })
        foundUser.returns.push({
          book: req.params.bookId,
        })
        foundUser.save()
      }
      Book.findById({ _id: req.params.bookId }, (err, foundBook) => {
        if (err) {
          return res.status(404).json({ message: 'Cannot find book' })
        } else if (foundBook) {
          const existingBorrower = foundBook.borrowers.filter(
            (item) => JSON.stringify(item) === JSON.stringify(user._id)
          )
          if (existingBorrower.length > 0) {
            return res.status(404).json({
              status: 'error',
              message: 'Return book before borrowing again!',
            })
          } else if (existingBorrower.length === 0) {
            foundBook.borrowers.push(user._id)
            foundBook.quantity -= 1
            foundBook.save()
            return res.json({
              status: 'success',
              message: 'Borrow Successfully!',
              user: foundUser,
              book: foundBook,
            })
          }
        }
      })
    }
  })
}

function returnBook(req: Request, res: Response, user: Partial<UserType>) {
  User.findById({ _id: user._id }, (err, foundUser) => {
    if (err) {
      return res.status(404).json({ message: 'Cannot find user' })
    } else if (foundUser) {
      const bookId = JSON.stringify(req.params.bookId)
      const index = foundUser.borrows
        .map((item) => JSON.stringify(item.book))
        .indexOf(bookId)
      if (index >= 0) {
        foundUser.borrows.splice(index, 1)
        const indexOfReturningBook = foundUser.returns
          .map((item) => JSON.stringify(item.book))
          .indexOf(bookId)
        //Date type is not Date.now()
        foundUser.returns[indexOfReturningBook].returnDate = new Date()
        foundUser.save()
      } else if (index < 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Book is not borrowed',
        })
      }
    }
    Book.findById({ _id: req.params.bookId }, (err, foundBook) => {
      if (err) {
        return res.status(404).json({ message: 'Cannot find book' })
      } else if (foundBook) {
        const index = foundBook.borrowers.indexOf(user._id)
        if (index >= 0) {
          foundBook.borrowers.splice(index, 1)
          foundBook.quantity += 1
          foundBook.save()
          return res.status(200).json({
            status: 'success',
            message: 'Return Successfully!',
            user: foundUser,
            book: foundBook,
          })
        } else if (index < 0) {
          return res.status(404).json({
            status: 'error',
            message: 'Book is not borrowed',
          })
        }
      }
    })
  })
}

function getAll(): Promise<BookType[] | null> {
  return Book.find().sort({ name: 1, publishedYear: 1 }).exec()
}

function getAllBySearch(
  queryCondition: Partial<BookType>
): Promise<BookType[] | null> {
  return Book.aggregate([
    {
      $match: {
        $and: [
          { authors: { $regex: queryCondition.authors || '', $options: 'i' } },
          { title: { $regex: queryCondition.title || '', $options: 'i' } },
          { status: { $regex: queryCondition.status || '', $options: 'i' } },
        ],
      },
    },
    {
      $match: {
        categories: {
          $all: queryCondition.categories,
        },
      },
    },
    { $sort: { title: 1 } },
  ]).exec()
}

export default {
  getAll,
  getAllBySearch,
  borrowBook,
  returnBook,
  createBook,
  getBookById,
  editBookById,
  deleteBookById,
}
