const AppError = require("../utils/AppError")

const ensureIsAdmin = (request, response, next) => {
    const { isAdmin } = request.user

    if(!isAdmin) throw new AppError("Apenas administradores podem concluir essa tarefa!", 401)

    return next()
}

module.exports = ensureIsAdmin