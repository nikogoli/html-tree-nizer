/** @jsx h */
import { h, PageProps } from "../client_deps.ts"
import { Handlers } from "../server_deps.ts"
import { 
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts"
import { tw } from "https://esm.sh/twind"

import TreeArea from "../islands/TreeArea.tsx"


type Data = {
  url: string,
  target_id: string,
  target_class: string,
  h1s: string[],
  treed_texts: Record<string, Array<string>>,
  go_deep: string,
  heading: string,
}


function create_item(
  elem: Element,
  go_deep: boolean,
  texts = [""],
  blanks = "",
): Array<string> {
  const teg_text = elem.outerHTML.split(">", 1)[0].slice(1)
  let next_blanks: string
  if (blanks.length == 0){
      texts.push(teg_text)
      next_blanks = " "
  } else {
      const tree_text = (elem.nextElementSibling) ? "├─ " + teg_text : "└─ " + teg_text
      texts.push(blanks + tree_text)
      next_blanks = (elem.nextElementSibling) ? blanks + "│  " : blanks + "    "
  }
  if (["CODE"].includes(elem.nodeName)) {
    // pass
  }
  else if ( go_deep || ["DIV", "ARTICLE", "SECTION", "MAIN"].includes(elem.nodeName)){
      const limit = (go_deep) ? 40 : 10
      const children = Array.from(elem.children).slice(0, limit)
      texts = children.reduce( (list, child) => create_item(child, go_deep, list, next_blanks), texts )
      if(elem.childElementCount > limit){
          texts.push( next_blanks + "└" + "... and more" )
      }
  }
  return texts
}


export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    let h1s = ["not found"]
    const treed_texts: Record<string, Array<string>> = {default: ["proper element is not found"]}
    const total_url = new URL(req.url)
    const url = total_url.searchParams.get("q") ?? ""
    const target_id = total_url.searchParams.get("id") ?? ""
    const target_class = total_url.searchParams.get("class") ?? ""
    const go_deep = (total_url.searchParams.get("go_deep")) ?? ""
    const is_go_deep = (go_deep == "true")
    const heading = total_url.searchParams.get("heading") ?? "H1"
    if (url == ""){
      return ctx.render({ url, target_id, target_class, h1s, treed_texts, go_deep, heading })
    }

    const fetched = await fetch(url)
      .then(async res => {
        if (res.ok){ return await res.text() }
        else { throw new Error() }
      })
      .catch(_e => null)
  
    if (fetched !== null){
      const document = new DOMParser().parseFromString(fetched, "text/html")
      if (document !== null){
        h1s = (heading == "H2")
          ? Array.from(document.getElementsByTagName("h2")).map(h => h.innerText.trim())
          : Array.from(document.getElementsByTagName("h1")).map(h => h.innerText.trim())

        const results: Record<string, Array<Element>> = {}
        let temp: Array<Element> = []

        if (target_id.length > 0 && document.getElementById(target_id) !== null){
          console.log("Element type: ELEMENT + id")
          results["element + id"] = [ document.getElementById(target_id) as Element ]
        }
        else if (document.getElementsByTagName("article").length > 0){
          const target = document.getElementsByTagName("article")[0]
          if (target_class.length > 0){
            temp = target.getElementsByClassName(target_class)
          }
          if (temp.length > 0){
            console.log("Element type: ARTICLE + class")
            results["article"] = temp
          } else {
            console.log("Element type: ARTICLE")
            results["article"] = [target]
          }
        }
        else if (document.getElementsByTagName("main").length > 0){
          const targets = document.getElementsByTagName("main")
          if (target_class.length > 0){
            temp = targets.map(elem => elem.getElementsByClassName(target_class)).flat()
          }
          if (temp.length > 0){
            console.log("Element type: Main + class")
            results["main"] = temp
          } else {
            console.log("Element type: Main")
            results["main"] = targets
          }
        }
        else if (document.querySelectorAll("div[id*='content']").length > 0){
          const content_elems = document.querySelectorAll("div[id*='content']")
          content_elems.forEach(el => {
            if (el.firstChild !== null && el.firstChild.parentElement !== null){
              temp.push(el.firstChild.parentElement)
            }
          })
          if (temp.length > 0){
            let temptemp: Array<Element> = []
            if (target_class.length > 0){
              temptemp = temp.map(elem => elem.getElementsByClassName(target_class)).flat()
            }
            if (temptemp.length > 0){
              console.log("Element type: DIV + id(content) + class")
              results["id*='content'"] = temptemp
            } else {
              console.log("Element type: DIV + id(content)")
              results["id*='content'"] = temp
            }
          }
        } else {
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
              let temptemp: Array<Element> = []
              if (target_class.length > 0){
                temptemp = temp.map(elem => elem.getElementsByClassName(target_class)).flat()
              }
              if (temptemp.length > 0){
                console.log("Element type: DIV + id*'body' + class")
                results["id*='body'"] = temptemp
              } else {
                console.log("Element type: DIV + id*body")
                results["id*='body'"] = temp
              }
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
              let temptemp: Array<Element> = []
              if (target_class.length > 0){
                temptemp = temp.map(elem => elem.getElementsByClassName(target_class)).flat()
              }
              if (temptemp.length > 0){
                console.log("Element type: DIV + class*body + class")
                results["class*='body'"] = temptemp
              } else {
                console.log("Element type: DIV + class*content")
                results["class*='body'"] = temp
              }
            }
          }
        }
        Object.keys(results).forEach(key => {
          const text_list = results[key].map(elem => [...create_item(elem, is_go_deep), "───────────"]).flat()
          treed_texts[key] = text_list
        })
      }
    }
    return ctx.render({ url, target_id, target_class, h1s, treed_texts, go_deep, heading })
  }
}


