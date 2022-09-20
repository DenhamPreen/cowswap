/* eslint-disable @typescript-eslint/no-var-requires */
/* This script adds necessary export of Uniswap abis/types
   to the end of auto-generated abis/types/index.ts file */
const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../src/uniswap-override/abis/types/index.ts')
const output = 'export * from "@uni_src/abis/types";\n'

fs.appendFile(file, output, function (err) {
  if (err) {
    throw err
  }

  console.log('Successfully added contracts export script!')
})
