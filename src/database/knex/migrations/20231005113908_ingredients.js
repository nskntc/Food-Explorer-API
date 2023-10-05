exports.up = knex => knex.schema.createTable("ingredients", table => {
    table.increments("id").primary()
    table.text("name").notNullable()
    table.integer("dishe_id").references("id").inTable("dishes").onDelete("CASCADE")
})

exports.down = knex => knex.schema.dropTable("ingredients")

