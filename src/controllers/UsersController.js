const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const { hash } = require("bcryptjs")

class UsersController {
    async create(request, response) {
        const { name, email, password, roles } = request.body

        if(!name) throw new AppError("Nome não informado!", 422)
        if(!email) throw new AppError("Email não informado!", 422)
        if(!password) throw new AppError("Senha não informada!", 422)

        if(password.length < 6) throw new AppError("A senha deve possuir pelo menos 6 caracteres!", 422)

        const checkUserExists = await knex("users").where({ email }).first()
        if(checkUserExists) throw new AppError("Email já cadastrado!", 422)

        const hashedPassword = await hash(password, 6)

        await knex("users").insert({
            name,
            email,
            password: hashedPassword,
            roles: `${roles ? roles : "common"}`
        })
        return response.status(201).json()
    }
}

module.exports = UsersController