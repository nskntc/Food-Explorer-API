const { Router } = require("express")

const DishesController = require("../controllers/DishesController")

const ensureAthenticaded = require("../middlewares/ensureAuthenticaded")
const ensureIsAdmin = require("../middlewares/ensureIsAdmin")

const dishesRoutes = Router()
const dishesController = new DishesController()

// dishesRoutes.use(ensureAthenticaded)
dishesRoutes.post("/", dishesController.create)
dishesRoutes.put("/:id", dishesController.update)
dishesRoutes.get("/:id", dishesController.show)
dishesRoutes.get("/", dishesController.index)

module.exports = dishesRoutes