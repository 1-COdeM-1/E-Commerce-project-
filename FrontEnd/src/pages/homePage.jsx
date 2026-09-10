import { useHomeCatalog } from "../hooks/useHomeCatalog";
import { HomeHero } from "../components/HomeHero";
import { TrustStrip } from "../components/TrustStrip";
import HomeCats from "../components/HomeCats";
import HomeProducts from "../components/HomeProducts";
function HomePage() {
  const {
    categoryFilter,
    setCategory,
    categories,
    categoryChipsLoading,
    loadingCategories,
    products , 
    loadingList , 
    error
  } = useHomeCatalog();

  return (
    <div>
      <HomeHero categories={categories} loadingCategories={loadingCategories} />
      <TrustStrip />
      <HomeCats
        categoryFilter={categoryFilter}
        setCategory={setCategory}
        categories={categories}
        categoryChipsLoading={categoryChipsLoading}
      />
      <HomeProducts products={products} loadingList={loadingList} error={error}/>
    </div>
  );
}

export default HomePage ;