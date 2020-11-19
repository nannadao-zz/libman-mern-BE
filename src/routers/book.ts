import express from 'express'
import passport from 'passport'
const router = express.Router()

require('../middlewares/authentication')
import {
  getAll,
  getAllBySearch,
  createBook,
  getBookById,
  editBookById,
  borrowBook,
  returnBook,
  deleteBookById,
} from '../controllers/book'
import isAuthenticated from '../middlewares/isAuthenticated'
import isAdmin from '../middlewares/isAdmin'

//Path prefix: /api/v1/books
router.get('/', getAllBySearch)
router.get('/all', getAll)
router.get('/:bookId', getBookById)
router.post(
  '/create',
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  createBook
)
router.put('/:bookId', isAuthenticated, isAdmin, editBookById)

router.put('/:bookId/borrow', isAuthenticated, borrowBook)

router.put('/:bookId/return', isAuthenticated, returnBook)

router.delete('/:bookId', isAuthenticated, isAdmin, deleteBookById)

export default router
