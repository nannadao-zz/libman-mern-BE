import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcrypt'

type Borrows = {
  book: string;
  borrowDate?: Date;
  dueDate?: Date;
}

type Returns = {
  book: string;
  dueDate?: Date;
  returnDate?: Date;
}

export type UserType = mongoose.Document & {
  isAdmin: boolean;
  fullName: string;
  username: string;
  email: string;
  password: string;
  borrows: Borrows[];
  returns: Returns[];
  googleId?: string;
  imageUrl: string;
  comparePassword: (password: string) => boolean;
}

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
    validate: {
      validator: function (email: string) {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        return emailRegex.test(email)
      },
    },
  },
  password: {
    type: String,
    required: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
  },
  googleId: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  borrows: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
      borrowDate: {
        type: Date,
        default: Date.now(),
      },
      dueDate: {
        type: Date,
        default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
    },
  ],
  returns: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
      dueDate: {
        type: Date,
        default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
      returnDate: {
        type: Date,
      },
    },
  ],
})

userSchema.methods.comparePassword = async function (inputPassword: string) {
  return await bcrypt.compare(inputPassword, this.password)
}

userSchema.pre<UserType>('save', async function (next) {
  const user = this
  if (!user.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)
})

export default mongoose.model<UserType>('User', userSchema)
