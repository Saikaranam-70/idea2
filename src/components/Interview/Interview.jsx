import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API = "https://oneserve.in";

const Interview = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    question: "",
    timeLimit: 60,
    structureHints: [""],
    difficulty: "easy",
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

  /* ================= FETCH QUESTIONS ================= */
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = selectedTopic
        ? `${API}/interview/topic/${selectedTopic}`
        : `${API}/interview`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setQuestions(data.data);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTopic) return toast.error("Select a topic");
    if (!form.question.trim()) return toast.error("Question required");

    try {
      const res = await fetch(
        editId ? `${API}/interview/${editId}` : `${API}/interview`,
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicId: selectedTopic,
            ...form,
            structureHints: form.structureHints.filter(Boolean),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(editId ? "Question Updated" : "Question Added");
      resetForm();
      fetchQuestions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      const res = await fetch(`${API}/interview/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Question Deleted");
      fetchQuestions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (q) => {
    setEditId(q._id);
    setSelectedTopic(q.topicId._id || q.topicId);
    setForm({
      question: q.question,
      timeLimit: q.timeLimit,
      difficulty: q.difficulty,
      structureHints: q.structureHints?.length
        ? q.structureHints
        : [""],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      question: "",
      timeLimit: 60,
      difficulty: "easy",
      structureHints: [""],
    });
  };

  useEffect(() => {
    fetchTopics();
    fetchQuestions();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedTopic]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        🎤 Interview Questions Admin
      </h1>

      {/* ================= TOPIC SELECT ================= */}
      <select
        className="w-full p-3 mb-6 rounded-xl border shadow-sm"
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
      >
        <option value="">All Topics</option>
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
          {editId ? "✏️ Edit Question" : "➕ Add Interview Question"}
        </h2>

        <textarea
          className="w-full p-3 mb-4 rounded-xl border"
          placeholder="Interview Question"
          value={form.question}
          onChange={(e) =>
            setForm({ ...form, question: e.target.value })
          }
        />

        {/* Time + Difficulty */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            min="10"
            className="p-3 rounded-xl border"
            placeholder="Time Limit (sec)"
            value={form.timeLimit}
            onChange={(e) =>
              setForm({ ...form, timeLimit: Number(e.target.value) })
            }
          />

          <select
            className="p-3 rounded-xl border"
            value={form.difficulty}
            onChange={(e) =>
              setForm({ ...form, difficulty: e.target.value })
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Structure Hints */}
        <div className="mb-4">
          <p className="font-medium mb-2">Structure Hints</p>

          {form.structureHints.map((hint, i) => (
            <input
              key={i}
              className="w-full p-3 mb-2 rounded-xl border"
              placeholder={`Hint ${i + 1}`}
              value={hint}
              onChange={(e) => {
                const hints = [...form.structureHints];
                hints[i] = e.target.value;
                setForm({ ...form, structureHints: hints });
              }}
            />
          ))}

          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                structureHints: [...form.structureHints, ""],
              })
            }
            className="text-sm text-blue-600 mt-2"
          >
            ➕ Add Hint
          </button>
        </div>

        <div className="flex gap-3">
          <button className="bg-black text-white px-6 py-3 rounded-xl">
            {editId ? "Update Question" : "Add Question"}
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

      {/* ================= LIST ================= */}
      <div className="space-y-4">
        {loading && <p>Loading...</p>}

        {questions.map((q, idx) => (
          <div
            key={q._id}
            className="bg-white rounded-2xl shadow p-5"
          >
            <p className="font-semibold mb-1">
              {idx + 1}. {q.question}
            </p>

            <p className="text-sm text-gray-600 mb-2">
              ⏱ {q.timeLimit}s • 🎯 {q.difficulty}
            </p>

            {q.structureHints?.length > 0 && (
              <ul className="list-disc pl-6 text-sm text-gray-700 mb-3">
                {q.structureHints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(q)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(q._id)}
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

export default Interview;
