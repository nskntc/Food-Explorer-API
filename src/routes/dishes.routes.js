const { Router } = require("express")

const DishesController = require("../controllers/DishesController")

const ensureAthenticaded = require("../middlewares/ensureAuthenticaded")
const ensureIsAdmin = require("../middlewares/ensureIsAdmin")

const multer = require("multer")
const uploadConfig = require("../configs/upload")
const upload = multer(uploadConfig.MULTER)

const dishesRoutes = Router()
const dishesController = new DishesController()

dishesRoutes.use(ensureAthenticaded)
dishesRoutes.post("/", ensureIsAdmin, upload.single("img"), dishesController.create)
dishesRoutes.put("/:id", ensureIsAdmin, upload.single("img"), dishesController.update)
dishesRoutes.get("/:id", dishesController.show)
dishesRoutes.get("/", dishesController.index)
dishesRoutes.delete("/:id", ensureIsAdmin, dishesController.delete)

module.exports = dishesRoutes