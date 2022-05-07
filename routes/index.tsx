/** @jsx h */
import { h, PageProps } from "../client_deps.ts"
import { Handlers } from "../server_deps.ts"
import { 
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts"
import { tw } from "https://esm.sh/twind"

type Data = {
  url: string,
  target_id: string,
  target_class: string,
  h1s: string[],
  treed_text: string,
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
      next_blanks = "  "
  } else {
      const tree_text = (elem.nextElementSibling) ? "├─ " + teg_text : "└─ " + teg_text
      texts.push(blanks + tree_text)
      next_blanks = (elem.nextElementSibling) ? blanks + "│  " : blanks + "  "
  }
  if ( go_deep || ["DIV", "ARTICLE", "SECTION", "MAIN"].includes(elem.nodeName)){
      const limit = (go_deep) ? 20 : 10
      const children = Array.from(elem.children).slice(0, limit)
      texts = children.reduce( (list, child) => create_item(child, go_deep, list, next_blanks), texts )
      if(elem.childElementCount > limit){
          texts.push( next_blanks + "└" + "... and more" )
      }
  }
  return texts
}


function colored_text(
  text: string
){
  const matched = text.match(/(.+?)(class=".+?")(.*)/)
  if (matched === null){
    return <p class={tw`p-0 ml-4 my-0 whitespace-pre`} >{text}</p>
  } else {
    const [pre_tx, class_tx, other_tx] = matched.slice(1)
    return <p class={tw`p-0 ml-4 my-0 whitespace-pre`} >{pre_tx}<span class={tw`text-green-700`}>{class_tx}</span>{other_tx}</p>
  }
}



export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    let h1s = ["not found"]
    let treed_text = "article-tag / main-tag / div-tag whose id is '~content' is not found"
    const total_url = new URL(req.url)
    const url = total_url.searchParams.get("q") ?? ""
    const target_id = total_url.searchParams.get("id") ?? ""
    const target_class = total_url.searchParams.get("class") ?? ""
    const go_deep = (total_url.searchParams.get("go_deep")) ?? ""
    const is_go_deep = (go_deep == "true")
    const heading = total_url.searchParams.get("heading") ?? "H1"
    if (url == ""){
      return ctx.render({ url, target_id, target_class, h1s, treed_text, go_deep, heading })
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

        let targets: Array<Element> | null = null
        if (document.getElementsByTagName("article").length > 0){
          console.log("Element type: ARTICLE")
          targets = [document.getElementsByTagName("article")[0]]
        }
        else if (document.getElementsByTagName("main").length > 0){
          console.log("Element type: MAIN")
          targets = [document.getElementsByTagName("main")[0]]
        }
        else if (document.querySelectorAll("div[id*='content']").length > 0){
          console.log("Element type: DIV with 'content' id")
          const content_elems = document.querySelectorAll("div[id*='content']")
          const temp: Array<Element> = []
          content_elems.forEach(el => {
            if (el.firstChild !== null && el.firstChild.parentElement !== null){
              temp.push(el.firstChild.parentElement)
            }
          })
          targets = temp
        }

        if (targets !== null){
          let new_targets: Array<Element> = []
          if (target_id.length > 0){
            if (document.getElementById(target_id) !== null){
              new_targets = [ document.getElementById(target_id) as Element ]
            }
          }
          else if (target_class.length > 0){
            new_targets = targets.map(elem => elem.getElementsByClassName(target_class)).flat()
          }

          if (new_targets.length > 0){
            console.log("~~ New target!! ~~")
            treed_text = new_targets.map(elem => [...create_item(elem, is_go_deep), "───────────"]).flat().join("\n")
          } else {
            treed_text = targets.map(elem => [...create_item(elem, is_go_deep), "───────────"]).flat().join("\n")
          }    
        }
      }
    }
    return ctx.render({ url, target_id, target_class, h1s, treed_text, go_deep, heading })
  },
}


