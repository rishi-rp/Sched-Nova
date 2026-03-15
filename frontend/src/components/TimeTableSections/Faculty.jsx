import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Users,
  UserPlus,
  Clock,
  Hash,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../../Api/api";



const Faculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [bulkInput, setBulkInput] = useState("");
  const [singleName, setSingleName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [periodSlots, setPeriodSlots] = useState([]);

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const { timetableId } = useParams();

  const isValidFacultyId = (id) =>
  /^[A-Z0-9_-]+$/i.test(id); // letters, numbers, _ -

  const canSave =
    faculties.length > 0 &&
    faculties.every(
      f =>
        f.facultyId &&
        isValidFacultyId(f.facultyId)
    ) &&
    !error &&
    isDirty;



  // Temporary edit state
  const [editForm, setEditForm] = useState({
    name: "",
    facultyId: "",
    availability: {} // { Monday: [0, 2, 4], Tuesday: [1, 3] }
  });


  useEffect(() => {
    const load = async () => {
      try {
        const [facRes, availRes] = await Promise.all([
          api.get(`/timetables/${timetableId}/faculties`),
          api.get(`/timetables/${timetableId}/faculty-availability`)
        ]);

        const availLookup = {};
        availRes.data.forEach(a => {
          availLookup[a.faculty_id] = a.availability;
        });
        

        if (facRes.data.length === 0) {
          setFaculties([]);
          setIsDirty(false);
          return;
        }

        setFaculties(
          facRes.data.map(f => ({
            id: f.id,
            name: f.name,
            facultyId: f.faculty_enrollment,
            availability:
              availLookup[f.id] ??
              initializeAvailability(daysOfWeek, periodSlots)
          }))
        );


        setIsDirty(false);
      } catch (e) {
        setError("Failed to load faculties");
        console.log(e);
      }
    };

    load();
  }, [timetableId]);



  useEffect(() => {
    const loadAcademicPeriods = async () => {
      try {
        const res = await api.get(
          `/timetables/${timetableId}/periods`
        );

        if (res.data.length === 0) {
          setError("Please configure academic periods first.");
          return;
        }

        // 1️⃣ Extract unique days
        const days = [...new Set(res.data.map(p => p.day))];
        setDaysOfWeek(days);

        // 2️⃣ Deduplicate periods by period_number (order matters)
        const periodMap = new Map();

        res.data.forEach(p => {
          if (!periodMap.has(p.period_number)) {
            periodMap.set(p.period_number, {
              start: p.start_time,
              end: p.end_time
            });
          }
        });

        // 3️⃣ Convert to ordered array
        setPeriodSlots(
          Array.from(periodMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([, value]) => value)
        );

      } catch (e) {
        setError("Failed to load academic periods");
      }
    };

    loadAcademicPeriods();
  }, [timetableId]);



  // Add faculties from comma-separated input
  const handleBulkAdd = () => {
    setError("");
    setSuccess("");

    if (!bulkInput.trim()) {
      setError("Please enter at least one faculty name");
      return;
    }

    const names = bulkInput
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      setError("No valid names found");
      return;
    }

    const newFaculties = names.map(name => ({
      id: `FAC-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      facultyId: "",
      availability: initializeAvailability(daysOfWeek, periodSlots)
    }));


    setFaculties([...faculties, ...newFaculties]);
    setIsDirty(true);
    setBulkInput("");
    setSuccess(`Added ${names.length} ${names.length === 1 ? "faculty" : "faculties"} successfully`);
  };

  // Add single faculty
  const handleSingleAdd = () => {
    setError("");
    setSuccess("");

    if (!singleName.trim()) {
      setError("Please enter a faculty name");
      return;
    }

    const newFaculty = {
      id: `FAC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: singleName.trim(),
      facultyId: "",
      availability: initializeAvailability(daysOfWeek, periodSlots)

    };

    setFaculties([...faculties, newFaculty]);
    setSingleName("");
    setSuccess("Faculty added successfully");
  };

  // Initialize availability (all periods available by default)
  const initializeAvailability = (days, periods) => {
    const availability = {};
    days.forEach(day => {
      availability[day] = periods.map((_, index) => index);
    });
    return availability;
  };


  // Start editing a faculty
  const startEdit = (faculty) => {
    setEditingId(faculty.id);
    setEditForm({
      name: faculty.name,
      facultyId: faculty.facultyId,
      availability: { ...faculty.availability }
    });
    setError("");
    setSuccess("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", facultyId: "", availability: {} });
    setError("");
  };

  // Save edited faculty
  const saveEdit = () => {
    setError("");
    setSuccess("");

    // Validate faculty ID uniqueness
    if (editForm.facultyId) {
      const duplicate = faculties.find(
        (f) => f.id !== editingId && f.facultyId === editForm.facultyId
      );
      if (duplicate) {
        setError(`Faculty ID "${editForm.facultyId}" is already assigned to ${duplicate.name}`);
        return;
      }
    }

    setFaculties(
      faculties.map((f) =>
        f.id === editingId
          ? {
              ...f,
              name: editForm.name,
              facultyId: editForm.facultyId,
              availability: editForm.availability
            }
          : f
      )
    );
    setIsDirty(true);

    setSuccess("Faculty updated successfully");
    cancelEdit();
  };

  // Delete faculty
  const deleteFaculty = (id) => {
    setFaculties(faculties.filter((f) => f.id !== id));
    setIsDirty(true);
    setSuccess("Faculty deleted successfully");
    if (editingId === id) {
      cancelEdit();
    }
  };

  // Toggle period availability
  const togglePeriod = (day, periodIndex) => {
    const dayAvailability = editForm.availability[day] || [];
    const newAvailability = dayAvailability.includes(periodIndex)
      ? dayAvailability.filter((p) => p !== periodIndex)
      : [...dayAvailability, periodIndex].sort((a, b) => a - b);

    setEditForm({
      ...editForm,
      availability: {
        ...editForm.availability,
        [day]: newAvailability
      }
    });
  };

  // Toggle all periods for a day
  const toggleAllDay = (day) => {
    const dayAvailability = editForm.availability[day] || [];
    const allSelected = dayAvailability.length === periodSlots.length;

    setEditForm({
      ...editForm,
      availability: {
        ...editForm.availability,
        [day]: allSelected ? [] : periodSlots.map((_, index) => index)
      }
    });
  };

  const handleSave = async () => {
    if (!canSave) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = faculties.map(f => ({
        timetable_id: Number(timetableId),
        name: f.name.trim(),
        faculty_enrollment: f.facultyId.trim()
      }));

      console.log("Faculty save payload:", payload);
      const res = await api.get(`/timetables/${timetableId}/faculties`);
      const facultyIdMap = {};
      res.data.forEach(f => {
        facultyIdMap[f.faculty_enrollment] = f.id;
      });
      await api.put("/faculties/bulk", payload);
      await api.post(
        `/timetables/${timetableId}/faculty-availability`,
        faculties.map(f => ({
          faculty_id: facultyIdMap[f.facultyId],      // backend faculty id
          availability: f.availability
        }))
      );


      setIsDirty(false);
      setSuccess("Faculty configuration saved successfully!");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Failed to save faculty configuration");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 min-h-screen font-sans text-slate-800">
      {/* HERO */}
      <section className="relative bg-[#9333ea] px-8 py-14">
        <div className="max-w-7xl mx-auto text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6 text-sm">
            <Sparkles className="w-4 h-4 text-[#FFD166]" />
            Faculty Management
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-3">
            Faculty <span className="text-[#FFD166]">Directory</span>
          </h1>

          <p className="text-purple-100 text-base max-w-2xl leading-relaxed">
            Manage faculty members, their unique IDs, and weekly availability across all academic periods.
          </p>

          <div className="flex gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FFD166]" />
              {faculties.length} {faculties.length === 1 ? "Faculty" : "Faculties"}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFD166]" />
              {periodSlots.length} Daily Periods
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-8 py-12 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          
          {/* MESSAGES */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg border border-red-400 bg-red-50/70 backdrop-blur-sm text-sm text-red-700 font-medium shadow-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 px-4 py-3 rounded-lg border border-green-400 bg-green-50/70 backdrop-blur-sm text-sm text-green-700 font-medium shadow-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* ADD FACULTY SECTION */}
          <div className="mb-12">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Add Faculty Members
            </h2>

            {/* Bulk Add */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Add Multiple (comma-separated)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="e.g., Dr. Smith, Prof. Johnson, Dr. Williams"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleBulkAdd()}
                />
                <button
                  onClick={handleBulkAdd}
                  className="px-6 py-3 bg-[#9333ea] text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add All
                </button>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          {faculties.length > 0 && (
            <div className="relative my-10">
              <div className="h-px bg-slate-200" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs font-semibold text-slate-400">
                FACULTY LIST
              </span>
            </div>
          )}

          {/* FACULTY LIST */}
          {faculties.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Faculty Added Yet</h3>
              <p className="text-sm text-slate-500">Start by adding faculty members using the form above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faculties.map((faculty) => (
                <div
                  key={faculty.id}
                  className="border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-purple-300 transition-colors"
                >
                  {/* FACULTY HEADER */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {faculty.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{faculty.name}</h3>
                        <p className="text-sm text-slate-500">
                          {faculty.facultyId ? (
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {faculty.facultyId}
                            </span>
                          ) : (
                            <span className="text-orange-600">ID not assigned</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingId === faculty.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-4 py-2 bg-[#FFD166] text-black rounded-lg hover:bg-green-700 hover:text-white transition-colors flex items-center gap-2"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500
                                        hover:bg-red-100 hover:text-red-600 transition-colors
                                        disabled:opacity-40"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(faculty)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFaculty(faculty.id)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  

                  {/* EDIT FORM */}
                  {editingId === faculty.id && (
                    <div className="p-6 space-y-6 bg-white">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Faculty Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Faculty ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editForm.facultyId}
                            onChange={(e) =>
                              setEditForm({ ...editForm, facultyId: e.target.value.toUpperCase() })
                            }
                            placeholder="e.g., FAC001"
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none uppercase"
                          />
                        </div>
                      </div>

                      {/* Availability */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          Weekly Availability
                        </h4>

                        <div className="space-y-4">
                          {daysOfWeek.map((day) => {
                            const dayAvailability = editForm.availability[day] || [];
                            const allSelected = dayAvailability.length === periodSlots.length;

                            return (
                              <div
                                key={day}
                                className="border border-slate-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-slate-800">{day}</h5>
                                  <button
                                    onClick={() => toggleAllDay(day)}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                      allSelected
                                        ? "bg-purple-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                  >
                                    {allSelected ? "Deselect All" : "Select All"}
                                  </button>
                                </div>

                                <div className="grid grid-cols-6 gap-2">
                                  {periodSlots.map((period, index) => {
                                    const isSelected = dayAvailability.includes(index);
                                    return (
                                      <button
                                        key={index}
                                        onClick={() => togglePeriod(day, index)}
                                        className={`relative px-3 py-2 rounded-lg text-xs font-medium transition
                                            backdrop-blur-sm border
                                            ${
                                              isSelected
                                                ? "bg-white/15 text-emerald-800 border-emerald-300/100"
                                                : "bg-slate-100/60 text-slate-600 border-slate-300/40 hover:border-emerald-200/40 hover:bg-slate-100/80"
                                            }
                                          `}
                                      >
                                        {isSelected && (
                                          <CheckCircle2 className="absolute -top-1 -right-1 w-3.5 h-3.5 text-white bg-green-600 rounded-full" />
                                        )}
                                        <div className="font-semibold">P{index + 1}</div>
                                        <div className="text-[10px] opacity-90">
                                          {period.start} - {period.end}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="mt-2 text-xs text-slate-500">
                                  {dayAvailability.length} of {periodSlots.length} periods available
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIEW MODE - SUMMARY */}
                  {editingId !== faculty.id && (
                    <div className="px-6 py-4 bg-slate-50">
                      <div className="text-sm text-slate-600">
                        <strong>Availability:</strong> {
                          Object.values(faculty.availability)
                            .flat()
                            .length
                        } total slots across all days
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-12 flex justify-end">
            <button
              disabled={!canSave || loading}
              onClick={handleSave}
              className="px-6 py-3 bg-[#9333ea] text-white rounded-xl font-semibold
                shadow-lg hover:bg-[#7c2dc4]
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Faculty;