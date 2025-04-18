import { Postgres } from "../src/pg-client";
import { inferTable, inferSchema, exportTable } from "../src";
import { SQL as sql } from "sql-template-strings";

const connectionString = "postgresql://postgres:password@localhost:5433/db?currentSchema=public";
const pg = new Postgres(connectionString);

const account = sql`
  DROP TABLE IF EXISTS account;
  CREATE TABLE account (
    username VARCHAR (50) UNIQUE NOT NULL,
    password VARCHAR (50) NOT NULL,
    email VARCHAR (355) UNIQUE NOT NULL,
    "2a" integer NOT NULL,
    created_on TIMESTAMP NOT NULL,
    last_login TIMESTAMP
  );
`;

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
    integration_type integration_type_enum NOT NULL,
    some_int integer
  );

  INSERT INTO requests(name, url, integration_type, some_int) VALUES ('first', 'is-url', 'source', 10);
  INSERT INTO requests(name, url, integration_type, some_int) VALUES ('second', 'the-url', 'destination', 20);
`;

const complex = sql`
  DROP TABLE IF EXISTS complex;
  CREATE TABLE complex (
    id json NOT NULL,
    name varchar(255) NOT NULL,
    nullable varchar(255),
    created_at timestamp,
    created_on date NOT NULL
  )
