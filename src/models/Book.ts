import mongoose, { Document } from 'mongoose'

type Borrowers = {
  _id: string;
}

export type BookType = Document & {
  isbn: number;
  title: string;
  authors: string[];
  publisher: string;
  publishYear: number;
  categories: string[];
  description: string;
  status: string;
  quantity: number;
  available: boolean;
  imageUrl: string;
  borrowers: Borrowers[];
}

const bookSchema = new mongoose.Schema({
  isbn: {
    type: Number,
    min: 0,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  authors: {
    type: [String],
    required: true,
    trim: true,
    validate: {
      validator: function (author: string[]) {
        return author.length > 0
      },
      message: 'Author field cannot be empty',
    },
  },
  publisher: {
    type: String,
    required: false,
    trim: true,
  },
  publishYear: {
    type: Number,
    required: false,
  },
  categories: {
    type: [String],
    trim: true,
  },
  quantity: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
    validate: {
      validator: function (quantity: number) {
        return quantity >= 0 && quantity <= 10
      },
      message: 'Quantity must be from 0 to 10',
    },
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
  },
  available: {
    type: Boolean,
    default: 'true',
  },
  borrowers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
})

export default mongoose.model<BookType>('Book', bookSchema)
