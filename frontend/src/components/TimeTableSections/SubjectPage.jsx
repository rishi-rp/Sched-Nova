import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  BookOpen,
  UserPlus,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  DoorOpen,
  Users,
  Calendar
} from "lucide-react";

// Mock data - in real app, this would come from Rooms.jsx and FacultyManagement.jsx
const mockRoomGroups = [
  { id: "rg1", name: "Lab" },
  { id: "rg2", name: "Lecture Hall" },
  { id: "rg3", name: "Tutorial Room" },
  { id: "rg4", name: "Auditorium" }
];

const mockFaculty = [
  { id: "fac1", name: "Dr. Smith", facultyId: "FAC001" },
  { id: "fac2", name: "Prof. Johnson", facultyId: "FAC002" },
  { id: "fac3", name: "Dr. Williams", facultyId: "FAC003" },
  { id: "fac4", name: "Prof. Brown", facultyId: "FAC004" },
  { id: "fac5", name: "Dr. Davis", facultyId: "FAC005" }
];

const SubjectPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [bulkInput, setBulkInput] = useState("");
  const [singleSubject, setSingleSubject] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    classesPerWeek: 1,
    roomType: "",
    assignedFaculty: []
  });

  // Add subjects from comma-separated input
  const handleBulkAdd = () => {
    setError("");
    setSuccess("");

    if (!bulkInput.trim()) {
      setError("Please enter at least one subject name");
      return;
    }

    const names = bulkInput
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      setError("No valid subject names found");
      return;
    }

    // Check for duplicates with existing subjects
    const duplicates = names.filter((name) =>
      subjects.some((s) => s.name.toLowerCase() === name.toLowerCase())
    );

    if (duplicates.length > 0) {
      setError(`Subject(s) already exist: ${duplicates.join(", ")}`);
      return;
    }

    const newSubjects = names.map((name) => ({
      id: `SUBJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      classesPerWeek: 1,
      roomType: "",
      assignedFaculty: []
    }));

    setSubjects([...subjects, ...newSubjects]);
    setBulkInput("");
    setSuccess(`Added ${names.length} ${names.length === 1 ? "subject" : "subjects"} successfully`);
  };

  // Add single subject
  const handleSingleAdd = () => {
    setError("");
    setSuccess("");

    if (!singleSubject.trim()) {
      setError("Please enter a subject name");
      return;
    }

    // Check for duplicate
    if (subjects.some((s) => s.name.toLowerCase() === singleSubject.trim().toLowerCase())) {
      setError(`Subject "${singleSubject}" already exists`);
      return;
    }

    const newSubject = {
      id: `SUBJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: singleSubject.trim(),
      classesPerWeek: 1,
      roomType: "",
      assignedFaculty: []
    };

    setSubjects([...subjects, newSubject]);
    setSingleSubject("");
    setSuccess("Subject added successfully");
  };

  // Delete subject
  const deleteSubject = (id) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    setSuccess("Subject deleted successfully");
    if (editingSubject === id) {
      cancelEdit();
    }
  };

  // Start editing a subject
  const startEdit = (subject) => {
    setEditingSubject(subject.id);
    setEditForm({
      name: subject.name,
      classesPerWeek: subject.classesPerWeek,
      roomType: subject.roomType,
      assignedFaculty: [...subject.assignedFaculty]
    });
    setError("");
    setSuccess("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSubject(null);
    setEditForm({
      name: "",
      classesPerWeek: 1,
      roomType: "",
      assignedFaculty: []
    });
    setError("");
  };

  // Save edited subject
  const saveEdit = () => {
    setError("");
    setSuccess("");

    if (!editForm.name.trim()) {
      setError("Subject name cannot be empty");
      return;
    }

    // Check for duplicate name (excluding current subject)
    if (
      subjects.some(
        (s) =>
          s.id !== editingSubject &&
          s.name.toLowerCase() === editForm.name.trim().toLowerCase()
      )
    ) {
      setError(`Subject "${editForm.name}" already exists`);
      return;
    }

    if (editForm.classesPerWeek < 1) {
      setError("Classes per week must be at least 1");
      return;
    }

    setSubjects(
      subjects.map((s) =>
        s.id === editingSubject
          ? {
              ...s,
              name: editForm.name.trim(),
              classesPerWeek: editForm.classesPerWeek,
              roomType: editForm.roomType,
              assignedFaculty: editForm.assignedFaculty
            }
          : s
      )
    );

    setSuccess("Subject updated successfully");
    cancelEdit();
  };

  // Toggle faculty assignment
  const toggleFaculty = (facultyId) => {
    if (editForm.assignedFaculty.includes(facultyId)) {
      setEditForm({
        ...editForm,
        assignedFaculty: editForm.assignedFaculty.filter((id) => id !== facultyId)
      });
    } else {
      setEditForm({
        ...editForm,
        assignedFaculty: [...editForm.assignedFaculty, facultyId]
      });
    }
  };

  // Get faculty names by IDs
  const getFacultyNames = (facultyIds) => {
    return facultyIds
      .map((id) => {
        const faculty = mockFaculty.find((f) => f.id === id);
        return faculty ? faculty.name : null;
      })
      .filter(Boolean);
  };

  // Get room type name
  const getRoomTypeName = (roomTypeId) => {
    const roomType = mockRoomGroups.find((rg) => rg.id === roomTypeId);
    return roomType ? roomType.name : "Not assigned";
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 min-h-screen font-sans text-slate-800">
      {/* HERO */}
      <section className="relative bg-[#9333ea] px-8 py-14">
        <div className="max-w-7xl mx-auto text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6 text-sm">
            <Sparkles className="w-4 h-4 text-[#FFD166]" />
            Subject Management
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-3">
            Academic <span className="text-[#FFD166]">Subjects</span>
          </h1>

          <p className="text-purple-100 text-base max-w-2xl leading-relaxed">
            Manage academic subjects, assign faculty members, specify weekly class frequency, and designate room types for optimal scheduling.
          </p>

          <div className="flex gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FFD166]" />
              {subjects.length} {subjects.length === 1 ? "Subject" : "Subjects"}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FFD166]" />
              {mockFaculty.length} Faculty Available
            </div>
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-[#FFD166]" />
              {mockRoomGroups.length} Room Types
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

          {/* ADD SUBJECT SECTION */}
          <div className="mb-12">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Add Subjects
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
                  placeholder="e.g., Mathematics, Physics, Chemistry, Biology"
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
          {subjects.length > 0 && (
            <div className="relative my-10">
              <div className="h-px bg-slate-200" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs font-semibold text-slate-400">
                SUBJECT LIST
              </span>
            </div>
          )}

          {/* SUBJECT LIST */}
          {subjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Subjects Added Yet</h3>
              <p className="text-sm text-slate-500">Start by adding subjects using the form above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-purple-300 transition-colors"
                >
                  {/* SUBJECT HEADER */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {subject.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{subject.name}</h3>
                        <div className="flex gap-4 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {subject.classesPerWeek} {subject.classesPerWeek === 1 ? "class" : "classes"}/week
                          </span>
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3 h-3" />
                            {getRoomTypeName(subject.roomType)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {subject.assignedFaculty.length} {subject.assignedFaculty.length === 1 ? "faculty" : "faculties"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingSubject === subject.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-4 py-2
                                        bg-green-500/10
                                        text-black
                                        border border-green-400/40
                                        backdrop-blur-md
                                        rounded-lg
                                        hover:bg-green-500/30
                                        hover:border-green-300/100
                                        transition-all
                                        flex items-center gap-1
                                        text-xs"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500
                                      hover:bg-red-100 hover:text-red-600"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(subject)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSubject(subject.id)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* EDIT FORM */}
                  {editingSubject === subject.id && (
                    <div className="p-6 space-y-6 bg-white">
                      {/* Subject Name & Classes Per Week */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subject Name
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
                            Classes Per Week
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={editForm.classesPerWeek}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                classesPerWeek: parseInt(e.target.value) || 1
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Room Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                          Room Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {mockRoomGroups.map((roomGroup) => {
                            const isSelected = editForm.roomType === roomGroup.id;
                            return (
                              <button
                                key={roomGroup.id}
                                onClick={() =>
                                  setEditForm({ ...editForm, roomType: roomGroup.id })
                                }
                                className={`relative px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                                  isSelected
                                    ? "border-purple-600 bg-purple-50 text-purple-700"
                                    : "border-slate-300 bg-white text-slate-700 hover:border-purple-300"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="absolute -top-2 -right-2 w-5 h-5 text-white bg-purple-600 rounded-full" />
                                )}
                                <DoorOpen className="w-5 h-5 mx-auto mb-1" />
                                {roomGroup.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Faculty Assignment */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                          Assigned Faculty (Multiple Selection)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                          {mockFaculty.map((faculty) => {
                            const isSelected = editForm.assignedFaculty.includes(faculty.id);
                            return (
                              <button
                                key={faculty.id}
                                onClick={() => toggleFaculty(faculty.id)}
                                className={`relative px-4 py-3 rounded-lg border-2 text-left transition-all ${
                                  isSelected
                                    ? "border-green-600 bg-green-50"
                                    : "border-slate-300 bg-white hover:border-purple-300"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="absolute -top-2 -right-2 w-5 h-5 text-white bg-green-600 rounded-full" />
                                )}
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                                    {faculty.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-medium text-sm ${
                                      isSelected ? "text-green-700" : "text-slate-800"
                                    }`}>
                                      {faculty.name}
                                    </div>
                                    <div className={`text-xs ${
                                      isSelected ? "text-green-600" : "text-slate-500"
                                    }`}>
                                      {faculty.facultyId}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {editForm.assignedFaculty.length > 0 && (
                          <div className="mt-3 text-sm text-slate-600">
                            <strong>{editForm.assignedFaculty.length}</strong> faculty member(s) selected
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VIEW MODE - SUMMARY */}
                  {editingSubject !== subject.id && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Room Type */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1">ROOM TYPE</div>
                          <div className="text-sm text-slate-700">
                            {subject.roomType ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">
                                <DoorOpen className="w-4 h-4" />
                                {getRoomTypeName(subject.roomType)}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Not assigned</span>
                            )}
                          </div>
                        </div>

                        {/* Assigned Faculty */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1">FACULTY</div>
                          <div className="text-sm text-slate-700">
                            {subject.assignedFaculty.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {getFacultyNames(subject.assignedFaculty).map((name, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium text-xs"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No faculty assigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-12 flex justify-end">
          <button
            onClick={() => {
              console.log("Configuration saved");
            }}
            className="px-6 py-3 bg-[#9333ea] text-white rounded-xl font-semibold
              shadow-lg hover:bg-[#7c2dc4]
              transition-all duration-200"
          >
            Save Configuration
          </button>
        </div>
        </div>
      </section>
    </main>
  );
};

export default SubjectPage;