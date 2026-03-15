import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  Users,
  Home,
  Network,
  ChevronRight,
  Settings,
  CheckCircle2,
  Circle,
  Trash2
} from "lucide-react";
import Header from "../Header/Header";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../Api/api";
import { getAccessToken } from "../../auth/token";


const DashBoard = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [departments, setDepartments] = useState([]);
  const [deptName, setDeptName] = useState("");
  const [error, setError] = useState("");
  const { timetableId } = useParams();

  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get(
          `/timetables/${timetableId}/departments`
        );
        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
        setError("Failed to load departments");
      }
    };

    if (timetableId) {
      fetchDepartments();
    }
  }, [timetableId]);

  /* ---------------- CORE SECTIONS ---------------- */
  const coreSections = [
    {
      id: "01",
      title: "Academic Periods",
      desc: "Define daily schedules, break durations, and time slots.",
      icon: PlusCircle,
      path: `/timetables/${timetableId}/academic-periods`,
      status: "completed",
      theme: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        accent: "text-blue-600",
        border: "hover:border-blue-400",
        shadow: "hover:shadow-blue-100"
      }
    },
    {
      id: "02",
      title: "Rooms & Venues",
      desc: "Configure classrooms, laboratories, and capacities.",
      icon: Home,
      path: `/timetables/${timetableId}/rooms`,
      status: "ready",
      theme: {
        bg: "bg-amber-50",
        icon: "text-amber-600",
        accent: "text-amber-600",
        border: "hover:border-amber-400",
        shadow: "hover:shadow-amber-100"
      }
    },
    {
      id: "03",
      title: "Faculty",
      desc: "Manage instructors, availability, and specializations.",
      icon: Users,
      path: `/timetables/${timetableId}/faculty`,
      status: "pending",
      theme: {
        bg: "bg-emerald-50",
        icon: "text-emerald-600",
        accent: "text-emerald-600",
        border: "hover:border-emerald-400",
        shadow: "hover:shadow-emerald-100"
      }
    }
  ];

  /* ---------------- ADD DEPARTMENT ---------------- */
  const handleAddDepartment = async () => {
    if (!deptName.trim()) {
      setError("Department name is required");
      return;
    }

    const exists = departments.some(
      d => d.name.toLowerCase() === deptName.trim().toLowerCase()
    );

    if (exists) {
      setError("Department already exists");
      return;
    }

    try {
      setError("");

      const payload = {
        name: deptName.trim(),
      };
      console.log("Sending department:", {
        name: deptName.trim()
      });

      const res = await api.post(`timetables/${timetableId}/departments`, payload);

      setDepartments(prev => [...prev, res.data]);
      setDeptName("");

    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        // FastAPI validation error
        setError(detail[0]?.msg || "Invalid input");
      } else {
        setError(detail || "Failed to add department");
      }
    }
  };

  /* ---------------- DELETE DEPARTMENT ---------------- */
  const handleDeleteDepartment = async (departmentId) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this department?`
    );
    if (!confirmed) return;

    try {
      await api.delete(
        `/timetables/${timetableId}/departments/${departmentId}`
      );

      setDepartments(prev =>
        prev.filter(d => d.id !== departmentId)
      );
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(244,238,245)]">
      <Header />

      {/* ================= PURPLE HEADER ================= */}
      <section className="pt-16 bg-gradient-to-b from-purple-600 to-purple-500">
        <div className="max-w-7xl mx-auto px-8 py-14 text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10
            text-purple-100 text-[10px] font-bold uppercase tracking-widest rounded mb-3">
            <Settings className="w-3.5 h-3.5 text-[#FFD166]" />
            Configuration Dashboard
          </span>

          <h1 className="text-5xl font-bold mb-2">
            Institutional <span className="text-[#FFD166]">Setup</span>
          </h1>

          <p className="text-purple-100 max-w-xl">
            Complete each module below to configure your institution's
            resources and constraints.
          </p>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-8 py-14">

        {/* -------- CORE CONFIGURATION -------- */}
        <section className="mb-14">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Core Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreSections.map(item => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`group text-left p-6 rounded-xl bg-white border border-slate-200
                    transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
                    ${item.theme.border} ${item.theme.shadow}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center
                      ${item.theme.bg} group-hover:scale-110 transition`}
                    >
                      <Icon className={`w-6 h-6 ${item.theme.icon}`} />
                    </div>

                    <span className="text-sm font-mono font-bold text-slate-300">
                      {item.id}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-bold text-slate-900 mb-1
                    group-hover:${item.theme.accent}`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500 mb-4">
                    {item.desc}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {item.status === "completed" && (
                        <span className="flex items-center gap-1.5 text-[11px]
                          font-bold text-emerald-600 uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Validated
                        </span>
                      )}

                      {item.status === "ready" && (
                        <span className={`flex items-center gap-1.5 text-[11px]
                          font-bold uppercase tracking-wider ${item.theme.accent}`}>
                          <Circle className="w-3.5 h-3.5 fill-current opacity-20" />
                          Ready to Edit
                        </span>
                      )}

                      {item.status === "pending" && (
                        <span className="flex items-center gap-1.5 text-[11px]
                          font-bold text-slate-400 uppercase tracking-wider">
                          Awaiting Data
                        </span>
                      )}
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 text-slate-300
                      group-hover:${item.theme.accent} transition`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* -------- DEPARTMENTS -------- */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Departments
          </h2>

          {/* ADD DEPARTMENT */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Add Department
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={deptName}
                onChange={(e) => {
                  setDeptName(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Computer Science Engineering"
                className="flex-1 border border-slate-300 rounded-md px-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={handleAddDepartment}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold
                  rounded-md hover:bg-indigo-700 transition"
              >
                Add
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>

          {/* DEPARTMENT CARDS */}
          {departments.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300
              rounded-lg p-8 text-center text-slate-500">
              No departments created yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {departments.map((dept, index) => (
                <div
                  key={dept.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/timetables/${timetableId}/${dept.id}`)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate(`/timetables/${timetableId}/${dept.id}`);
                    }
                  }}
                  className="group text-left p-6 bg-white rounded-lg border border-slate-200
                    hover:border-indigo-300 hover:shadow-sm transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-11 h-11 rounded-md bg-slate-100
                      flex items-center justify-center">
                      <Network className="w-5 h-5 text-slate-600" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-300">
                        D{index + 1}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDepartment(dept.id);
                        }}
                        className="p-1 rounded-md hover:bg-red-50"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    {dept.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Configure subjects, batches, and constraints
                  </p>

                  <div className="mt-4 text-sm font-semibold text-indigo-600">
                    Configure →
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashBoard;
