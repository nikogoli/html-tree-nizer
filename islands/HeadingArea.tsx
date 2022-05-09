/** @jsx h */
import { h, useState} from "../client_deps.ts"
import { tw } from "https://esm.sh/twind"



export default function HeadingArea(prop: {dict: Record<string, Array<string>>}) {

  const [ heading, setHeading ] = useState("H1")

  const base = "grid grid-cols-6 mt-2"
  const forcus_tx = "focus:outline-none focus:ring-2 focus:ring-orange-700"
  const border_base = "bg-white border-orange-300 border-solid border-2"


  function set_value(
    ev: EventTarget | null,
    act_val: string,
    func: ( val: string) => void,
  ){
    if (ev === null){ return }
    const { value } = (ev as EventTarget&{"value": string|undefined})
    if (value !== undefined && value != act_val){
      func(value)
    }
  }


  return (
    <div class={tw`${base}`}>
      <p class={tw`col-start-1 col-span-1 my-2`}>見出し</p>
      <select name="heading" value={heading} onChange={(e) => set_value(e.target, heading, setHeading)} class={tw`col-start-2 col-span-1 my-1 w-16 h-9 rounded-md ${border_base} ${forcus_tx}`}>
        <option value="H1" selected> H1 </option>
        <option value="H2"> H2 </option>
      </select>
      <h3 class={tw`col-start-1 col-span-1 mt-0 text-sky-700`} > {heading} </h3>
      <div class={tw`col-span-5`}>
        {prop.dict[heading].map((name) => <div class={tw`mb-1`}><label><input type="radio" name="title"/><span> {name}</span></label></div>)}
      </div>
    </div>
  )
}

