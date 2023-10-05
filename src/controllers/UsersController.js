const knex = require("../database/knex")

const AppError = require("../utils/AppError")

const { hash } = require("bcryptjs")

class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body

        if(!name) throw new AppError("Nome não informado!", 422)
        if(!email) throw new AppError("Email não informado!", 422)
        if(!password) throw new AppError("Senha não informada!", 422)

        const checkUserExists = await knex("users").where({ email })
        if(checkUserExists) throw new AppError("Email já cadastrado!", 422)

        const hashedPassword = await hash(password, 6)

        await knex("users").insert({
            name,
            email,
            hashedPassword
        })
        return response.status(201).json()
    }
}

module.exports = UsersController