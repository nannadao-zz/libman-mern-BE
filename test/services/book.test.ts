import Book from '../../src/models/Book'
import BookService from '../../src/services/book'
import * as dbHelper from '../db-helper'

const nonExistingBookId = '5e57b77b5744fa0b461c7906'

async function createBook(){
    const book = new Book({
        isbn: 9780385346658,
        title: 'Never Eat Alone 2',
        authors: ['Keith Ferrazzi'],
        publisher: 'Crown Publishing Group',
        categories: ['communication'],
        quantity: 1,
        status: 'available',
    })
    return await BookService.createBook(book)
}

describe('book service', () => {
    beforeAll(async () => {
        await dbHelper.connect()
    })

    afterEach(async () => {
        await dbHelper.clearDatabase()
    })

    afterAll(async () => {
        await dbHelper.closeDatabase()
    })

    it('should create a book', async () => {
        const book = await createBook()
        expect(book).toHaveProperty('_id')
        expect(book).toHaveProperty('title', 'Never Eat Alone 2')
    })

    it('should return a book', async () => {
        const book = await createBook()
        const foundBook = await BookService.getBookById(book._id)
        expect(foundBook._id).toEqual(book._id)
        expect(foundBook.title).toEqual(book.title)
    })

    it('should not get a non-existing book', async () => {
        return BookService.getBookById(nonExistingBookId)
        .catch(e => {
            expect(e.message).toMatch(`Cannot find book id: ${nonExistingBookId}`)
        })
    })

    it('should update an added book', async () => {
        const book = await createBook()
        const changes = {
            title: 'Never Eat Alone 3',
            quantity: 5
        }
        const updatedBook = await BookService.editBookById(book._id, changes)
        expect(updatedBook).toHaveProperty('_id', book._id)
        expect(updatedBook).toHaveProperty('title', 'Never Eat Alone 3')
        expect(updatedBook).toHaveProperty('quantity', 5)
    })

    it('should update a non-added book', async () => {
        const changes = {
            title: 'Never Eat Alone 3',
            quantity: 5
        }
        return BookService.editBookById(nonExistingBookId, changes)
        .catch(e => {
            expect(e.message).toMatch(`Cannot update book id: ${nonExistingBookId}`)
        })
    })

    it('should get all added book', async () => {
        const book = await createBook()
        const query = {
            title: 'never'
        }
        const foundBook = await BookService.getAllBySearch(query)
        foundBook?.forEach(foundBook => {
            expect(foundBook.title).toMatch(book.title)
        })
    })

    it('should delete an added book', async () => {
        const book = await createBook()
        await BookService.deleteBookById(book._id)
        .catch(e => {
            expect(e.message).toBe('Movie not found')
        })
    })

    /* it('should add borrow book to user', async () => {

    }) */
})