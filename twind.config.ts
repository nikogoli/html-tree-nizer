import { Options } from "$fresh/plugins/twind.ts";
//export * from "twind";
import * as colors from "twind/colors"

const neutral = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#e5e5e5",
  300: "#d4d4d4",
  400: "#a3a3a3",// 163
  500: "#7d7d7d",// 125
  530: "#6a6a6a",// 106
  550: "#5d5d5d",// 93
  600: "#525252",// 82
  700: "#404040",// 64
  800: "#262626",// 38
  850: "#202020",// 30
  900: "#171717"// 23
} as const

export default {
  selfURL: import.meta.url,
  theme: {
    colors: {
      black: colors.black,
      bg_black: 'rgba(0, 0, 0, 0.8)',
      gray: colors.gray,
      sky: colors.sky,
      white: colors.white,
      orange: colors.orange,
      lime: colors.lime,
      neutral: neutral
    },
    fontFamily:{
      magic: ['"Yusei Magic"'],
      klee: ['"Klee One"'],
    },
    extend: {
      spacing: {
        '128': '32rem',
      }
    }
  }
} as Options;