export default function Home({ data }: PageProps<Data>) {

  const { url, target_id, target_class, h1s, treed_texts, go_deep, heading } = data

  const forcus_tx = "focus:outline-none focus:ring-2 focus:ring-orange-700"
  const border_base = "bg-white border-orange-300 border-solid border-2"
  const input_head_class = `rounded-l-md -mr-1 ${border_base} text-gray-500 text-base text-center`
  const input_class = `w-72 bg-white rounded-r-lg ${border_base} text-gray-700 placeholder-gray-400 text-base ${forcus_tx}`

  return (
    <div class={tw`grid grid-flow-row-dense grid-cols-5 gap-4 bg-orange-50 font-body`}>
      <link href="https://fonts.googleapis.com/css2?family=Overpass+Mono&display=swap" rel="stylesheet"></link>
      <link href="https://fonts.googleapis.com/css2?family=RocknRoll+One&display=swap" rel="stylesheet"></link>
      <div class={tw`self-start m-8 col-span-2`}>
        <p class={tw`m-2`}> article タグ等を起点に、Webページの HTML の構造を図示する</p>
        <form class={tw`my-4 grid grid-cols-4 gap-y-2`}>
          <span class={tw`col-span-1 ${input_head_class}`}> URL </span>
          <input type="text" name="q" value={url} class={tw`col-span-3 ${input_class}`} placeholder=" https://www.example.com/"/>
          <span class={tw`col-span-1 ${input_head_class}`}> id </span>
          <input type="text" name="id" value={target_id} class={tw`col-span-3 ${input_class}`} placeholder=" contents"/>
          <span class={tw`col-span-1 ${input_head_class}`}> class </span>
          <input type="text" name="class" value={target_class} class={tw`col-span-3 ${input_class}`} placeholder=" contents_body"/>
          <div class={tw`col-span-full grid grid-cols-4`}>
            <p class={tw`col-span-1 my-2`}>最下層まで</p>
            <select name="go_deep" value={go_deep} class={tw`col-span-1 my-1 w-28 h-9 rounded-md ${border_base} ${forcus_tx}`}>
              <option value="false" selected> 表示しない </option>
              <option value="true"> 表示する </option>
            </select>
            <p class={tw`col-start-1 col-span-1 my-2`}>見出し検索</p>
            <select name="heading" value={heading} class={tw`col-start-2 col-span-1 my-1 w-16 h-9 rounded-md ${border_base} ${forcus_tx}`}>
              <option value="H1" selected> H1 </option>
              <option value="H2"> H2 </option>
            </select>
            <div class={tw`col-start-4 col-span-1 justify-self-center `}>
              <button type="submit" class={tw`col-start-4 w-24 rounded-lg my-3 bg-green-700 hover:bg-green-800 border-none text-white transition ease-in duration-200 text-center text-base ${forcus_tx}`}>解析</button>
            </div>
          </div>
        </form>
        <div class={tw`grid grid-cols-6 mt-2`}>
          <h3 class={tw`col-span-1 mt-0 text-sky-700`} > {heading} </h3>
          <div class={tw`col-span-5`}>
            {h1s.map((name) => <div class={tw`mb-1`}><label><input type="radio" name="h1"/><span> {name}</span></label></div>)}
          </div>
        </div>
      </div>
      <div class={tw`col-span-3 `}>
        <TreeArea texts={treed_texts} />
      </div>
    </div>
  )
}

