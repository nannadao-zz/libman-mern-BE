import request from 'supertest'

import Book, { BookType } from '../../src/models/Book'
import app from '../../src/app'
import * as dbHelper from '../db-helper'
import { inRange } from 'lodash'

const nonExistingBookId = '5e57b77b5744fa0b461c7906'

async function createBook(overrideInfo?: Partial<BookType>) {
    let book = {
        isbn: 9780385346658,
        title: 'Never Eat Alone 2',
        authors: ['Keith Ferrazzi'],
        publisher: 'Crown Publishing Group',
        categories: ['communication'],
        quantity: 1,
        status: 'available',
    }
    if (overrideInfo) {
        book = { ...book, ...overrideInfo }
    }
    return await request(app)
    .post('/api/v1/books')
    .send(book)
}

describe('book controller', () => {
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
        const res = await createBook()
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('_id')
        expect(res.body.title).toBe('Never Eat Alone 2')
    })

    it('should not create a book with insufficient data', async () => {
        const res = await request(app)
        .post('/api/v1/books')
        .send({
            isbn: 9780385346658,
            //title: "Never Eat Alone 2",
            authors: ['Keith Ferrazzi'],
            //publisher: "Crown Publishing Group",
            categories: ['communication'],
            quantity: 1,
        })
        expect(res.status).toBe(404)
    })
    
    it('should not return a random book', async () => {
        const res = await request(app)
        .get(`/api/v1/books/${nonExistingBookId}`)
        expect(res.status).toBe(404)
    })

    it('should return all added books', async () => {
        const res1 = await createBook({
            title: 'Never Eat Alone 1',
            quantity: 2
        })
        const res2 = await createBook({
            title: 'Never Eat Alone 3',
            quantity: 5
        })
        const res3 = await request(app)
        .get('/api/v1/books')
        expect(res3.body.length).toEqual(2)
        expect(res3.body[0]._id).toEqual(res1.body._id)
        expect(res3.body[1]._id).toEqual(res2.body._id)
    })

    it('should update an existing book', async () => {
        let res = await createBook()
        expect(res.status).toBe(200)
        const bookId = res.body._id

        const update = {
            title: 'Never Eat Alone 4'
        }
        res = await request(app)
        .put(`/api/v1/books/${bookId}`)
        .send(update)

        expect(res.status).toBe(200)
        expect(res.body.title).toEqual('Never Eat Alone 4')
    })

    it('should delete an existing book', async () => {
        let res = await createBook()
        expect(res.status).toBe(200)
        const bookId = res.body._id

        res = await request(app)
        .delete(`/api/v1/books/${bookId}`)
        expect(res.status).toBe(204)

        res = await request(app)
        .get(`/api/v1/books/${bookId}`)
        expect(res.status).toBe(404)
    })
})