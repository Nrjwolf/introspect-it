import { Postgres } from '../src/pg-client'
import { inferTable, inferSchema } from '../src'
import { SQL as sql } from 'sql-template-strings'

const connectionString = 'postgresql://postgres:password@localhost:5433/db?currentSchema=public'
const pg = new Postgres(connectionString)

const account = sql`
  DROP TABLE IF EXISTS account;
  CREATE TABLE account (
    username VARCHAR (50) UNIQUE NOT NULL,
    password VARCHAR (50) NOT NULL,
    email VARCHAR (355) UNIQUE NOT NULL,
    created_on TIMESTAMP NOT NULL,
    last_login TIMESTAMP
  )
`

const requests = sql`
  DROP TYPE IF EXISTS integration_type_enum CASCADE;
  CREATE TYPE integration_type_enum AS ENUM (
      'source',
      'destination'
  );

  DROP TABLE IF EXISTS requests;
  CREATE TABLE requests (
    name varchar(255) NOT NULL,
    url varchar(255) NOT NULL,
    integration_type integration_type_enum NOT NULL
  );
`

const complex = sql`
  DROP TABLE IF EXISTS complex;
  CREATE TABLE complex (
    id json NOT NULL,
    name varchar(255) NOT NULL,
    nullable varchar(255),
    created_at timestamp,
    created_on date NOT NULL
  )
`

beforeAll(async () => {
  await pg.query(account)
  await pg.query(requests)
  await pg.query(complex)
})

describe('inferTable', () => {
  it('infers a table', async () => {
    const code = await inferTable(connectionString, 'account')
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export type AccountTableUsername = string
      export type AccountTablePassword = string
      export type AccountTableEmail = string
      export type AccountTableCreatedOn = Date
      export type AccountTableLastLogin = Date | null

      export const AccountTableUsernameColumnName = \\"username\\"
      export const AccountTablePasswordColumnName = \\"password\\"
      export const AccountTableEmailColumnName = \\"email\\"
      export const AccountTableCreatedOnColumnName = \\"created_on\\"
      export const AccountTableLastLoginColumnName = \\"last_login\\"

      export type AccountTable = {
        username: AccountTableUsername
        password: AccountTablePassword
        email: AccountTableEmail
        created_on: AccountTableCreatedOn
        last_login: AccountTableLastLogin
      }

      export const AccountTableName = \\"account\\"

      export const AccountTableColumnNames = {
        username: AccountTableUsernameColumnName,
        password: AccountTablePasswordColumnName,
        email: AccountTableEmailColumnName,
        created_on: AccountTableCreatedOnColumnName,
        last_login: AccountTableLastLoginColumnName
      } as const
      "
    `)
  })

  it('works with enums', async () => {
    const code = await inferTable(connectionString, 'requests')
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export type RequestsTableName = string
      export type RequestsTableUrl = string
      export type RequestsTableIntegrationType = \\"destination\\" | \\"source\\"

      export const RequestsTableNameColumnName = \\"name\\"
      export const RequestsTableUrlColumnName = \\"url\\"
      export const RequestsTableIntegrationTypeColumnName = \\"integration_type\\"

      export type RequestsTable = {
        name: RequestsTableName
        url: RequestsTableUrl
        integration_type: RequestsTableIntegrationType
      }

      export const RequestsTableName = \\"requests\\"

      export const RequestsTableColumnNames = {
        name: RequestsTableNameColumnName,
        url: RequestsTableUrlColumnName,
        integration_type: RequestsTableIntegrationTypeColumnName
      } as const
      "
    `)
  })

  it('works with complex types', async () => {
    const code = await inferTable(connectionString, 'complex')
    expect(code).toMatchInlineSnapshot(`
      "export type JSONPrimitive = string | number | boolean | null
      export type JSONValue = JSONPrimitive | JSONObject | JSONArray
      export type JSONObject = { [member: string]: JSONValue }
      export type JSONArray = Array<JSONValue>

      /* tslint:disable */
      /* eslint-disable */

      export type ComplexTableId = JSONValue
      export type ComplexTableName = string
      export type ComplexTableNullable = string | null
      export type ComplexTableCreatedAt = Date | null
      export type ComplexTableCreatedOn = Date

      export const ComplexTableIdColumnName = \\"id\\"
      export const ComplexTableNameColumnName = \\"name\\"
      export const ComplexTableNullableColumnName = \\"nullable\\"
      export const ComplexTableCreatedAtColumnName = \\"created_at\\"
      export const ComplexTableCreatedOnColumnName = \\"created_on\\"

      export type ComplexTable = {
        id: ComplexTableId
        name: ComplexTableName
        nullable: ComplexTableNullable
        created_at: ComplexTableCreatedAt
        created_on: ComplexTableCreatedOn
      }

      export const ComplexTableName = \\"complex\\"

      export const ComplexTableColumnNames = {
        id: ComplexTableIdColumnName,
        name: ComplexTableNameColumnName,
        nullable: ComplexTableNullableColumnName,
        created_at: ComplexTableCreatedAtColumnName,
        created_on: ComplexTableCreatedOnColumnName
      } as const
      "
    `)
  })
})

