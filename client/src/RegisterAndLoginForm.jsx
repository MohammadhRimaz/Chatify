import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import Logo from "./Logo";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    const { data } = await axios.post(url, { username, password });
    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <div className="bg-blue-50 h-screen flex flex-col justify-center items-center">
      {/* Logo */}
      <div className="w-64 p-10 text-2xl">
        <Logo />
      </div>
      {/* Register/Login Form */}
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          name="username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="username"
          className="block w-full rounded-md p-2 mb-2 border"
        />
        <input
          name="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-md p-2 mb-2 border"
        />
        <button
          name="authButton"
          className="bg-blue-500 text-white block w-full rounded-md p-2"
        >
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?{" "}
              <button
                onClick={() => setIsLoginOrRegister("login")}
                className="underline"
              >
                Login here.
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div>
              Don't have an account?{" "}
              <button
                onClick={() => setIsLoginOrRegister("register")}
                className="underline"
              >
                Register.
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
