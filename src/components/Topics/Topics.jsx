// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// const API = "https://idea2-backend-0gq8.onrender.com/topic";

// const difficultyColors = {
//   easy: "bg-green-100 text-green-700",
//   medium: "bg-yellow-100 text-yellow-700",
//   hard: "bg-red-100 text-red-700",
// };

// const Topics = () => {
//   const [topics, setTopics] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     title: "",
//     category: "OS",
//     difficulty: "easy",
//     order: "",
//   });

//   // 🔥 description blocks
//   const [descriptions, setDescriptions] = useState([
//     { heading: "", content: "", images: [] },
//   ]);

//   const [animation, setAnimation] = useState(null);

//   /* ================= FETCH TOPICS ================= */
//   const fetchTopics = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(API);
//       const data = await res.json();
//       if (!data.success) throw new Error("Failed to load topics");
//       setTopics(data.data);
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTopics();
//   }, []);

//   /* ================= FORM HANDLERS ================= */
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const updateBlock = (index, field, value) => {
//     const updated = [...descriptions];
//     updated[index][field] = value;
//     setDescriptions(updated);
//   };

//   const addBlock = () => {
//     setDescriptions([
//       ...descriptions,
//       { heading: "", content: "", images: [] },
//     ]);
//   };

//   const removeBlock = (index) => {
//     setDescriptions(descriptions.filter((_, i) => i !== index));
//   };

//   const resetForm = () => {
//     setForm({
//       title: "",
//       category: "OS",
//       difficulty: "easy",
//       order: "",
//     });
//     setDescriptions([{ heading: "", content: "", images: [] }]);
//     setAnimation(null);
//   };

//   /* ================= SUBMIT ================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const fd = new FormData();

//     fd.append("title", form.title);
//     fd.append("category", form.category);
//     fd.append("difficulty", form.difficulty);
//     fd.append("order", form.order);

//     // Send descriptions JSON (without images)
//     fd.append(
//       "descriptions",
//       JSON.stringify(
//         descriptions.map(({ heading, content }) => ({
//           heading,
//           content,
//         }))
//       )
//     );

//     // Upload images per block
//     descriptions.forEach((block, index) => {
//       block.images.forEach((file) => {
//         fd.append(`descriptionImages[${index}]`, file);
//       });
//     });

//     if (animation) fd.append("animation", animation);

//     const toastId = toast.loading("Creating topic...");

//     try {
//       const res = await fetch(API, { method: "POST", body: fd });
//       const data = await res.json();

//       if (!data.success) throw new Error(data.message);

//       toast.success("Topic created successfully", { id: toastId });
//       fetchTopics();
//       resetForm();
//     } catch (err) {
//       toast.error(err.message || "Failed to create topic", { id: toastId });
//     }
//   };

//   /* ================= DELETE ================= */
//   const deleteTopic = async (id) => {
//     if (!window.confirm("Delete this topic?")) return;

//     const toastId = toast.loading("Deleting topic...");
//     try {
//       const res = await fetch(`${API}/${id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (!data.success) throw new Error();

//       toast.success("Topic deleted", { id: toastId });
//       fetchTopics();
//     } catch {
//       toast.error("Failed to delete topic", { id: toastId });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

//         {/* ================= ADD TOPIC ================= */}
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-6 space-y-6"
//         >
//           <h2 className="text-2xl font-bold">➕ Add New Topic</h2>

//           <input
//             name="title"
//             value={form.title}
//             onChange={handleChange}
//             placeholder="Topic Title"
//             required
//             className="w-full rounded-xl border px-4 py-3"
//           />

//           <select
//             name="category"
//             value={form.category}
//             onChange={handleChange}
//             className="w-full rounded-xl border px-4 py-3"
//           >
//             {["OS", "DBMS", "CN", "OOPS", "DSA", "APTITUDE", "INTERVIEW"].map(
//               (c) => (
//                 <option key={c}>{c}</option>
//               )
//             )}
//           </select>

//           <select
//             name="difficulty"
//             value={form.difficulty}
//             onChange={handleChange}
//             className="w-full rounded-xl border px-4 py-3"
//           >
//             <option value="easy">Easy</option>
//             <option value="medium">Medium</option>
//             <option value="hard">Hard</option>
//           </select>

//           <input
//             type="number"
//             name="order"
//             value={form.order}
//             onChange={handleChange}
//             placeholder="Display Order"
//             className="w-full rounded-xl border px-4 py-3"
//           />

//           {/* ================= DESCRIPTION BLOCKS ================= */}
//           <h3 className="font-semibold text-lg">📘 Description Sections</h3>

//           {descriptions.map((block, index) => (
//             <div
//               key={index}
//               className="border rounded-xl p-4 space-y-3 bg-gray-50"
//             >
//               <input
//                 placeholder="Section Heading"
//                 value={block.heading}
//                 onChange={(e) =>
//                   updateBlock(index, "heading", e.target.value)
//                 }
//                 required
//                 className="w-full border rounded-lg px-3 py-2"
//               />

//               <textarea
//                 placeholder="Section Content"
//                 value={block.content}
//                 onChange={(e) =>
//                   updateBlock(index, "content", e.target.value)
//                 }
//                 rows={3}
//                 required
//                 className="w-full border rounded-lg px-3 py-2"
//               />

//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={(e) =>
//                   updateBlock(index, "images", [...e.target.files])
//                 }
//               />

//               {descriptions.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => removeBlock(index)}
//                   className="text-red-500 text-sm"
//                 >
//                   Remove Section
//                 </button>
//               )}
//             </div>
//           ))}

//           <button
//             type="button"
//             onClick={addBlock}
//             className="text-blue-600 font-semibold text-sm"
//           >
//             ➕ Add Section
//           </button>

//           {/* ================= ANIMATION ================= */}
//           <div>
//             <label className="text-sm font-medium">
//               Animation (GIF / Video / Lottie)
//             </label>
//             <input
//               type="file"
//               accept="video/*,.json"
//               onChange={(e) => setAnimation(e.target.files[0])}
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg"
//           >
//             Create Topic
//           </button>
//         </form>

//         {/* ================= TOPIC LIST ================= */}
//         <div className="lg:col-span-2">
//           <h2 className="text-2xl font-bold mb-4">📋 All Topics</h2>

//           {loading ? (
//             <div>Loading topics...</div>
//           ) : (
//             <div className="grid sm:grid-cols-2 gap-6">
//               {topics.map((topic) => (
//                 <div
//                   key={topic._id}
//                   className="bg-white/80 rounded-2xl shadow-lg overflow-hidden"
//                 >
//                   {topic.descriptions?.[0]?.images?.[0] && (
//                     <img
//                       src={topic.descriptions[0].images[0]}
//                       className="h-36 w-full object-cover"
//                     />
//                   )}

//                   <div className="p-4">
//                     <div className="flex justify-between items-center mb-2">
//                       <h3 className="font-bold">{topic.title}</h3>
//                       <span
//                         className={`text-xs px-3 py-1 rounded-full font-semibold ${
//                           difficultyColors[topic.difficulty]
//                         }`}
//                       >
//                         {topic.difficulty}
//                       </span>
//                     </div>

//                     <p className="text-sm text-gray-600 line-clamp-2 mb-3">
//                       {topic.descriptions?.[0]?.content}
//                     </p>

//                     <div className="flex justify-between items-center">
//                       <span className="text-xs font-semibold text-blue-600">
//                         {topic.category}
//                       </span>

//                       <button
//                         onClick={() => deleteTopic(topic._id)}
//                         className="text-red-500 text-sm hover:underline"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Topics;



import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = "https://idea2-backend-0gq8.onrender.com/topic";

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "OS",
    difficulty: "easy",
    order: "",
  });

  const [descriptions, setDescriptions] = useState([
    { heading: "", content: "", images: [] },
  ]);

  const [animation, setAnimation] = useState(null);

  /* ================= FETCH TOPICS ================= */
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      if (!data.success) throw new Error("Failed to load topics");
      setTopics(data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateBlock = (index, field, value) => {
    const updated = [...descriptions];
    updated[index][field] = value;
    setDescriptions(updated);
  };

  const addBlock = () => {
    setDescriptions([
      ...descriptions,
      { heading: "", content: "", images: [] },
    ]);
  };

  const removeBlock = (index) => {
    setDescriptions(descriptions.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "OS",
      difficulty: "easy",
      order: "",
    });
    setDescriptions([{ heading: "", content: "", images: [] }]);
    setAnimation(null);
    setEditingId(null);
  };

  /* ================= START EDIT ================= */
  const startEdit = (topic) => {
    setEditingId(topic._id);

    setForm({
      title: topic.title,
      category: topic.category,
      difficulty: topic.difficulty,
      order: topic.order || "",
    });

    setDescriptions(
      topic.descriptions.map((d) => ({
        heading: d.heading,
        content: d.content,
        images: [], // upload new images only
      }))
    );

    setAnimation(null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    fd.append("title", form.title);
    fd.append("category", form.category);
    fd.append("difficulty", form.difficulty);
    fd.append("order", form.order);

    fd.append(
      "descriptions",
      JSON.stringify(
        descriptions.map(({ heading, content }) => ({
          heading,
          content,
        }))
      )
    );

    descriptions.forEach((block, index) => {
      block.images.forEach((file) => {
        fd.append(`descriptionImages[${index}]`, file);
      });
    });

    if (animation) fd.append("animation", animation);

    const isEdit = Boolean(editingId);
    const toastId = toast.loading(
      isEdit ? "Updating topic..." : "Creating topic..."
    );

    try {
      const res = await fetch(
        isEdit ? `${API}/${editingId}` : API,
        {
          method: isEdit ? "PUT" : "POST",
          body: fd,
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(
        isEdit ? "Topic updated successfully" : "Topic created successfully",
        { id: toastId }
      );

      fetchTopics();
      resetForm();
    } catch (err) {
      toast.error(err.message || "Operation failed", { id: toastId });
    }
  };

  /* ================= DELETE ================= */
  const deleteTopic = async (id) => {
    if (!window.confirm("Delete this topic?")) return;

    const toastId = toast.loading("Deleting topic...");
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error();

      toast.success("Topic deleted", { id: toastId });
      fetchTopics();
    } catch {
      toast.error("Failed to delete topic", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-xl border rounded-3xl shadow-2xl p-6 space-y-6"
        >
          <h2 className="text-2xl font-bold">
            {editingId ? "✏️ Update Topic" : "➕ Add New Topic"}
          </h2>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Topic Title"
            required
            className="w-full rounded-xl border px-4 py-3"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          >
            {["OS", "DBMS", "CN", "OOPS", "DSA", "APTITUDE", "INTERVIEW"].map(
              (c) => (
                <option key={c}>{c}</option>
              )
            )}
          </select>

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <input
            type="number"
            name="order"
            value={form.order}
            onChange={handleChange}
            placeholder="Display Order"
            className="w-full rounded-xl border px-4 py-3"
          />

          {/* ================= DESCRIPTIONS ================= */}
          <h3 className="font-semibold text-lg">📘 Description Sections</h3>

          {descriptions.map((block, index) => (
            <div key={index} className="border rounded-xl p-4 bg-gray-50 space-y-3">
              <input
                placeholder="Section Heading"
                value={block.heading}
                onChange={(e) =>
                  updateBlock(index, "heading", e.target.value)
                }
                required
                className="w-full border rounded-lg px-3 py-2"
              />

              <textarea
                placeholder="Section Content"
                value={block.content}
                onChange={(e) =>
                  updateBlock(index, "content", e.target.value)
                }
                rows={3}
                required
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  updateBlock(index, "images", [...e.target.files])
                }
              />

              {descriptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="text-red-500 text-sm"
                >
                  Remove Section
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addBlock}
            className="text-blue-600 font-semibold text-sm"
          >
            ➕ Add Section
          </button>

          {/* ================= ANIMATION ================= */}
          <input
            type="file"
            accept="video/*,.json"
            onChange={(e) => setAnimation(e.target.files[0])}
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold"
          >
            {editingId ? "Update Topic" : "Create Topic"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full text-sm text-gray-600 underline"
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* ================= TOPIC LIST ================= */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">📋 All Topics</h2>

          {loading ? (
            <div>Loading topics...</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  {topic.descriptions?.[0]?.images?.[0] && (
                    <img
                      src={topic.descriptions[0].images[0]}
                      className="h-36 w-full object-cover"
                    />
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">{topic.title}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${difficultyColors[topic.difficulty]}`}
                      >
                        {topic.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {topic.descriptions?.[0]?.content}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-blue-600">
                        {topic.category}
                      </span>

                      <div className="flex gap-4">
                        <button
                          onClick={() => startEdit(topic)}
                          className="text-blue-500 text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteTopic(topic._id)}
                          className="text-red-500 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Topics;
