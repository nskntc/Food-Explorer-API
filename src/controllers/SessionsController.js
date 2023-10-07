const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const { compare } = require("bcryptjs")
const { sign } = require("jsonwebtoken")
const authConfig = require("../configs/auth")

class SessionsController{
    async create(request, response){
        const { email, password } = request.body

        const user = await knex("users").where({ email }).first()
        if(!user) throw new AppError("Email e/ou senha incorretos!", 401)

        const checkPassword = compare(password, user.password)
        if(!checkPassword) throw new AppError("Email e/ou senha incorretos!", 401)

        const { secret, expiresIn } = authConfig.jwt

        const token = sign({ isAdmin: user.roles === "admin" }, secret, {
            subject: String(user.id),
            expiresIn
        })

        return response.status(201).json({ user, token })
    }
}

module.exports = SessionsController