export default function Home({ data }: PageProps<Data>) {

  const { url, target_id, target_class, h1s, treed_text, go_deep, heading } = data
  const text_style = {'white-space': 'pre-wrap'}

  const forcus_tx = "focus:outline-none focus:ring-2 focus:ring-orange-700"
  const input_head_class = `rounded-l-md -mr-1 bg-white border-orange-300 border-solid border-2 text-gray-500 text-base text-center`
  const input_class = `w-72 bg-white border-orange-300 text-gray-700 placeholder-gray-400 text-base ${forcus_tx}`

  return (
    <div class={tw`grid grid-flow-row-dense grid-cols-5 gap-4 mx-8 my-4 bg-orange-50 font-body`}>
      <link href="https://fonts.googleapis.com/css2?family=Overpass+Mono&display=swap" rel="stylesheet"></link>
      <link href="https://fonts.googleapis.com/css2?family=RocknRoll+One&display=swap" rel="stylesheet"></link>
      <div class={tw`self-start m-8 col-span-2 grid grid-cols-5 gap-2`}>
        <p class={tw`col-span-full m-2`}> article タグ等を起点に、Webページの HTML の構造を図示する</p>
        <form class={tw`col-span-full my-4 flex flex-col gap-3`}>
          <div class={tw`grid grid-cols-5`}>
            <span class={tw`col-span-1 ${input_head_class}`}> URL </span>
            <input type="text" name="q" value={url} class={tw`rounded-r-lg border-solid ${input_class}`} placeholder=" https://www.example.com/"/>
          </div>
          <div class={tw`grid grid-cols-5`}>
            <span class={tw`col-span-1 ${input_head_class}`}> id </span>
            <input type="text" name="id" value={target_id} class={tw`rounded-r-lg border-solid ${input_class}`} placeholder=" contents"/>
          </div>
          <div class={tw`grid grid-cols-5`}>
            <span class={tw`col-span-1 ${input_head_class}`}> class </span>
            <input type="text" name="class" value={target_class} class={tw`col-span-3 rounded-r-lg border-solid ${input_class}`} placeholder=" contents_body"/>
          </div>
          <div class={tw`grid grid-cols-3`}>
            <div class={tw`col-span-2`}>
              <div class={tw`flex flex-row items-center gap-2`}>
                <p class={tw``}>最下層まで</p>
                <select name="go_deep" value={go_deep} class={tw`w-28 h-9 rounded-md bg-white text-gray-700 border-solid border-orange-300 ${forcus_tx}`}>
                  <option value="false" selected> 表示しない </option>
                  <option value="true"> 表示する </option>
                </select>
              </div>
              <div class={tw`flex flex-row items-center gap-2`}>
                <p class={tw``}>見出し検索</p>
                <select name="heading" value={heading} class={tw`w-16 h-9 rounded-md bg-white text-gray-700 border-solid border-orange-300 ${forcus_tx}`}>
                  <option value="H1" selected> H1 </option>
                  <option value="H2"> H2 </option>
                </select>
              </div>
            </div>
            <div class={tw`self-center `}>
              <button type="submit" class={tw`col-start-4 w-24 rounded-lg my-3 bg-green-700 hover:bg-green-800 border-none text-white transition ease-in duration-200 text-center text-base ${input_class}`}>解析</button>
              {/*<input type="reset" class={tw`col-start-4 w-24 rounded-lg my-3 bg-sky-600 hover:bg-sky-800 border-none text-white transition ease-in duration-200 text-center text-base `} />*/}
            </div>
          </div>
        </form>
        <h3 class={tw`col-span-1 text-sky-700`} > {heading} </h3>
        <div class={tw`col-span-4 my-4`}>
          {h1s.map((name) => <div class={tw`mb-1`}><label><input type="radio" name="h1"/><span> {name}</span></label></div>)}
        </div>
      </div>
      <div class={tw`h-128 m-8 col-span-3 overflow-x-auto overflow-y-auto font-code border-solid border-4 border-orange-800`}>
        <p class={tw`p-0 mt-2 ml-4 whitespace-pre`} >{treed_text.split("\n")[0]}</p>
        {treed_text.split("\n").slice(1).map(t => colored_text(t))}
      </div>
    </div>
  )
}

