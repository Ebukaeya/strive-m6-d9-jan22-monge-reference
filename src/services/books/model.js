import mongoose from "mongoose"

const { Schema, model } = mongoose

const booksSchema = new Schema(
  {
    asin: { type: String, required: true },
    title: { type: String, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ["history", "horror", "romance", "fantasy"] },
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  {
    timestamps: true,
  }
)

// ************************************ CUSTOM METHOD ******************************************************
// we are going to attach a custom method to the schema --> everywhere we gonna import the model we gonna have that method available

booksSchema.static("findBooksWithAuthors", async function (mongoQuery) {
  // if I use an arrow function here, "this" will be undefined. If I use a normal function, "this" will refer to BooksModel itself

  const total = await this.countDocuments(mongoQuery.criteria)

  const books = await this.find(mongoQuery.criteria, mongoQuery.options.fields)
    .skip(mongoQuery.options.skip || 0)
    .limit(mongoQuery.options.limit || 10)
    .sort(mongoQuery.options.sort)
    .populate({ path: "authors", select: "firstName lastName" })

  return { total, books }
})

export default model("Book", booksSchema)
