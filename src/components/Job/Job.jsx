import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = "https://oneserve.in/job";

const Job = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    companyName: "",
    position: "",
    experience: 0,
    location: "Remote",
    graduationYear: "",
    isInternship: false,
    isHackathon: false,
    stipend: "",
    applicationLink: "",
  });

  /* ================= FETCH JOBS ================= */
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/all`);
      const data = await res.json();
      setJobs(data.data || []);
    } catch {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  /* ================= HANDLE FORM ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Graduation year parsing
    let gradYears = [];
    if (form.graduationYear.trim()) {
      gradYears = form.graduationYear
        .split(",")
        .map((y) => y.trim())
        .filter((y) => /^\d{4}$/.test(y))
        .map(Number);

      if (gradYears.length === 0) {
        toast.error("Enter graduation years like: 2023,2024,2025");
        return;
      }
    }

    const payload = {
      ...form,
      graduationYear: gradYears,
    };

    if (!form.isInternship) delete payload.stipend;

    try {
      const url = editingId ? `${API}/${editingId}` : API;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success(
        editingId ? "Job updated successfully" : "Job created successfully"
      );

      resetForm();
      fetchJobs();
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (job) => {
    setEditingId(job._id);
    setForm({
      companyName: job.companyName,
      position: job.position,
      experience: job.experience,
      location: job.location,
      graduationYear: job.graduationYear?.join(",") || "",
      isInternship: job.isInternship,
      isHackathon: job.isHackathon,
      stipend: job.stipend || "",
      applicationLink: job.applicationLink,
    });

    toast("Editing job ✏️");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      toast.success("Job deleted");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      companyName: "",
      position: "",
      experience: 0,
      location: "Remote",
      graduationYear: "",
      isInternship: false,
      isHackathon: false,
      stipend: "",
      applicationLink: "",
    });
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🛠 Admin Job Panel</h1>

        {/* ===== FORM ===== */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow mb-10 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input className="input" placeholder="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required />
          <input className="input" placeholder="Position" name="position" value={form.position} onChange={handleChange} required />
          <input type="number" className="input" placeholder="Experience (years)" name="experience" value={form.experience} onChange={handleChange} />
          <input className="input" placeholder="Location" name="location" value={form.location} onChange={handleChange} />

          <input
            className="input md:col-span-2"
            placeholder="Graduation Years (e.g. 2023,2024)"
            name="graduationYear"
            value={form.graduationYear}
            onChange={handleChange}
          />

          {/* TYPE */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isInternship" checked={form.isInternship} onChange={handleChange} />
              Internship
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" name="isHackathon" checked={form.isHackathon} onChange={handleChange} />
              Hackathon
            </label>
          </div>

          {form.isInternship && (
            <input type="number" className="input" placeholder="Stipend" name="stipend" value={form.stipend} onChange={handleChange}/>
          )}

          <input
            className="input md:col-span-2"
            placeholder="Application Link"
            name="applicationLink"
            value={form.applicationLink}
            onChange={handleChange}
            required
          />

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              {editingId ? "Update Job" : "Create Job"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* ===== LIST ===== */}
        <h2 className="text-2xl font-semibold mb-4">📋 Jobs List</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {job.position} @ {job.companyName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {job.location} •{" "}
                    {job.isHackathon
                      ? "Hackathon"
                      : job.isInternship
                      ? `Internship (₹${job.stipend})`
                      : "Full-Time"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleEdit(job)} className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(job._id)} className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .input {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          outline: none;
        }
        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.3);
        }
      `}</style>
    </div>
  );
};

export default Job;