describe('inferSchema', () => {
  it('infers all tables at once', async () => {
    const code = await inferSchema(connectionString)
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export type JSONPrimitive = string | number | boolean | null
      export type JSONValue = JSONPrimitive | JSONObject | JSONArray
      export type JSONObject = { [member: string]: JSONValue }
      export type JSONArray = Array<JSONValue>

      export type AccountTableUsername = string
      export type AccountTablePassword = string
      export type AccountTableEmail = string
      export type AccountTableCreatedOn = Date
      export type AccountTableLastLogin = Date | null

      export const AccountTableUsernameColumnName = \\"username\\"
      export const AccountTablePasswordColumnName = \\"password\\"
      export const AccountTableEmailColumnName = \\"email\\"
      export const AccountTableCreatedOnColumnName = \\"created_on\\"
      export const AccountTableLastLoginColumnName = \\"last_login\\"

      export type AccountTable = {
        username: AccountTableUsername
        password: AccountTablePassword
        email: AccountTableEmail
        created_on: AccountTableCreatedOn
        last_login: AccountTableLastLogin
      }

      export const AccountTableName = \\"account\\"

      export const AccountTableColumnNames = {
        username: AccountTableUsernameColumnName,
        password: AccountTablePasswordColumnName,
        email: AccountTableEmailColumnName,
        created_on: AccountTableCreatedOnColumnName,
        last_login: AccountTableLastLoginColumnName
      } as const

      export type ComplexTableId = JSONValue
      export type ComplexTableName = string
      export type ComplexTableNullable = string | null
      export type ComplexTableCreatedAt = Date | null
      export type ComplexTableCreatedOn = Date

      export const ComplexTableIdColumnName = \\"id\\"
      export const ComplexTableNameColumnName = \\"name\\"
      export const ComplexTableNullableColumnName = \\"nullable\\"
      export const ComplexTableCreatedAtColumnName = \\"created_at\\"
      export const ComplexTableCreatedOnColumnName = \\"created_on\\"

      export type ComplexTable = {
        id: ComplexTableId
        name: ComplexTableName
        nullable: ComplexTableNullable
        created_at: ComplexTableCreatedAt
        created_on: ComplexTableCreatedOn
      }

      export const ComplexTableName = \\"complex\\"

      export const ComplexTableColumnNames = {
        id: ComplexTableIdColumnName,
        name: ComplexTableNameColumnName,
        nullable: ComplexTableNullableColumnName,
        created_at: ComplexTableCreatedAtColumnName,
        created_on: ComplexTableCreatedOnColumnName
      } as const

      export type RequestsTableName = string
      export type RequestsTableUrl = string
      export type RequestsTableIntegrationType = \\"destination\\" | \\"source\\"

      export const RequestsTableNameColumnName = \\"name\\"
      export const RequestsTableUrlColumnName = \\"url\\"
      export const RequestsTableIntegrationTypeColumnName = \\"integration_type\\"

      export type RequestsTable = {
        name: RequestsTableName
        url: RequestsTableUrl
        integration_type: RequestsTableIntegrationType
      }

      export const RequestsTableName = \\"requests\\"

      export const RequestsTableColumnNames = {
        name: RequestsTableNameColumnName,
        url: RequestsTableUrlColumnName,
        integration_type: RequestsTableIntegrationTypeColumnName
      } as const
      "
    `)
  })
})
