const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

class DishesController {
    async create(request, response){
        const { name, description, price, category, ingredients } = request.body

        const fileName = null

        console.log(name, description, price, category, ingredients)

        if(!name || !description || !price || !category || !ingredients){
            throw new AppError("Por favor, preencher todos os campos!", 422)
        }

        const checkDisheNameExists = await knex("dishes").where({ name }).first()
        if (checkDisheNameExists) {
            throw new AppError("O nome deste prato já está cadastrado! Caso deseje, pode editá-lo na aba de Editar Prato.", 422)
        }

        const diskStorage = new DiskStorage()
        if(fileName) {
            const img = await diskStorage.saveFile(fileName)
        }

        const [dish_id] = await knex("dishes").insert({
            name,
            description,
            price,
            category,
            img: `${fileName ? img : null}`
        })

        const ingredientsInsert = ingredients.map(ingredient => {
            return{
                dish_id,
                name: ingredient
            }
        })
        await knex("ingredients").insert(ingredientsInsert)

        return response.status(201).json()
    }
}

module.exports = DishesController