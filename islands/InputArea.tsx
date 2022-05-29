/** @jsx h */
import { h, useState, useRef, useEffect } from "../client_deps.ts"
import { tw } from "https://esm.sh/twind"

import TreeArea from "./TreeArea.tsx"
import HeadingArea  from "./HeadingArea.tsx"
import PostArea from "./PostArea.tsx"

type TextWithBool = {
  display: boolean,
  text: string
}

type EnvData = {
  URL_PREFIX: string;
  USER_TOKEN: string;
  TARGET_ID: string;
}

type ElementData = {
  id: string,
  tag: string,
  class_name: string,
  id_text: string,
  depth: number,
  children: Array<string>
}

type ParsedResult = {
  headings: Record<string, Array<string>>,
  elem_datas: Record<string, ElementData>,
  root_ids: Record<string, Array<string>>,
  html: string,
  env_data: EnvData,
}


function create_item(
  id: string,
  has_next: boolean,
  index: number,
  dict: Record<string, ElementData>,
  texts: Array<TextWithBool> = [],
  blanks = "",
  display = true,
) {
  
  if (!( id in dict)){
    throw new Error("id not in dict")
  }
  const { tag, class_name, id_text, children } = dict[id]
  const elem_text = `${tag} ${(class_name.length > 0) ? `class="${class_name}"`: ""} ${(id_text.length > 0) ? `id="${id_text}"` : ""}`

  let next_blanks: string
  if (blanks.length == 0){
      texts.push({display, text: elem_text})
      next_blanks = " "
  } else {
      const tree_text = (has_next) ? "├─ " + elem_text : "└─ " + elem_text
      texts.push({display, text: blanks + tree_text})
      next_blanks = (has_next) ? blanks + "│  " : blanks + "    "
  }
  if (["CODE"].includes(tag)) {
    // pass
  } else {
    let show = display
    if (index > 10){
      show = false
    } else {
      if (["div", "article", "main", "section"].includes(tag) == false){
        show = false
      }
    }
    texts = children.reduce( (list, child_id, idx) => {
      const next_exist = (children.length < 40) ? (idx < children.length-1) : true
      return create_item(child_id, next_exist, idx, dict, list, next_blanks, show)
    }, texts )
    if (children.length == 40){
      texts.push({display: false, text: next_blanks + "└" + "... and more" })
    }
  }
  return texts
}


function create_tree(
  roots: Record<string, Array<string>>,
  spcy_id: string,
  spcy_class: string,
  data: Record<string, ElementData>
) {
  if (spcy_id.length > 0){
    const specified = Object.keys(data).find(id => data[id].id_text == spcy_id)
    if (specified){
      return [{ type: "id", texts: create_item(specified, false, 0, data)}]
    } else {
      return [{ type: "id", texts: [{display: true, text: "specified element is not found"}]}]
    }
  }
  else if (spcy_class.length > 0){
    const specifieds = Object.keys(data).filter(id => data[id].class_name.includes(spcy_class))
    if (specifieds.length > 0){
      const texts = specifieds.map(id => [...create_item(id, false, 0, data), {display: true, text: "--------------"}]).flat().slice(0, -1)
      return [{ type: "class", texts }]
    } else {
      return [{ type: "class", texts: [{display: true, text: "specified element is not found"}]}]
    }
  }
  else {
    return Object.keys(roots).map(key => {
      const texts = roots[key].map(id => [...create_item(id, false, 0, data), {display: true, text: "--------------"}]).flat().slice(0, -1)
      return { type: key, texts }
    })
  }
}


export default function InputArea(prop: {parsed: ParsedResult}) {

  const [ target_id, setId ] = useState("")
  const [ target_class, setClass ] = useState("")

  const { headings, elem_datas, root_ids, html, env_data } = prop.parsed
  let treed_texts: Array<{type: string, texts:Array<TextWithBool>}>
  if (Object.keys(elem_datas).length > 0){
    treed_texts = create_tree(root_ids, target_id, target_class, elem_datas)
  } else {
    treed_texts = [{type: "default", texts:[{display: true, text:"no data"}]}]
  }

  const id_elem_ref = useRef(null)
  const class_elem_ref = useRef(null)

  console.log({type: treed_texts[0].type, lengh: treed_texts[0].texts.length})


  function submit_change(
  ){
    if (id_elem_ref.current !== null && class_elem_ref !== null){
      const new_id = (id_elem_ref.current as HTMLInputElement).value
      const new_class = (class_elem_ref.current as unknown as HTMLInputElement).value
      if (target_id !== new_id || target_class !== new_class){ 
        treed_texts = create_tree(root_ids, target_id, target_class, elem_datas)
       }
      if ( target_id != new_id ){
        setId(new_id)
      }
      if ( target_class != new_class ){ setClass(new_class) }
    }
  }

  const main_base = "grid grid-cols-5"
  const input_base = "grid grid-cols-4 gap-y-3"

  const forcus_tx = "focus:outline-none focus:ring-2 focus:ring-orange-700"
  const border_base = "bg-white border-orange-300 border-solid border-2"
  const input_head_class = `rounded-l-md -mr-1 ${border_base} text-gray-500 text-base text-center`
  const input_class = `w-72 bg-white rounded-r-lg ${border_base} text-gray-700 placeholder-gray-400 text-base ${forcus_tx}`

  return (
    <div class={tw`${main_base}`}>
      <div class={tw`col-span-2 ml-2`}>
        <div class={tw`${input_base}`}>
          <span class={tw`col-span-1 h-8 ${input_head_class}`}> id </span>
          <input type="text" name="id" value={target_id}  ref={id_elem_ref} class={tw`col-span-3 h-8 ${input_class}`} placeholder=" contents"/>
          <span class={tw`col-span-1 h-8 ${input_head_class}`}> class </span>
          <input type="text" name="class" value={target_class}  ref={class_elem_ref} class={tw`col-span-3 h-8 ${input_class}`} placeholder=" contents_body"/>
          <div class={tw`col-span-full justify-self-center`}>
            <button onClick={() => submit_change()}  class={tw`w-24 rounded-lg my-3 bg-sky-700 hover:bg-sky-800 border-none text-white transition ease-in duration-200 text-center text-base ${forcus_tx}`}>変更</button>
          </div>
        </div>
        <div class={tw``}>
          <HeadingArea dict={headings} />
        </div>
        <div class={tw`mt-4`}>
          <PostArea data={{html, target_id, target_class, type: treed_texts[0].type, env_data}}/>
        </div>
      </div>      
      <div class={tw`col-span-3 -mt-24 mx-3`}>
        <TreeArea data={treed_texts}/>
      </div>
    </div>
      
  )
}

