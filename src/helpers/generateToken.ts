import jwt from 'jsonwebtoken'

import { JWT_SECRET } from '../util/secrets'

const generateToken = (id: string) => {
  return jwt.sign(
    {
      iss: 'Nanna Dao',
      sub: id,
    },
    JWT_SECRET,
    { expiresIn: 60 * 15 }
  )
}

export default generateToken
