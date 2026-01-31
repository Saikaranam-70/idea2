// components/Navbar.jsx
const Navbar = ({ activeTab, setActiveTab }) => {
  const tabs = ["TOPICS", "MCQS", "INTERVIEW", "JOBS"];

  return (
    <div className="flex gap-4 bg-gray-900 p-4 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-5 py-2 rounded-lg font-semibold transition
            ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
        >
          {tab === "TOPICS"
            ? "Topics"
            : tab === "MCQS"
            ? "MCQs": tab === "JOBS"? "Jobs"
            : "Interview Questions"
            }
        </button>
      ))}
    </div>
  );
};

export default Navbar;
