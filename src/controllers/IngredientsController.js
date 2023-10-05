const knex = require("../database/knex")

class IngredientsController {
    async index(request, response) {
        const { dishe_id } = request.params

        const ingredients = await knex("ingredients").where({ dishe_id })

        return response.json(ingredients)
    }
}

module.exports = IngredientsController