const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

class DishesController {
    async create(request, response){
        const { name, description, price, category, ingredients } = request.body

        const fileName = null

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

    async update(request, response){
        const { id } = request.params
        const { name, description, price, category, ingredients } = request.body

        if(!name || !description || !price || !category || !ingredients){
            throw new AppError("Por favor, preencher todos os campos!", 422)
        }

        const dish = await knex("dishes").where({ id }).first()
        if(!dish) throw new AppError("Prato não cadastrado!", 404)

        const updatedDish = {
            name,
            description,
            price,
            category,
            updated_at: knex.fn.now()
        }

        await knex("dishes")
        .where({ id })
        .update(updatedDish)

        if(ingredients){
            const updatedIngredients = ingredients.map(ingredient => {
                return{
                    dish_id: id,
                    name: ingredient
                }
            })

            await knex("ingredients").where({ dish_id: id }).delete();
            await knex('ingredients').insert(updatedIngredients);
        }

        return response.status(201).json()
    }

    async show(request, response){
        const { id } = request.params

        const dish = await knex("dishes").where({ id }).first()
        if(!dish) throw new AppError("Prato não cadastrado!", 404)

        const ingredients = await knex("ingredients").where({ dish_id: id }).orderBy("name")

        return response.status(201).json({
            ...dish,
            ingredients
        })
    }

    async index(request, response){
        const { name, ingredients } = request.query
        console.log(name, ingredients)

        let dishes

        if (ingredients) {
            const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim())

            dishes = await knex("ingredients")
            .select([
                "dishes.id",
                "dishes.name",
                "dishes.description",
                "dishes.price",
                "dishes.category",
                "dishes.img"
            ])
            .whereLike("dishes.name", `%${name}%`)
            .whereIn("ingredients.name", filterIngredients)
            .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
            .groupBy("dishes.id")
            .orderBy("dishes.name")
        } else{
            dishes = await knex("dishes")
            .whereLike("name", `%${name}%`)
            .orderBy("name")
        }
        
        const ingredientsTable = await knex("ingredients")

        const DisheWithIngredients = dishes.map(dish => {
            const dishIngredients = ingredientsTable.filter(ingredient => ingredient.dish_id === dish.id)

            return{
                ...dish,
                ingredients: dishIngredients
            }
        })

        return response.status(201).json(DisheWithIngredients)
    }
}

module.exports = DishesController