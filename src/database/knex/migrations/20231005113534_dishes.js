exports.up = knex => knex.schema.createTable("dishes", table => {
    table.increments("id").primary()
    table.text("name").notNullable()
    table.text("description").notNullable()
    table.float("price").notNullable()
    table.text("category").notNullable()
    table.text("img").default(null)
    table.timestamp("created_at").default(knex.fn.now())
    table.timestamp("updated_at").default(knex.fn.now())
})

exports.down = knex => knex.schema.dropTable("dishes")
