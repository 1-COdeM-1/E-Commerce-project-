
import { Show, SignInButton, SignOutButton,SignUpButton, useAuth, UserButton } from "@clerk/react";
import PageLoader from "./components/PageLoader";
function App() {
  const {isLoaded} = useAuth() ;
  if(!isLoaded) return <PageLoader />
  return (
    <>
      <Show when="signed-in">
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignInButton  mode="modal"/>
        <SignUpButton mode="modal"/>
      </Show>
      <Show when="signed-in">
        <SignOutButton />
      
      </Show>
      <button className="btn btn-primary">click me </button>
    </>
  );
}

export default App;
