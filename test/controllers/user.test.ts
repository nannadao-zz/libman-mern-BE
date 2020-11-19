import request from 'supertest'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../src/util/secrets'

import User, { UserType } from '../../src/models/User'
import app from '../../src/app'
import * as dbHelper from '../db-helper'
import { before } from 'lodash'
import { emitWarning } from 'process'
import { doesNotReject } from 'assert'
import e from 'express'

const nonExistingUserId = '5e57b77b5577fa0b461c7906'

async function createUser(overrideInfo?: Partial<UserType>) {
    let user = {
        firstName: 'Roger',
        lastName: 'Federer',
        username: 'roger1',
        email: 'roger@wimbledon.com',
        password: 'roger1'
    }
    if (overrideInfo) {
        user = {...user, ...overrideInfo}
    }
    return await request(app)
    .post('/api/v1/users')
    .send(user)
}

describe('user controller', () => {
    beforeAll(async () => {
        await dbHelper.connect()
    })

    /* beforeEach(async () => {
        const res = await request(app)
        .post('/users/login')
        .send({
            email: user.body.email,
            password: user.body.password
        })
        .then(res => {
            token = jwt.sign({ id: res.body._id}, JWT_SECRET, {expiresIn: '2d'})
            res.
        })
    }) */
    
    afterEach(async () => {
        await dbHelper.clearDatabase()
    })

    afterAll(async () => {
        await dbHelper.closeDatabase()
    })

    it('should create an user', async () => {
        const res = await createUser()
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('_id')
        expect(res.body.firstName).toBe('Roger')
    })

    it('should not create user with insufficient info', async () => {
        const res = await request(app)
        .post('/api/v1/users')
        .send({
            firstName: 'Roger',
            /* lastName: 'Federer', */
            username: 'roger1',
            email: 'roger@wimbledon.com',
            /* password: "roger1" */
        })
        expect(res.status).toBe(404)
    })

    it('should log in an existing user', async () => {
        const user = await createUser()

        const res = await request(app)
        .post('/users/login')
        .send({
            email: user.body.email,
            password: user.body.password
        })
        .end((res) => {
            expect(res.header).toHaveProperty('auth-token')
            expect(res.body.email).toEqual(user.body.email)
        })
    })

    /* it('should return user page', async () => {
        const user = await createUser()
        let token = ''
        await request(app)
        .post('/users/login')
        .send({
            email: user.body.email,
            password: user.body.password
        })
        .end((res) => {
            
        })
        const res = await request(app)
        .post(`/users/${user.body._id}`)
        .end((res) => {
            console.log(res)
        })
    }) */
})
