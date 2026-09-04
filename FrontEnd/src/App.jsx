
import { useAuth } from "@clerk/react";
import PageLoader from "./components/PageLoader";
import Layout from "./components/Layout";
function App() {
  const {isLoaded} = useAuth() ;
  if(!isLoaded) return <PageLoader />
  return (
    <Layout>
      
    </Layout>
  );
}

export default App;
