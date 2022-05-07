export * from "https://raw.githubusercontent.com/lucacasonato/fresh/main/runtime.ts";

import { IS_BROWSER } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/runtime.ts"
import { setup } from "https://esm.sh/twind"
import * as colors from "https://esm.sh/twind/colors"

export const theme = {
    colors: {
      black: colors.black,
      gray: colors.gray,
      green: colors.green,
      white: colors.white,
      orange: colors.orange,
      sky: colors.sky,
    },
    fontFamily:{
      code: ['"Overpass Mono"'],
      body: ['"RocknRoll One"']
    },
    extend: {
      spacing: {
        '128': '32rem',
      }
    }
  }
  
  if (IS_BROWSER) {
    setup({ theme: { colors }, })
  }
