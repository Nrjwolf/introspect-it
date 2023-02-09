#! /usr/bin/env node
import yargs = require("yargs/yargs");
import { hideBin } from "yargs/helpers";
import { exportTable, inferSchema, inferTable } from "../src";

const main = (): void => {
  yargs(hideBin(process.argv))
    .options({
      connection: { type: "string", default: process.env.DATABASE_URL },
      toCamelCase: { type: "boolean", default: process.env.CAMEL_CASE === "true" || false },
      useQuotes: { type: "boolean", default: process.env.USE_QUOTES === "true" || false }
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
          .positional("primaryKey", {
            describe: "primary key of table",
            default: "id",
            type: "string"
          });
      },
      argv => {
        const { table, connection, primaryKey } = argv;

        if (!connection || !table) {
          throw new Error(`Table and db are required`);
        }

        exportTable(connection, table, primaryKey)
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
        return yargs.positional("table", {
          describe: "table to export",
          type: "string"
        });
      },
      argv => {
        const { table, connection, toCamelCase, useQuotes } = argv;

        if (!connection) {
          throw new Error(`Table and pgConnection are required`);
        }

        if (table) {
          inferTable(connection, table, toCamelCase, useQuotes)
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

        inferSchema(connection, toCamelCase, useQuotes)
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

main();