`;

beforeAll(async () => {
  await pg.query(account);
  await pg.query(requests);
  await pg.query(complex);
});

describe("inferTable", () => {
  it("infers a table", async () => {
    const code = await inferTable(connectionString, "account", [], true, true);
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export const SchemaName = \\"public\\" as const;

      export type AccountTable2aColumn = number;
      export type AccountTableCreatedOnColumn = Date;
      export type AccountTableEmailColumn = string;
      export type AccountTableLastLoginColumn = Date | null;
      export type AccountTablePasswordColumn = string;
      export type AccountTableUsernameColumn = string;

      export type AccountTable = {
        \\"2a\\": AccountTable2aColumn;
        createdOn: AccountTableCreatedOnColumn;
        email: AccountTableEmailColumn;
        lastLogin: AccountTableLastLoginColumn;
        password: AccountTablePasswordColumn;
        username: AccountTableUsernameColumn;
      };

      export const AccountTableName = \\"account\\" as const;

      export const AccountTable2aColumnName = \`\\"2a\\"\` as const;
      export const AccountTableCreatedOnColumnName = \`\\"created_on\\"\` as const;
      export const AccountTableEmailColumnName = \`\\"email\\"\` as const;
      export const AccountTableLastLoginColumnName = \`\\"last_login\\"\` as const;
      export const AccountTablePasswordColumnName = \`\\"password\\"\` as const;
      export const AccountTableUsernameColumnName = \`\\"username\\"\` as const;

      export const AccountTableColumnNames = {
        \\"2a\\": AccountTable2aColumnName,
        createdOn: AccountTableCreatedOnColumnName,
        email: AccountTableEmailColumnName,
        lastLogin: AccountTableLastLoginColumnName,
        password: AccountTablePasswordColumnName,
        username: AccountTableUsernameColumnName
      } as const;
      "
    `);
  });

  it("works with enums", async () => {
    const code = await inferTable(connectionString, "requests", [], true);
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export const SchemaName = \\"public\\" as const;

      export type RequestsTableIntegrationTypeColumn = \\"destination\\" | \\"source\\";
      export type RequestsTableNameColumn = string;
      export type RequestsTableSomeIntColumn = number | null;
      export type RequestsTableUrlColumn = string;

      export type RequestsTable = {
        integrationType: RequestsTableIntegrationTypeColumn;
        name: RequestsTableNameColumn;
        someInt: RequestsTableSomeIntColumn;
        url: RequestsTableUrlColumn;
      };

      export const RequestsTableName = \\"requests\\" as const;

      export const RequestsTableIntegrationTypeColumnName = \\"integration_type\\" as const;
      export const RequestsTableNameColumnName = \\"name\\" as const;
      export const RequestsTableSomeIntColumnName = \\"some_int\\" as const;
      export const RequestsTableUrlColumnName = \\"url\\" as const;

      export const RequestsTableColumnNames = {
        integrationType: RequestsTableIntegrationTypeColumnName,
        name: RequestsTableNameColumnName,
        someInt: RequestsTableSomeIntColumnName,
        url: RequestsTableUrlColumnName
      } as const;
      "
    `);
  });

  it("works with complex types", async () => {
    const code = await inferTable(connectionString, "complex", [], true);
    expect(code).toMatchInlineSnapshot(`
      "export type JSONPrimitive = string | number | boolean | null;
      export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
      export type JSONObject = { [member: string]: JSONValue };
      export type JSONArray = Array<JSONValue>;

      /* tslint:disable */
      /* eslint-disable */

      export const SchemaName = \\"public\\" as const;

      export type ComplexTableCreatedAtColumn = Date | null;
      export type ComplexTableCreatedOnColumn = Date;
      export type ComplexTableIdColumn = JSONValue;
      export type ComplexTableNameColumn = string;
      export type ComplexTableNullableColumn = string | null;

      export type ComplexTable = {
        createdAt: ComplexTableCreatedAtColumn;
        createdOn: ComplexTableCreatedOnColumn;
        id: ComplexTableIdColumn;
        name: ComplexTableNameColumn;
        nullable: ComplexTableNullableColumn;
      };

      export const ComplexTableName = \\"complex\\" as const;

      export const ComplexTableCreatedAtColumnName = \\"created_at\\" as const;
      export const ComplexTableCreatedOnColumnName = \\"created_on\\" as const;
      export const ComplexTableIdColumnName = \\"id\\" as const;
      export const ComplexTableNameColumnName = \\"name\\" as const;
      export const ComplexTableNullableColumnName = \\"nullable\\" as const;

      export const ComplexTableColumnNames = {
        createdAt: ComplexTableCreatedAtColumnName,
        createdOn: ComplexTableCreatedOnColumnName,
        id: ComplexTableIdColumnName,
        name: ComplexTableNameColumnName,
        nullable: ComplexTableNullableColumnName
      } as const;
      "
    `);
  });
});

describe("inferSchema", () => {
  it("infers all tables at once", async () => {
    const code = await inferSchema(connectionString, [], [], true, true);
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export const SchemaName = \\"public\\" as const;

      export type JSONPrimitive = string | number | boolean | null;
      export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
      export type JSONObject = { [member: string]: JSONValue };
      export type JSONArray = Array<JSONValue>;

      export type AccountTable2aColumn = number;
      export type AccountTableCreatedOnColumn = Date;
      export type AccountTableEmailColumn = string;
      export type AccountTableLastLoginColumn = Date | null;
      export type AccountTablePasswordColumn = string;
      export type AccountTableUsernameColumn = string;

      export type AccountTable = {
        \\"2a\\": AccountTable2aColumn;
        createdOn: AccountTableCreatedOnColumn;
        email: AccountTableEmailColumn;
        lastLogin: AccountTableLastLoginColumn;
        password: AccountTablePasswordColumn;
        username: AccountTableUsernameColumn;
      };

      export const AccountTableName = \\"account\\" as const;

      export const AccountTable2aColumnName = \`\\"2a\\"\` as const;
      export const AccountTableCreatedOnColumnName = \`\\"created_on\\"\` as const;
      export const AccountTableEmailColumnName = \`\\"email\\"\` as const;
      export const AccountTableLastLoginColumnName = \`\\"last_login\\"\` as const;
      export const AccountTablePasswordColumnName = \`\\"password\\"\` as const;
      export const AccountTableUsernameColumnName = \`\\"username\\"\` as const;

      export const AccountTableColumnNames = {
        \\"2a\\": AccountTable2aColumnName,
        createdOn: AccountTableCreatedOnColumnName,
        email: AccountTableEmailColumnName,
        lastLogin: AccountTableLastLoginColumnName,
        password: AccountTablePasswordColumnName,
        username: AccountTableUsernameColumnName
      } as const;

      export type ComplexTableCreatedAtColumn = Date | null;
      export type ComplexTableCreatedOnColumn = Date;
      export type ComplexTableIdColumn = JSONValue;
      export type ComplexTableNameColumn = string;
      export type ComplexTableNullableColumn = string | null;

      export type ComplexTable = {
        createdAt: ComplexTableCreatedAtColumn;
        createdOn: ComplexTableCreatedOnColumn;
        id: ComplexTableIdColumn;
        name: ComplexTableNameColumn;
        nullable: ComplexTableNullableColumn;
      };

      export const ComplexTableName = \\"complex\\" as const;

      export const ComplexTableCreatedAtColumnName = \`\\"created_at\\"\` as const;
      export const ComplexTableCreatedOnColumnName = \`\\"created_on\\"\` as const;
      export const ComplexTableIdColumnName = \`\\"id\\"\` as const;
      export const ComplexTableNameColumnName = \`\\"name\\"\` as const;
      export const ComplexTableNullableColumnName = \`\\"nullable\\"\` as const;

      export const ComplexTableColumnNames = {
        createdAt: ComplexTableCreatedAtColumnName,
        createdOn: ComplexTableCreatedOnColumnName,
        id: ComplexTableIdColumnName,
        name: ComplexTableNameColumnName,
        nullable: ComplexTableNullableColumnName
      } as const;

      export type RequestsTableIntegrationTypeColumn = \\"destination\\" | \\"source\\";
      export type RequestsTableNameColumn = string;
      export type RequestsTableSomeIntColumn = number | null;
      export type RequestsTableUrlColumn = string;

      export type RequestsTable = {
        integrationType: RequestsTableIntegrationTypeColumn;
        name: RequestsTableNameColumn;
        someInt: RequestsTableSomeIntColumn;
        url: RequestsTableUrlColumn;
      };

      export const RequestsTableName = \\"requests\\" as const;

      export const RequestsTableIntegrationTypeColumnName = \`\\"integration_type\\"\` as const;
      export const RequestsTableNameColumnName = \`\\"name\\"\` as const;
      export const RequestsTableSomeIntColumnName = \`\\"some_int\\"\` as const;
      export const RequestsTableUrlColumnName = \`\\"url\\"\` as const;

      export const RequestsTableColumnNames = {
        integrationType: RequestsTableIntegrationTypeColumnName,
        name: RequestsTableNameColumnName,
        someInt: RequestsTableSomeIntColumnName,
        url: RequestsTableUrlColumnName
      } as const;
      "
    `);
  });
  it("infers all tables except ignored", async () => {
    const code = await inferSchema(connectionString, ["account"], [], true, true);
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export const SchemaName = \\"public\\" as const;

      export type JSONPrimitive = string | number | boolean | null;
      export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
      export type JSONObject = { [member: string]: JSONValue };
      export type JSONArray = Array<JSONValue>;

      export type ComplexTableCreatedAtColumn = Date | null;
      export type ComplexTableCreatedOnColumn = Date;
      export type ComplexTableIdColumn = JSONValue;
      export type ComplexTableNameColumn = string;
      export type ComplexTableNullableColumn = string | null;

      export type ComplexTable = {
        createdAt: ComplexTableCreatedAtColumn;
        createdOn: ComplexTableCreatedOnColumn;
        id: ComplexTableIdColumn;
        name: ComplexTableNameColumn;
        nullable: ComplexTableNullableColumn;
      };

      export const ComplexTableName = \\"complex\\" as const;

      export const ComplexTableCreatedAtColumnName = \`\\"created_at\\"\` as const;
      export const ComplexTableCreatedOnColumnName = \`\\"created_on\\"\` as const;
      export const ComplexTableIdColumnName = \`\\"id\\"\` as const;
      export const ComplexTableNameColumnName = \`\\"name\\"\` as const;
      export const ComplexTableNullableColumnName = \`\\"nullable\\"\` as const;

      export const ComplexTableColumnNames = {
        createdAt: ComplexTableCreatedAtColumnName,
        createdOn: ComplexTableCreatedOnColumnName,
        id: ComplexTableIdColumnName,
        name: ComplexTableNameColumnName,
        nullable: ComplexTableNullableColumnName
      } as const;

      export type RequestsTableIntegrationTypeColumn = \\"destination\\" | \\"source\\";
      export type RequestsTableNameColumn = string;
      export type RequestsTableSomeIntColumn = number | null;
      export type RequestsTableUrlColumn = string;

      export type RequestsTable = {
        integrationType: RequestsTableIntegrationTypeColumn;
        name: RequestsTableNameColumn;
        someInt: RequestsTableSomeIntColumn;
        url: RequestsTableUrlColumn;
      };

      export const RequestsTableName = \\"requests\\" as const;

      export const RequestsTableIntegrationTypeColumnName = \`\\"integration_type\\"\` as const;
      export const RequestsTableNameColumnName = \`\\"name\\"\` as const;
      export const RequestsTableSomeIntColumnName = \`\\"some_int\\"\` as const;
      export const RequestsTableUrlColumnName = \`\\"url\\"\` as const;

      export const RequestsTableColumnNames = {
        integrationType: RequestsTableIntegrationTypeColumnName,
        name: RequestsTableNameColumnName,
        someInt: RequestsTableSomeIntColumnName,
        url: RequestsTableUrlColumnName
      } as const;
      "
    `);
  });
  it("infers all tables columns tables except ignored", async () => {
    const code = await inferSchema(connectionString, ["account"], ["complex.name"], true, true);
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export const SchemaName = \\"public\\" as const;

      export type JSONPrimitive = string | number | boolean | null;
      export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
      export type JSONObject = { [member: string]: JSONValue };
      export type JSONArray = Array<JSONValue>;

      export type ComplexTableCreatedAtColumn = Date | null;
      export type ComplexTableCreatedOnColumn = Date;
      export type ComplexTableIdColumn = JSONValue;
      export type ComplexTableNullableColumn = string | null;

      export type ComplexTable = {
        createdAt: ComplexTableCreatedAtColumn;
        createdOn: ComplexTableCreatedOnColumn;
        id: ComplexTableIdColumn;
        nullable: ComplexTableNullableColumn;
      };

      export const ComplexTableName = \\"complex\\" as const;

      export const ComplexTableCreatedAtColumnName = \`\\"created_at\\"\` as const;
      export const ComplexTableCreatedOnColumnName = \`\\"created_on\\"\` as const;
      export const ComplexTableIdColumnName = \`\\"id\\"\` as const;
      export const ComplexTableNullableColumnName = \`\\"nullable\\"\` as const;

      export const ComplexTableColumnNames = {
        createdAt: ComplexTableCreatedAtColumnName,
        createdOn: ComplexTableCreatedOnColumnName,
        id: ComplexTableIdColumnName,
        nullable: ComplexTableNullableColumnName
      } as const;

      export type RequestsTableIntegrationTypeColumn = \\"destination\\" | \\"source\\";
      export type RequestsTableNameColumn = string;
      export type RequestsTableSomeIntColumn = number | null;
      export type RequestsTableUrlColumn = string;

      export type RequestsTable = {
        integrationType: RequestsTableIntegrationTypeColumn;
        name: RequestsTableNameColumn;
        someInt: RequestsTableSomeIntColumn;
        url: RequestsTableUrlColumn;
      };

      export const RequestsTableName = \\"requests\\" as const;

      export const RequestsTableIntegrationTypeColumnName = \`\\"integration_type\\"\` as const;
      export const RequestsTableNameColumnName = \`\\"name\\"\` as const;
      export const RequestsTableSomeIntColumnName = \`\\"some_int\\"\` as const;
      export const RequestsTableUrlColumnName = \`\\"url\\"\` as const;

      export const RequestsTableColumnNames = {
        integrationType: RequestsTableIntegrationTypeColumnName,
        name: RequestsTableNameColumnName,
        someInt: RequestsTableSomeIntColumnName,
        url: RequestsTableUrlColumnName
      } as const;
      "
    `);
  });
});

