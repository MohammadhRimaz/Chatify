import Avatar from "./Avatar";

export default function Contact({ id, onClick, selected, username, online }) {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={
        "border-b border-gray-300 flex items-center gap-2 cursor-pointer " +
        (selected ? "bg-emerald-100" : "")
      }
    >
      {selected && <div className="w-1 bg-blue-500 h-14 rounded-r-md"></div>}
      <div className="flex gap-2 items-center py-2 pl-4">
        <Avatar online={online} username={username} userId={id} />
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  );
}
