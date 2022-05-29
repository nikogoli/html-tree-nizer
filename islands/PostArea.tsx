/** @jsx h */
import { h, useState, useContext } from "../client_deps.ts"
import { tw } from "https://esm.sh/twind"
import {
    decode,
} from "https://deno.land/std@0.141.0/encoding/base64.ts"

type EnvData = {
    URL_PREFIX: string;
    USER_TOKEN: string;
    TARGET_ID: string;
}

export default function PostArea(
    prop: {data: {
        html: string,
        target_id: string,
        target_class: string,
        type: string,
        env_data: EnvData
    }}
) {

    const [ message, setMessage ] = useState("　")

    const main_base = "grid grid-cols-3"
    const forcus_tx = "focus:outline-none focus:ring-2 focus:ring-orange-700"

    function post_data(){
        async function arrange_scrap() {
            const { URL_PREFIX, USER_TOKEN, TARGET_ID } = prop.data.env_data
            const headers = new Headers()
            headers.append("Authorization", `Bearer ${USER_TOKEN}`)
        
            const body_data = {
                html_doc: new TextDecoder().decode(decode(prop.data.html)),
                page_id: TARGET_ID,
                target_id: prop.data.target_id,
                target_class: prop.data.target_class,
                type: prop.data.type,
            }
            
            const URL = `${URL_PREFIX}/withid/pages/create`
            const page_response = await fetch(URL, {
                credentials: "include",
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body_data),
            })
            
            const responseText = await page_response.text()
        
            switch(page_response.status){
                case 200: {
                    const responseJson = JSON.parse(responseText) as Record<string, unknown>
                    console.log(responseJson)
                    const { object, url } = responseJson
                    const resultMessage = `create '${object}'.\nCheck "${url}"!!`
                    setMessage(resultMessage)
                    console.log(resultMessage)
                    console.log(responseJson)
                    return
                }
                case 201: {
                    const responseJson = JSON.parse(responseText) as Record<string, unknown>
                    const { object, url, message } = responseJson
                    const resultMessage = `create '${object}', though ${message}.\n\nCheck "${url}"`
                    setMessage(resultMessage)
                    console.log(resultMessage)
                    console.log(responseJson)
                    return
                }
                case 400:{
                    try{
                        const json = JSON.parse(responseText) as Record<string, unknown>
                        if ("stack" in json){
                            const { name, message, stack } = json
                            const resultMessage = `Convertion failed.\n${name}: ${message}\n${stack}`
                            setMessage(resultMessage)
                            console.error(resultMessage)
                            console.error(json)
                            return
                        } else {
                            const { name, status, code, body } = json
                            const { message } = JSON.parse(body as string)
                            const resultMessage = `Creation failed.\n${name}/ ${code}\n${message.slice(0,200)}...`
                            setMessage(resultMessage)
                            console.error(resultMessage)
                            console.error({ name, status, code, message })
                            return
                        }
                    } catch(_e){
                        const resultMessage = "Creation Faild. Please check console-message."
                        setMessage(resultMessage)
                        console.error(resultMessage)
                        return
                    }
                }
                case 401: {
                    const resultMessage = "Request refused. Please check wheather USER-TOKEN is valid."
                    setMessage(resultMessage)
                    console.error(resultMessage)
                    return
                }
                case 404: {
                    const resultMessage = "Requested URL is not found."
                    setMessage(resultMessage)
                    console.error(resultMessage)
                    return
                }
                case 501:{
                    const resultMessage = "Requested URL is not proper one."
                    setMessage(resultMessage)
                    console.error(resultMessage)
                    return
                }
                default:{
                    const resultMessage = `Unexpected status: ${page_response.status}`
                    setMessage(resultMessage)
                    console.error(resultMessage)
                    return
                }
            }
        }
        arrange_scrap()
    }
  
    return (
      <div class={tw`${main_base}`}>
        <div class={tw`col-start-2 col-span-1 justify-self-center`}>
            <button onClick={() => post_data()} class={tw`w-24 rounded-lg my-3 bg-sky-700 hover:bg-sky-800 border-none text-white transition ease-in duration-200 text-center text-base ${forcus_tx}`}>ページ作成</button>
        </div>
        <div class={tw`col-span-full mr-2 my-3`}>
            <span>{message}</span>
        </div>
      </div>
    )
  }
  