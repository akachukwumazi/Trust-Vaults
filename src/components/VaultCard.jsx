export default function VaultCard({ name, members, updatedAt }) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-indigo-500 transition">
      <h3 className="text-lg font-semibold">{name}</h3>

      <p className="text-sm text-gray-400 mt-2">
        {members} members
      </p>

      <p className="text-xs text-gray-500 mt-4">
        Updated: {updatedAt}
      </p>
    </div>
  );
}