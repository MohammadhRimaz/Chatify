export default function Avatar({ userId, username }) {
  const colors = [
    "bg-red-200",
    "bg-green-200",
    "bg-black-200",
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
        "w-14 h-14 rounded-full text-center flex items-center " + color
      }
    >
      <div className="text-2xl text-gray-500 text-center w-full opacity-70">
        {username[0]}
      </div>
    </div>
  );
}
