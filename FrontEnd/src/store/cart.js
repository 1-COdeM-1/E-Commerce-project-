import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(
    persist((set , get)=>({

        items : [] ,
        removeItem(productId){
            set({items : get().items.filter((item)=>item.productId !== productId)}) ;
        }  ,
        addItem(productId , qty = 1){
            const items = [...get().items] ;
            const i = items.findIndex(item=>item.productId === productId) ;
            if(i!== -1) {
                items[i] = {...items[i] , quantity: items[i].quantity + qty}
            }else{
                items.push({productId , quantity : qty})
            }
            set({items}) ;
        } , 
        setQty(productId , qty){
            if(qty <= 0)return set({items : get().items.filter((item)=>item.productId !== productId)}) ;
            const items = [...get().items] ;
            const i = items.findIndex(item=>item.productId === productId) ;
            if(i !== -1) {
                items[i]= {...items[i] , quantity : qty}
                return set({items})
            }
            return
        } ,
        clear(){
            return set({items : []}) ;
        }

        }) , {name: "C0deM-cart"}
    )
)
