const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const { compare } = require("bcryptjs")
const { sign, verify } = require("jsonwebtoken")
const authConfig = require("../configs/auth")

class SessionsController{
    async create(request, response){
        const { email, password } = request.body

        const user = await knex("users").where({ email }).first()
        if(!user) throw new AppError("Email e/ou senha incorretos!", 401)

        const checkPassword = await compare(password, user.password)
        if(!checkPassword) throw new AppError("Email e/ou senha incorretos!", 401)

        const { secret, expiresIn } = authConfig.jwt

        const isAdmin = user.roles === "admin"

        const token = sign({ isAdmin: isAdmin }, secret, {
            subject: String(user.id),
            expiresIn
        })

        return response.status(201).json({ user, token })
    }
}

module.exports = SessionsController