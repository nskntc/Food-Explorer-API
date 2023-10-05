exports.up = knex => knex.schema.createTable("favorites", table => {
    table.increments("id").primary()
    table.text("name").unique()
    table.integer("dishe_id").references("id").inTable("dishes").onDelete("CASCADE")
    table.integer("user_id").references("id").inTable("users").onDelete("CASCADE")
})

exports.down = knex => knex.schema.dropTable("favorites")
