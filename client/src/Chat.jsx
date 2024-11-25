export default function Chat() {
  return (
    <div className="flex h-screen">
      {/* Contact Section */}
      <div className="bg-white w-1/3">Contacts</div>

      {/* Messages Section */}
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        {/* Display Messages */}
        <div className="flex-grow">Messages</div>

        {/* Write Messages */}
        <div className="flex gap-2 ">
          <input
            type="text"
            placeholder="Type your message here..."
            className="bg-white border p-2 rounded-md flex-grow"
          />
          {/* Send Button */}
          <button className="bg-blue-500 p-2 rounded-full text-white">
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
        </div>
      </div>
    </div>
  );
}
