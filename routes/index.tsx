/** @jsx h */
import { h, PageProps, createContext } from "../client_deps.ts"
import { Handlers } from "../server_deps.ts"
import { tw } from "https://esm.sh/twind"
import { 
  DOMParser,
  Element
} from "https://deno.land/x/deno_dom@v0.1.22-alpha/deno-dom-wasm.ts"
import {
  encode,
} from "https://deno.land/std@0.141.0/encoding/base64.ts"

import InputArea from "../islands/InputArea.tsx"


type Data = {
  url: string,
  html: string,
}


type ElementData = {
  id: string,
  tag: string,
  class_name: string,
  id_text: string,
  depth: number,
  children: Array<string>
}


function record_elem(
  elem: Element,
  depth: number,
  dict: Record<string, ElementData>,
  parent_id: string,
  roots: Record<string, Array<string>>,
  key: string,
) {
  const tag = elem.nodeName.toLowerCase()
  const class_name = elem.className
  const id_text = elem.getAttribute("id") ?? ""
  const id = crypto.randomUUID()

  if (depth == 0){
    if (key in roots){ roots[key].push(id) }
    else { roots[key] = [id] }
  }
  
  dict[id] = { id, tag, class_name, id_text, depth, children:[] }
  if (parent_id.length > 0 && parent_id in dict){
    dict[parent_id].children.push(id)
  }
  
  if (["CODE"].includes(elem.nodeName)) {
    // pass 
  } else {
    const children = Array.from(elem.children).slice(0, 40)
    children.forEach( child => record_elem(child, depth+1, dict, id, roots, key))
  }
  return [dict, roots]
}



function parse_html(
  html: string,
) {

  const document = new DOMParser().parseFromString(html, "text/html")
  const headings: Record<string, Array<string>> = { H1: ["no data"], H2: ["no data"] }
  const elem_datas: Record<string, ElementData> = {}
  const roots: Record<string, Array<Element>> = {}
  const root_ids: Record<string, Array<string>> = {}

  if (html.length == 0){
    return {headings, elem_datas, root_ids}
  }

  if (document){
    headings["H1"] = Array.from(document.getElementsByTagName("h1")).map(h => h.innerText.trim() )
    headings["H2"] = Array.from(document.getElementsByTagName("h2")).map(h => h.innerText.trim() )
    
    if (document.getElementsByTagName("article").length > 0){
      const target = document.getElementsByTagName("article")[0]
      console.log("Element type: ARTICLE")
      roots["article"] = [target]
    }
    else if (document.getElementsByTagName("main").length > 0){
      const targets = Array.from(document.getElementsByTagName("main"))
      console.log("Element type: Main")
      roots["main"] = targets
    }
    else {
      let temp: Array<Element> = []
      const content_in_divs = [ ...Array.from(document.querySelectorAll("div[id*='content']")) ]
      if (content_in_divs.length > 0){
        content_in_divs.forEach(node => {
          if (node.firstChild && node.firstChild.parentElement){
            temp.push(node.firstChild.parentElement)
          }
        })
        if (temp.length > 0){
          console.log("Element type: DIV + id*content")
          roots["id*='content'"] = temp
        }
      }
      
      temp = []
      const body_in_ids = [
        ...Array.from(document.querySelectorAll("div[id*='body']")),
        ...Array.from(document.querySelectorAll("div[id*='Body']")),
      ]
      if (body_in_ids.length > 0){
        body_in_ids.forEach(node => {
          if (node.firstChild && node.firstChild.parentElement ){
            temp.push(node.firstChild.parentElement)
          }
        })
        if (temp.length > 0){
          console.log("Element type: DIV + id*body")
          roots["id*='body'"] = temp
        }
      }

      temp = []
      const body_in_classs = [
        ...Array.from(document.querySelectorAll("div[class*='body']")),
        ...Array.from(document.querySelectorAll("div[class*='Body']")),
      ]
      if (body_in_classs.length > 0){
        body_in_classs.forEach(node => {
          if (node.firstChild && node.firstChild.parentElement ){
            temp.push(node.firstChild.parentElement)
          }
        })
        if (temp.length > 0){
          console.log("Element type: DIV + class*body")
          roots["class*='body'"] = temp
        }
      }

      temp = []
      const main_in_classs = [
        ...Array.from(document.querySelectorAll("div[class*='main']")),
        ...Array.from(document.querySelectorAll("div[class*='Main']")),
      ]
      if (main_in_classs.length > 0){
        main_in_classs.forEach(node => {
          if (node.firstChild && node.firstChild.parentElement ){
            temp.push(node.firstChild.parentElement)
          }
        })
        if (temp.length > 0){
          console.log("Element type: DIV + class*main")
          roots["class*='main'"] = temp
        }
      }
    }
    
    Object.keys(roots).forEach(key => {
      roots[key].forEach( elem => record_elem(elem, 0, elem_datas, "", root_ids, key) )
    })
  }
  return {headings, elem_datas, root_ids}
}


export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const total_url = new URL(req.url)
    const url = total_url.searchParams.get("q") ?? ""
    if (url == ""){
      return ctx.render({ url, html:"" })
    }

    const html = await fetch(url)
      .then(async res => {
        if (res.ok){ return await res.text() }
        else { throw new Error() }
      })
      .catch(_e => "")
    return ctx.render({ url, html })
  }
}


export default function Home({ data }: PageProps<Data>) {

  const { URL_PREFIX, USER_TOKEN, TARGET_ID } = Deno.env.toObject()
  const env_data = { URL_PREFIX, USER_TOKEN, TARGET_ID }

  const { url, html } = data
  const parsed = {...parse_html(html), html:encode(html), env_data}
  

  const forcus_tx = "focus:outline-none focus:ring-2 focus:ring-orange-700"
  const border_base = "bg-white border-orange-300 border-solid border-2"
  const input_class = `w-72 bg-white rounded-lg ${border_base} text-gray-700 placeholder-gray-400 text-base ${forcus_tx}`

  return (
    <div class={tw`grid grid-cols-5 bg-orange-50 font-body`}>
      <link href="https://fonts.googleapis.com/css2?family=Overpass+Mono&display=swap" rel="stylesheet"></link>
      <link href="https://fonts.googleapis.com/css2?family=RocknRoll+One&display=swap" rel="stylesheet"></link>
      <h2 class={tw`col-span-2 m-2 mt-6 text-xl font-bold`}> Tree-nize elements in HTML</h2>
      <form class={tw`col-start-1 col-span-2 grid grid-cols-5 gap-y-2 items-center`}>
        <input type="text" name="q" value={url} class={tw`col-span-4 h-8 ml-2 ${input_class}`} placeholder=" https://www.example.com/"/>
        <button class={tw`col-span-1 rounded-lg my-3 mr-2 bg-green-700 hover:bg-green-800 border-none text-white transition ease-in duration-200 text-center text-base ${forcus_tx}`}>表示</button>
      </form>
      <div class={tw`col-span-full mt-1`}>
        <InputArea parsed={parsed}/>
      </div>
    </div>
  )
}

