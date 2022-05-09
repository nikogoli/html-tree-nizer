/** @jsx h */
import { h, useState} from "../client_deps.ts"
import { tw } from "https://esm.sh/twind"


type TextWithBool = {
  display: boolean,
  text: string
}


export default function TreeArea(prop: {data: Array<{type:string, texts:Array<TextWithBool>}>}) {

  const keys = prop.data.map(x => x.type)

  const [ button_idx, setButtonIdx ] = useState(0)
  const active_key = keys[button_idx]
  const act = prop.data.find(x => x.type == active_key)
  const lines = (act) ? act.texts : [{display: true, text:"not found"}]
  const [ showlimit, setShowlimit ] = useState(true)

  const shown_lines = (showlimit)
    ? lines.filter( line => line.display).map(line => line.text)
    : lines.map(line => line.text)


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
      const idx = keys.findIndex(x => x == value)
      if (idx != button_idx){ setButtonIdx(idx) }
    }
  }


  const area_base = "grid grid-cols-4"
  const button_grid = "col-span-1 h-8 mr-1 rounded-t-lg border-solid bg-sky-800 text-center"
  const text_area = "col-start-1 col-span-full h-128 overflow-x-auto overflow-y-auto font-code border-solid border-4 border-orange-800"

  return (
    <div class={tw`${area_base}`}>
      {keys.map(t => 
        <div class={tw`${button_grid}`}>
          <button value={t} onClick={(e) => lines_by_key(e.target)} class={tw`mt-1 ${(t==active_key) ? "text-orange-300" : "text-white"}`}>{t}</button>
        </div>
      )}
      <div class={tw`flex ml-6`}>
        <span class={tw`mr-2`}>詳細表示</span>
        <input type="checkbox" onClick={() => setShowlimit(!showlimit)} value={String(showlimit)} class={tw`w-12 h-6 checked:sibling:bg-sky-500 checked:sibling:sibling:translate-x-6 checked:sibling:sibling:border-sky-500 cursor-pointer`} />
        <span class={tw`w-12 h-6 -ml-12 bg-gray-500 rounded-full pointer-events-none`}></span>
        <span class={tw`w-6 h-6 -ml-12 rounded-full bg-white border-1 border-gray-500 transition pointer-events-none`}></span>
      </div>
      <div class={tw`${text_area}`}>
        {shown_lines.map( (t, idx) => colored_text(t, idx))}
      </div>
    </div>
  )
}

