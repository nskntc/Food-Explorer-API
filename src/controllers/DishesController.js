const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

class DishesController {
    async create(request, response){
        const { name, description, price, category, ingredients } = request.body
        let fileName = null

        if(request.file) fileName = request.file.filename

        const ingredientsArray = ingredients.split(",")

        if(!name || !description || !price || !category || !ingredients || !fileName){
            throw new AppError("Por favor, preencher todos os campos!", 422)
        }

        const checkDisheNameExists = await knex("dishes").where({ name }).first()
        if (checkDisheNameExists) {
            throw new AppError("O nome deste prato já está cadastrado! Caso deseje, pode editá-lo na aba de Editar Prato.", 422)
        }

        const diskStorage = new DiskStorage()
        const img = await diskStorage.saveFile(fileName)

        const [dish_id] = await knex("dishes").insert({
            name,
            description,
            price,
            category,
            img: `${fileName ? img : null}`
        })

        const ingredientsInsert = ingredientsArray.map(ingredient => {
            return{
                dish_id,
                name: ingredient
            }
        })
        await knex("ingredients").insert(ingredientsInsert)

        return response.status(201).json()
    }

    async update(request, response){
        const { id } = request.params
        const { name, description, price, category, ingredients } = request.body
        let fileName = null
        let img = null
        
        if(request.file) fileName = request.file.filename

        if(!name || !description || !price || !category || !ingredients){
            throw new AppError("Por favor, preencher todos os campos!", 422)
        }

        const dish = await knex("dishes").where({ id }).first()
        if(!dish) throw new AppError("Prato não cadastrado!", 404)

        const ingredientsArray = ingredients.split(",")

        const diskStorage = new DiskStorage()

        if(fileName){
            diskStorage.deleteFile(dish.img)
            img = await diskStorage.saveFile(fileName)
        }

        const updatedDish = {
            name,
            description,
            price,
            category,
            img: img ?? dish.img,
            updated_at: knex.fn.now()
        }

        await knex("dishes")
        .where({ id })
        .update(updatedDish)

        if(ingredientsArray){
            const updatedIngredients = ingredientsArray.map(ingredient => {
                return{
                    dish_id: id,
                    name: ingredient
                }
            })

            await knex("ingredients").where({ dish_id: id }).delete();
            await knex('ingredients').insert(updatedIngredients);
        }

        return response.status(204).json()
    }

    async show(request, response){
        const { id } = request.params

        const dish = await knex("dishes").where({ id }).first()
        if(!dish) throw new AppError("Prato não cadastrado!", 404)

        const ingredients = await knex("ingredients").where({ dish_id: id }).orderBy("name")

        return response.status(200).json({
            ...dish,
            ingredients
        })
    }

    async index(request, response){
        const { name } = request.query

        let dishes

        dishes = await knex("dishes")
        .whereLike("name", `%${name}%`)
        .orderBy("name")

        if(!dishes[0]) {
            dishes = await knex("ingredients")
            .select([
                "dishes.id",
                "dishes.name",
                "dishes.description",
                "dishes.price",
                "dishes.category",
                "dishes.img"
            ])
            .whereLike("ingredients.name", `%${name}%`)
            .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
            .groupBy("dishes.id")
            .orderBy("dishes.name")
        }
        
        const ingredientsTable = await knex("ingredients")

        const DisheWithIngredients = dishes.map(dish => {
            const dishIngredients = ingredientsTable.filter(ingredient => ingredient.dish_id === dish.id)

            return{
                ...dish,
                ingredients: dishIngredients
            }
        })

        return response.status(200).json(DisheWithIngredients)
    }

    async delete(request, response){
        const { id } = request.params
        const diskStorage = new DiskStorage()

        const dish = await knex("dishes").where({ id }).first()
        diskStorage.deleteFile(dish.img)

        await knex("dishes").where({ id }).delete()

        return response.json()
    }
}

module.exports = DishesController