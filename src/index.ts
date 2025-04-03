import { exportTableDataToTs, tableToTS } from "./typescript";
import { Postgres } from "./pg-client";
import { format } from "prettier";
import { SQL as sql } from "sql-template-strings";

const JSONHeader = `
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

`;

const JSONHeaderNotNull = `
export type JSONPrimitive = string | number | boolean;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

`;

const linterDisableHeader = `/* tslint:disable */
/* eslint-disable */\n`;

const header = (includesJSON: boolean, nullableJson: boolean): string =>
  includesJSON ? (nullableJson ? JSONHeader : JSONHeaderNotNull) : "";

function pretty(code: string): string {
  return format(code, {
    parser: "typescript",
    semi: true,
    singleQuote: false,
    printWidth: 120
  });
}

export async function inferTable(
  connectionString: string,
  table: string,
  ignoreColumns: string[] = [],
  toCamelCase = false,
  useQuotes = false,
  nullableJson = true
): Promise<string> {
  const db = new Postgres(connectionString);
  const code = tableToTS(table, await db.table(table), ignoreColumns, toCamelCase, useQuotes);
  const fullCode = `
    ${header(code.includes("JSONValue"), nullableJson)}
    ${linterDisableHeader}
    export const SchemaName = "${db.schema()}" as const
    ${code}
  `;
  return pretty(fullCode);
}

export async function inferSchema(
  connectionString: string,
  ignoreTables: string[] = [],
  ignoreColumns: string[] = [],
  toCamelCase = false,
  useQuotes = false,
  nullableJson = true
): Promise<string> {
  const db = new Postgres(connectionString);
  const tables = await db.allTables();
  const interfaces = tables
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(table => !ignoreTables.includes(table.name))
    .map(table => tableToTS(table.name, table.table, ignoreColumns, toCamelCase, useQuotes));
  const code = [
    header(
      interfaces.some(i => i.includes("JSONValue")),
      nullableJson
    ),
    ...interfaces
  ].join("\n");
  return pretty(`
  ${linterDisableHeader}
  export const SchemaName = "${db.schema()}" as const
  ${code}`);
}

export async function exportTable(
  connectionString: string,
  table: string,
  ignoreColumns: string[] = [],
  primaryKey = "id",
  nullableJson: boolean
): Promise<string> {
  const db = new Postgres(connectionString);

  const code = exportTableDataToTs(table, await db.query(sql`SELECT * FROM `.append(table)), ignoreColumns, primaryKey);
  const fullCode = `
    ${header(code.includes("JSONValue"), nullableJson)}
    ${linterDisableHeader}
    ${code}
  `;
  return pretty(fullCode);
}
