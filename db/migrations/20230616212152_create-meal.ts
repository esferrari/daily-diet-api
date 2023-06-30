import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meal', function (table) {
    table.increments('id')
    table.string('id_user')
    table.foreign('id_user').references('user.id')
    table.string('name')
    table.string('description')
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('meal_at')
    table.boolean('ondiet')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('meal')
}
