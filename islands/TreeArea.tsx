/** @jsx h */
import { h, useState, useEffect, useRef } from "../client_deps.ts"
import { tw } from "https://esm.sh/twind"



export default function TreeArea(prop: {texts:Record<string, Array<string>>}) {


  const keys = ([...Object.keys(prop.texts)].length > 1)
    ? [...Object.keys(prop.texts)].filter(t => t != "default")
    : ["default"]
  const [ active_key, setActivekey ] = useState(keys[0])
  const [ lines, setLines ] = useState(prop.texts[active_key])
  

  function colored_text(
    text: string,
    idx: number,
  ){
    const tw_class = (idx == 0) ? "p-0 mt-2 ml-4 whitespace-pre" : "p-0 ml-4 my-0 whitespace-pre"
    const matched = text.match(/(.+?)(class=".+?")(.*)/)
    if (matched === null){
      return <p class={tw`${tw_class}`} >{text}</p>
    } else {
      const [pre_tx, class_tx, other_tx] = matched.slice(1)
      return <p class={tw`${tw_class}`} >{pre_tx}<span class={tw`text-green-700`}>{class_tx}</span>{other_tx}</p>
    }
  }


  function lines_by_key(
    ev: EventTarget | null
  ){
    if (ev === null){ return }
    const { value } = (ev as EventTarget&{"value": string|undefined})
    if (value !== undefined && value != active_key && keys.includes(value)){
      setActivekey(value)
      setLines(prop.texts[value])
    }
  }

  const base = "grid grid-cols-4 mx-8 mt-4"
  const button_grid = "col-span-1 h-8 mr-1 rounded-t-lg border-solid bg-sky-800 text-center"
  const text_area = "col-start-1 col-span-full h-128 overflow-x-auto overflow-y-auto font-code border-solid border-4 border-orange-800"

  return (
    <div class={tw`${base}`}>
      {keys.map(t => 
        <div class={tw`${button_grid}`}>
          <button value={t} onClick={(e) => lines_by_key(e.target)} class={tw`mt-1 ${(t==active_key) ? "text-orange-300" : "text-white"}`}>{t}</button>
        </div>
      )}
      <div class={tw`${text_area}`}>
        {lines.map( (t, idx) => colored_text(t, idx))}
      </div>
    </div>
  )
}

