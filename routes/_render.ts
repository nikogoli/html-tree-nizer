// This module adds twind support.
import { setup } from "https://esm.sh/twind"
import { theme } from "../client_deps.ts"
import { RenderContext, RenderFn } from "../server_deps.ts"
import { virtualSheet } from "https://esm.sh/twind/sheets"



const sheet = virtualSheet()
sheet.reset()
setup({ sheet, theme, preflight: false, })

export function render(ctx: RenderContext, render: RenderFn) {
  const snapshot = ctx.state.get("twindSnapshot") as unknown[] | null
  sheet.reset(snapshot || undefined)
  render()
  ctx.styles.splice(0, ctx.styles.length, ...(sheet).target)
  const newSnapshot = sheet.reset()
  ctx.state.set("twindSnapshot", newSnapshot)
}
