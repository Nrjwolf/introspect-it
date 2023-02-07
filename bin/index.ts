#! /usr/bin/env node
import { inferSchema, inferTable } from '../src'

const [...args] = process.argv

async function main(): Promise<string> {
  const db = args[2] || process.env.DATABASE_URL || ''
  const table = args[3] || process.env.TABLE_NAME
  const toCamelCase = process.env.CAMEL_CASE === 'true' || false
  const useQuotes = process.env.USE_QUOTES === 'true' || false

  if (table) {
    return inferTable(db, table, toCamelCase, useQuotes)
  }

  return inferSchema(db, toCamelCase, useQuotes)
}

main()
  .then(code => {
    console.log(code)
    process.exit()
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
