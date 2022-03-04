# introspect-it

> Convert Postgres schemas into TypeScript types

# Usage

```bash
# to infer an entire schema
$ npx introspec-it postgresql://postgres@localhost:5433/db?currentSchema=public

# to infer a specific table
$ npx introspec-it postgresql://postgres@localhost:5433/db?currentSchema=public table_name

# to infer an entire schema with envs
$ DATABASE_URL=postgresql://postgres@localhost:5433/db?currentSchema=public npx introspec-it

# to infer a specific table with envs
$ DATABASE_URL=postgresql://postgres@localhost:5433/db?currentSchema=public TABLE_NAME=table_name npx introspec-it
```

tip: You can pipe the output of introspec-it into a file with `npx introspec-it <args> > schema.ts`

## Demo

For the following SQL schema:

```sql
CREATE TABLE account (
  username VARCHAR (50) UNIQUE NOT NULL,
  password VARCHAR (50) NOT NULL,
  email VARCHAR (355) UNIQUE NOT NULL,
  created_on TIMESTAMP NOT NULL,
  last_login TIMESTAMP
)
```

run:

```bash
$ npx introspec-it postgresql://postgres@localhost:5433/db?currentSchema=public
```

```typescript
export type Account = {
  username: string
  password: string
  email: string
  created_on: Date
  last_login: Date | null
}
```

## Using `introspec-it` programatically

```typescript
import { inferSchema, inferTable } from 'introspec-it'

await inferSchema(connectionString)
await inferTable(connectionString, tableName)
```

## Design

introspec-it is inpired by the awesome [schemats](https://github.com/SweetIQ/schemats) library.
But takes a simpler, more blunt, and configuration free approach:

- Simpler defaults
- Postgres support only
- Inline enums
- No support for namespaces

## License (MIT)

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
