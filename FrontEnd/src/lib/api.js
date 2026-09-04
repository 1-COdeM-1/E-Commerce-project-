import * as sentry from "@sentry/react"
const raw = import.meta.env.VITE_API_URL;
const base = typeof raw === "string" ? raw.replace(/\/+$/, "") : ""; // remove trailing slashes

export async function apiFetch(path , opts = {}){
    const {getToken , method = "get" , body} = opts ;
    const headers = {"content-type" : "application/json"}
    if(getToken) {
        const token = await getToken() ;
        if(token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }
    let res ;
    try {
        res = await fetch(`${base}${path}` , {method , headers , body : body !==undefined ? JSON.stringify(body) : undefined}) ;
    } catch (e) {
        sentry.addBreadcrumb({
            category : "api" , 
            message : `${method} ${path}` ,
            level : "error" , 
            data : { network: true } 
        })
        sentry.captureException({
            tags : {"api.fetch" : "network"} , 
            extra : {path , method} 
        })
        throw e;
    }
    const data = await res.json() ;
    sentry.addBreadcrumb({
        category : "api" , 
        message : `${method} ${path}` , 
        level : res.ok ? "info" : "warning" ,
        data : {status : res.status}
    })
    if(!res.ok){
        const msg = typeof data?.error ==="string" ? data.error : res.statusText ;
        const err = new Error(typeof msg === "string" ? msg : "Request failed");
        if(res.status >= 500){
            sentry.captureException({
                tags : { "api.fetch": "http", "http.status": String(res.status) },
                extra : { path, method, status: res.status }
            })
        }
        throw err
    }
    return data ;
} 