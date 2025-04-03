#! /usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { exportTable, inferSchema, inferTable } from "../src";

const main = async (): Promise<void> => {
  await yargs(hideBin(process.argv))
    .options({
      connection: { type: "string", default: process.env.DATABASE_URL },
      toCamelCase: { type: "boolean", default: process.env.CAMEL_CASE === "true" || false },
      useQuotes: { type: "boolean", default: process.env.USE_QUOTES === "true" || false },
      nullableJson: { type: "boolean", default: process.env.NULLABLE_JSON === "true" || true }
    })
    .command(
      "export [table] [primaryKey]",
      "export table",
      yargs => {
        return yargs
          .positional("table", {
            describe: "table to export",
            type: "string"
          })
          .options({
            ignoreColumns: { type: "array", default: [] }
          })
          .positional("primaryKey", {
            describe: "primary key of table",
            default: "id",
            type: "string"
          });
      },
      argv => {
        const { table, connection, primaryKey, ignoreColumns, nullableJson } = argv;

        if (!connection || !table) {
          throw new Error(`Table and db are required`);
        }

        exportTable(
          connection,
          table,
          ignoreColumns.map(v => `${v}`),
          primaryKey,
          nullableJson
        )
          .then(code => {
            console.log(code);
            process.exit();
          })
          .catch(err => {
            console.error(err);
            process.exit(1);
          });
      }
    )
    .command(
      "infer [table]",
      "infer table",
      yargs => {
        return yargs
          .positional("table", {
            describe: "table to export",
            type: "string"
          })
          .options({
            ignoreTables: { type: "array", default: [] },
            ignoreColumns: { type: "array", default: [] }
          });
      },
      argv => {
        const { table, connection, toCamelCase, useQuotes, nullableJson } = argv;

        if (!connection) {
          throw new Error(`Table and pgConnection are required`);
        }

        if (table) {
          inferTable(
            connection,
            table,
            argv.ignoreColumns.map(v => `${v}`),
            toCamelCase,
            useQuotes,
            nullableJson
          )
            .then(code => {
              console.log(code);
              process.exit();
            })
            .catch(err => {
              console.error(err);
              process.exit(1);
            });
          return;
        }

        inferSchema(
          connection,
          argv.ignoreTables.map(v => `${v}`),
          argv.ignoreColumns.map(v => `${v}`),
          toCamelCase,
          useQuotes,
          nullableJson
        )
          .then(code => {
            console.log(code);
            process.exit();
          })
          .catch(err => {
            console.error(err);
            process.exit(1);
          });
      }
    )
    .parse();
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
