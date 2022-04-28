import express from "express"
import q2m from "query-to-mongo"
import BooksModel from "./model.js"

const booksRouter = express.Router()

booksRouter.post("/", async (req, res, next) => {
  try {
    const newBook = new BooksModel(req.body)
    const { _id } = await newBook.save()

    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/", async (req, res, next) => {
  try {
    console.log("QUERY: ", req.query)
    console.log("MONGO-QUERY: ", q2m(req.query))

    const mongoQuery = q2m(req.query)

    const total = await BooksModel.countDocuments(mongoQuery.criteria)

    const books = await BooksModel.find(mongoQuery.criteria, mongoQuery.options.fields)
      .skip(mongoQuery.options.skip || 0)
      .limit(mongoQuery.options.limit || 10)
      .sort(mongoQuery.options.sort)
      .populate({ path: "authors", select: "firstName lastName" })
    res.send({ links: mongoQuery.links("http://localhost:3001/books", total), totalPages: Math.ceil(total / mongoQuery.options.limit), total, books })
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/:id", async (req, res, next) => {
  try {
    const book = await BooksModel.findById(req.params.id).populate({ path: "authors", select: "lastName" })

    res.send(book)
  } catch (error) {
    next(error)
  }
})

booksRouter.put("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

booksRouter.delete("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

export default booksRouter
