import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API = "http://localhost:5000";

const Mcq = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    explanation: "",
  });

  const [editId, setEditId] = useState(null);

  /* ================= FETCH TOPICS ================= */
  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API}/topic/topic-names`);
      const data = await res.json();

      if (data.success) {
        setTopics(data.data);
      }
    } catch (err) {
      toast.error("Failed to load topics");
    }
  };

  /* ================= FETCH MCQS ================= */
  const fetchMcqs = async (topicId) => {
    if (!topicId) return;
    setLoading(true);

    try {
      const res = await fetch(`${API}/mcq/topic/${topicId}`);
      const data = await res.json();

      if (data.success) {
        setMcqs(data.mcqs);
      }
    } catch (err) {
      toast.error("Failed to load MCQs");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTopic) {
      return toast.error("Select a topic");
    }

    if (form.options.some((o) => !o.trim())) {
      return toast.error("All 4 options are required");
    }

    try {
      const url = editId
        ? `${API}/mcq/${editId}`
        : `${API}/mcq`;

      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicId: selectedTopic,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success(editId ? "MCQ Updated" : "MCQ Added");

      resetForm();
      fetchMcqs(selectedTopic);
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this MCQ?")) return;

    try {
      const res = await fetch(`${API}/mcq/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("MCQ Deleted");
      fetchMcqs(selectedTopic);
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (mcq) => {
    setEditId(mcq._id);
    setForm({
      question: mcq.question,
      options: mcq.options,
      correctOptionIndex: mcq.correctOptionIndex,
      explanation: mcq.explanation || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      question: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
    });
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchMcqs(selectedTopic);
  }, [selectedTopic]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        🧠 MCQ Admin Panel
      </h1>

      {/* ================= TOPIC SELECT ================= */}
      <select
        className="w-full p-3 mb-6 rounded-xl border shadow-sm"
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
      >
        <option value="">Select Topic</option>
        {topics.map((t) => (
          <option key={t._id} value={t._id}>
            {t.title} ({t.category})
          </option>
        ))}
      </select>

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl p-6 mb-10"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editId ? "✏️ Edit MCQ" : "➕ Add MCQ"}
        </h2>

        <textarea
          placeholder="Question"
          className="w-full p-3 mb-4 rounded-xl border"
          value={form.question}
          onChange={(e) =>
            setForm({ ...form, question: e.target.value })
          }
          required
        />

        {form.options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            className="w-full p-3 mb-3 rounded-xl border"
            value={opt}
            onChange={(e) => {
              const options = [...form.options];
              options[i] = e.target.value;
              setForm({ ...form, options });
            }}
          />
        ))}

        <select
          className="w-full p-3 mb-4 rounded-xl border"
          value={form.correctOptionIndex}
          onChange={(e) =>
            setForm({
              ...form,
              correctOptionIndex: Number(e.target.value),
            })
          }
        >
          {[0, 1, 2, 3].map((i) => (
            <option key={i} value={i}>
              Correct Option {i + 1}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Explanation (optional)"
          className="w-full p-3 mb-4 rounded-xl border"
          value={form.explanation}
          onChange={(e) =>
            setForm({ ...form, explanation: e.target.value })
          }
        />

        <div className="flex gap-3">
          <button className="bg-black text-white px-6 py-3 rounded-xl">
            {editId ? "Update MCQ" : "Add MCQ"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 px-6 py-3 rounded-xl"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ================= MCQ LIST ================= */}
      <div className="space-y-4">
        {loading && <p>Loading...</p>}

        {mcqs.map((mcq, idx) => (
          <div
            key={mcq._id}
            className="bg-white rounded-2xl shadow p-5"
          >
            <p className="font-semibold mb-2">
              {idx + 1}. {mcq.question}
            </p>

            <ul className="grid grid-cols-2 gap-2 mb-3">
              {mcq.options.map((o, i) => (
                <li
                  key={i}
                  className={`p-2 rounded-lg border ${
                    mcq.correctOptionIndex === i
                      ? "bg-green-100 border-green-400"
                      : ""
                  }`}
                >
                  {o}
                </li>
              ))}
            </ul>

            {mcq.explanation && (
              <p className="text-sm text-gray-600 mb-3">
                📝 {mcq.explanation}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(mcq)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(mcq._id)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mcq;
