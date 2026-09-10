import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"
import { apiFetch } from "../lib/api";

export function useHomeCatalog (){
    const [searchParams , setSearchParams] = useSearchParams() ;
    const categoryFilter = searchParams.get("category")?.trim() ?? "" ; 

    const setCategory = (category) => {
    const next = new URLSearchParams(searchParams);

    if (!category) next.delete("category");
    else next.set("category", category);

    setSearchParams(next, { replace: true });
  };
    const {data : categoriesData  ,isLoading : loadingCategories} = useQuery({
        queryKey : ["products-categories"] ,
        queryFn : ()=>apiFetch("/api/products/categories")
    }); 
    const {data : productsData , isLoading : loadingList , error} = useQuery({
        queryKey : ["products" , categoryFilter] , 
        queryFn : ()=>apiFetch(categoryFilter ? `/api/products?category=${encodeURIComponent(categoryFilter)}` : "/api/products")
        // the benefit of this encodeURIComponent() is to encode the special charachters and the spaces like & and # in the url .
    })
    const categories = categoriesData?.categories ?? [];
    const products = productsData?.products ?? [];
    const categoryChipsLoading = loadingCategories && categories.length === 0;

    return {
    categoryFilter,
    setCategory,
    categories,
    products,
    categoryChipsLoading,
    loadingCategories,
    loadingList,
    error,
  };

}