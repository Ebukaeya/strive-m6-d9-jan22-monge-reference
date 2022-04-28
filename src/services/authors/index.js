import express from "express"
import AuthorsModel from "./model.js"

const authorsRouter = express.Router()

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body)
    const { _id } = await newAuthor.save()

    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

authorsRouter.put("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

export default authorsRouter
