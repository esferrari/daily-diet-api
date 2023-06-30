declare module 'knex/types/tables' {
  export interface Tables {
    user: {
      id: string
      username: string
      email: string
      created_at: string
    }
    meal: {
      id: number
      id_user: string
      name: string
      description: string
      created_at: string
      ondiet: boolean
      meal_at: string
    }
  }
}
