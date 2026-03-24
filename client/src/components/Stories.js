export default function Stories() {
  const stories = [
    { id: 1, username: "Pascal" },
    { id: 2, username: "Alice" },
    { id: 3, username: "John" },
  ];

  return (
    <div className="flex space-x-4 overflow-x-auto p-2 bg-white border mb-4">
      {stories.map((story) => (
        <div key={story.id} className="text-center">
          <div className="w-14 h-14 rounded-full border-2 border-rwandaBlue flex items-center justify-center">
            {story.username[0]}
          </div>
          <p className="text-xs">{story.username}</p>
        </div>
      ))}
    </div>
  );
}