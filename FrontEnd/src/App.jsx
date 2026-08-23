
import { Show, SignInButton, SignOutButton,SignUpButton, UserButton } from "@clerk/react";

function App() {
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
    </>
  );
}

export default App;
