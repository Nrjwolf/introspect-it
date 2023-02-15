import { camelCase } from "./camelcase";

export interface Column {
  udtName: string;
  nullable: boolean;
  tsType?: string;
}

export interface Table {
  [columnName: string]: Column;
}

// function normalize(name: string): string {
//   const reservedKeywords = ['string', 'number', 'package']
//   if (reservedKeywords.includes(name)) {
//     return name + '_'
//   } else {
//     return name
//   }
// }

const typeColumnName = (tableName: string, columnName: string): string => {
  return `${tableName}${camelCase(columnName, { pascalCase: true, preserveConsecutiveUppercase: true })}Column`;
};

export function tableToTS(name: string, table: Table, toCamelCase: boolean, useQuotes: boolean): string {
  const tableName = camelCase(name, { pascalCase: true }) + "Table";
  const prefixQuoteSymbol = useQuotes ? '`"' : '"';
  const postfixQuoteSymbol = useQuotes ? '"`' : '"';

  const fields = Object.keys(table).map(column => {
    const type = table[column].tsType;
    const nullable = table[column].nullable ? " | null" : "";
    return `export type ${typeColumnName(tableName, column)} = ${type}${nullable};\n`;
  });

  const columnNames = Object.keys(table).map(column => {
    return `export const ${typeColumnName(
      tableName,
      column
    )}Name = ${prefixQuoteSymbol}${column}${postfixQuoteSymbol} as const;\n`;
  });

  const members = Object.keys(table).map(column => {
    return `"${toCamelCase ? camelCase(column, { preserveConsecutiveUppercase: true }) : column}": ${typeColumnName(
      tableName,
      column
    )}\n`;
  });

  const columnNamesObj = Object.keys(table).map(column => {
    return `"${toCamelCase ? camelCase(column, { preserveConsecutiveUppercase: true }) : column}": ${typeColumnName(
      tableName,
      column
    )}Name,\n`;
  });

  return `
    ${fields.join("")}
    export type ${tableName} = {
      ${members.join("")}
    }\n
    export const ${tableName}Name = "${name}" as const;\n
    ${columnNames.join("")}\n
    export const ${tableName}ColumnNames = {
      ${columnNamesObj.join("")}
    } as const\n
  `;
}

export const exportTableDataToTs = (name: string, rows: Record<any, any>[], primaryKey: string): string => {
  const tableName = camelCase(name, { pascalCase: true }) + "Table";

  const values = rows.map(item => {
    const objKeysAndValues = Object.entries(item).reduce((acc, cur) => {
      const [key, val] = cur;

      acc += `"${camelCase(key, { preserveConsecutiveUppercase: true })}": ${JSON.stringify(val)},\n`;

      return acc;
    }, "");

    return `"${item[primaryKey]}": {\n ${objKeysAndValues} },`;
  });

  const primaryKeys = rows.reduce((acc, cur) => {
    return acc + `${JSON.stringify(cur[primaryKey])},\n`;
  }, "");

  return `
  export type ${tableName}Data = typeof ${tableName}Data;
  export const ${tableName}Data = {
    ${values.join("\n")}
  } as const;\n
  
  export type ${tableName}DataPrimaryKeys = (typeof ${tableName}DataPrimaryKeys)[number]
  export const ${tableName}DataPrimaryKeys = [\n${primaryKeys}\n] as const;\n`;
};
