export default function Avatar({ userId, username, online }) {
  const colors = [
    "bg-red-200",
    "bg-green-200",
    "bg-amber-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-zinc-300",
    "bg-orange-200",
    "bg-teal-200",
    "bg-stone-300",
    "bg-lime-300",
  ];

  const userIdBase10 = parseInt(userId, 20);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div
      className={
        "w-14 h-14 relative rounded-full text-center flex items-center " + color
      }
    >
      <div className="text-2xl text-gray-500  text-center w-full opacity-70">
        {username[0]}
      </div>

      {/* Online Green symbol */}
      {online && (
        <div className="absolute w-3 h-3 bottom-0 left-10 bg-green-500 rounded-full border border-white"></div>
      )}
      {/* Offline Green symbol */}
      {!online && (
        <div className="absolute w-3 h-3 bottom-0 left-10 bg-gray-400 rounded-full border border-white"></div>
      )}
    </div>
  );
}