describe("exportTable", () => {
  it("export table data", async () => {
    const code = await exportTable(connectionString, "requests", [], "name");
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export type RequestsTableData = typeof RequestsTableData;
      export const RequestsTableData = {
        first: {
          name: \\"first\\",
          url: \\"is-url\\",
          integrationType: \\"source\\",
          someInt: 10
        },
        second: {
          name: \\"second\\",
          url: \\"the-url\\",
          integrationType: \\"destination\\",
          someInt: 20
        }
      } as const;

      export type RequestsTableDataPrimaryKeys = typeof RequestsTableDataPrimaryKeys[number];
      export const RequestsTableDataPrimaryKeys = [\\"first\\", \\"second\\"] as const;
      "
    `);
  });
  it("export table data without ignored columns", async () => {
    const code = await exportTable(connectionString, "requests", ["url"], "name");
    expect(code).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */

      export type RequestsTableData = typeof RequestsTableData;
      export const RequestsTableData = {
        first: {
          name: \\"first\\",
          integrationType: \\"source\\",
          someInt: 10
        },
        second: {
          name: \\"second\\",
          integrationType: \\"destination\\",
          someInt: 20
        }
      } as const;

      export type RequestsTableDataPrimaryKeys = typeof RequestsTableDataPrimaryKeys[number];
      export const RequestsTableDataPrimaryKeys = [\\"first\\", \\"second\\"] as const;
      "
    `);
  });
});
