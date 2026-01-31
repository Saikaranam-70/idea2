import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API = "https://oneserve.in";

const Mcq = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

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
      if (data.success) setTopics(data.data);
    } catch {
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
      if (data.success) setMcqs(data.mcqs);
    } catch {
      toast.error("Failed to load MCQs");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SINGLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTopic) return toast.error("Select a topic");
    if (form.options.some((o) => !o.trim()))
      return toast.error("All 4 options required");

    try {
      const url = editId ? `${API}/mcq/${editId}` : `${API}/mcq`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedTopic, ...form }),
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

  /* ================= BULK SUBMIT ================= */
  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTopic) return toast.error("Select a topic first");

    let mcqs;
    try {
      mcqs = JSON.parse(bulkText);
    } catch {
      return toast.error("Invalid JSON format");
    }

    if (!Array.isArray(mcqs) || mcqs.length === 0)
      return toast.error("MCQs must be a non-empty array");

    try {
      const res = await fetch(`${API}/mcq/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: selectedTopic, mcqs }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(`${mcqs.length} MCQs uploaded 🎉`);
      setBulkText("");
      fetchMcqs(selectedTopic);
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this MCQ?")) return;
    try {
      const res = await fetch(`${API}/mcq/${id}`, { method: "DELETE" });
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
    setIsBulkMode(false);
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
      <h1 className="text-3xl font-bold mb-6">🧠 MCQ Admin Panel</h1>

      {/* ================= TOPIC SELECT ================= */}
      <select
        className="w-full p-3 mb-6 rounded-xl border"
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

      {/* ================= MODE TOGGLE ================= */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setIsBulkMode(false)}
          className={`px-5 py-2 rounded-xl ${
            !isBulkMode ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          ➕ Single MCQ
        </button>
        <button
          onClick={() => setIsBulkMode(true)}
          className={`px-5 py-2 rounded-xl ${
            isBulkMode ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          📦 Bulk Upload
        </button>
      </div>

      {/* ================= FORMS ================= */}
      {!isBulkMode ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow p-6 mb-10"
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

          <button className="bg-black text-white px-6 py-3 rounded-xl">
            {editId ? "Update MCQ" : "Add MCQ"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleBulkSubmit}
          className="bg-white rounded-3xl shadow p-6 mb-10"
        >
          <h2 className="text-xl font-semibold mb-3">
            📦 Bulk Upload MCQs
          </h2>

          <textarea
            rows={14}
            className="w-full p-4 rounded-xl border font-mono text-sm"
            placeholder='[ { "question": "...", "options": ["a","b","c","d"], "correctOptionIndex": 0 } ]'
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />

          <button className="mt-4 bg-black text-white px-6 py-3 rounded-xl">
            Upload MCQs
          </button>
        </form>
      )}

      {/* ================= MCQ LIST ================= */}
      {loading && <p>Loading...</p>}
      <div className="space-y-4">
        {mcqs.map((mcq, idx) => (
          <div key={mcq._id} className="bg-white rounded-2xl shadow p-5">
            <p className="font-semibold mb-2">
              {idx + 1}. {mcq.question}
            </p>

            <ul className="grid grid-cols-2 gap-2 mb-3">
              {mcq.options.map((o, i) => (
                <li
                  key={i}
                  className={`p-2 rounded border ${
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
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(mcq._id)}
                className="px-4 py-2 bg-red-600 text-white rounded"
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
