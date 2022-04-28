import express from "express"
import createError from "http-errors"
import UsersModel from "./model.js"
import BooksModel from "../books/model.js"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body) // here it happens the validation of req.body, if it is not ok Mongoose will throw an error (if it is ok it is NOT saved in db yet)

    const { _id } = await newUser.save() // --> {_id: 123io12j3oi21j, firstName: "aoidjoasijdo"}
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find()
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)

    if (user) {
      res.send(user)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO
      req.body, // HOW
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record pre-modification. If you want to get back the newly updated record you should use the option: new true
      // by default validation is off here, if you want to have it --> runValidators: true
    )

    // ********************************* ALTERNATIVE METHOD ***************************************

    // const user = await UsersModel.findById(req.params.userId)

    // user.firstName = "John"

    // await user.save()

    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/:userId/purchaseHistory", async (req, res, next) => {
  try {
    // We gonna receive the bookId from req.body. Given that id, we would like to insert the corresponding book into the purchaseHistory of the specified user

    // 1. Find the book in the books'collection by _id
    const purchasedBook = await BooksModel.findById(req.body.bookId, { _id: 0 }) // findById(id, projection) --> with the usage of projection we could remove the original _id from the purchasedBook --> when I am adding the book to the array, Mongo will automagically create a brand new unique _id for that item

    if (purchasedBook) {
      // 2. If book is found --> add additional info like purchaseDate
      const bookToInsert = { ...purchasedBook.toObject(), purchaseDate: new Date() } // purchasedBook (and everything you get from .find() .findOne() .findById()) is a MONGOOSE DOCUMENT (special object with lots of strange fields), it is NOT A NORMAL OBJECT, therefore if I want to spread it I shall use .toObject(), which converts a document into a PLAIN OBJECT

      console.log("BOOK TO INSERT ", bookToInsert)

      // 3. Update the specified user by adding that book to the purchaseHistory array

      const modifiedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $push: { purchaseHistory: bookToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      )
      if (modifiedUser) {
        res.send(modifiedUser)
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`))
      }
    } else {
      // 4. If either book or user are not found --> 404
      next(createError(404, `Book with id ${req.body.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/purchaseHistory", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      res.send(user.purchaseHistory)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/purchaseHistory/:bookId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      const purchasedBook = user.purchaseHistory.find(book => book._id.toString() === req.params.bookId) // You CANNOT compare a string (req.params.bookId) with an ObjectID (book._id) --> we shall convert ObjectID into a string
      if (purchasedBook) {
        res.send(purchasedBook)
      } else {
        next(createError(404, `Book with id ${req.params.bookId} not found!`))
      }
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId/purchaseHistory/:bookId", async (req, res, next) => {
  try {
    // 1. Find the user
    const user = await UsersModel.findById(req.params.userId)

    if (user) {
      // 2. Modify the user (with JS)

      const index = user.purchaseHistory.findIndex(book => book._id.toString() === req.params.bookId)

      if (index !== -1) {
        user.purchaseHistory[index] = { ...user.purchaseHistory[index].toObject(), ...req.body }

        // 3. Save it back

        await user.save() // since user is a MONGOOSE DOCUMENT I can use .save()

        res.send(user)
      } else {
        next(createError(404, `Book with id ${req.params.bookId} not found!`))
      }
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId/purchaseHistory/:bookId", async (req, res, next) => {
  try {
    const modifiedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO
      { $pull: { purchaseHistory: { _id: req.params.bookId } } }, // HOW
      { new: true }
    )

    if (modifiedUser) {
      res.send(modifiedUser)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default usersRouter
