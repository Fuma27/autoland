export default function Card({ title, value }) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <h4 className="text-gray-500">{title}</h4>
        <p className="text-xl font-bold">{value}</p>
      </div>
    );
  }