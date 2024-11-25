import { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const divUnderMessages = useRef();

  // Scroll Effect for New Messages
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  // Display Online Users
  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  // Find Online Users
  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  // Send Message Function
  function sendMessage(ev) {
    ev.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        id: Date.now(),
      },
    ]);
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // Hiding Logged in user's id on contacts panel
  const onlinePeopleExlOurUser = { ...onlinePeople };
  delete onlinePeopleExlOurUser[id];

  // Delete Duplicate Messages
  const messagesWithoutDupes = uniqBy(messages, "id");

  return (
    <div className="flex h-screen">
      {/* Contact Section */}
      <div className="bg-white w-1/3">
        <Logo />

        {Object.keys(onlinePeopleExlOurUser).map((userId) => (
          <div
            key={userId}
            onClick={() => setSelectedUserId(userId)}
            className={
              "border-b border-gray-300 flex items-center gap-2 cursor-pointer " +
              (userId === selectedUserId ? "bg-emerald-100" : "")
            }
          >
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-14 rounded-r-md"></div>
            )}
            <div className="flex gap-2 items-center py-2 pl-4">
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className="text-gray-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Messages Section */}
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        {/* Messages Panel if no person selected */}
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-400 text-lg">
                Select a person to start a conversation
              </div>
            </div>
          )}
          {/* Display messages if person is selected */}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messagesWithoutDupes.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.sender === id ? " text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "inline-block text-left p-2 my-2 font-semibold rounded-md text-sm text-white " +
                        (message.sender === id ? "bg-sky-400" : "bg-green-500")
                      }
                    >
                      sender:{message.sender}
                      <br />
                      my id: {id}
                      <br />
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>

        {/* Write Messages only if a person selected */}
        {!!selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              name="messageTypeField"
              type="text"
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              placeholder="Type your message here..."
              className="bg-white border p-2 rounded-md flex-grow"
            />
            {/* Send Button */}
            <button
              type="submit"
              className="bg-blue-500 p-2 rounded-full text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
