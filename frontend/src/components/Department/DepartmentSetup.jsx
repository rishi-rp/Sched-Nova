import React from "react";
import {
  Layers,
  Notebook,
  ChevronRight,
  Settings,
  CheckCircle2,
  Circle,
  Sparkles
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header/Header";

const DepartmentSetup = () => {
  const navigate = useNavigate();
  const { timetableId, departmentId } = useParams();

  const departmentName = "Temporary";

  const options = [
    {
      id: "01",
      title: "Batches",
      desc: "Define academic batches and year-wise groupings.",
      icon: Layers,
      status: "completed",
      path: `/timetables/${timetableId}/${departmentId}/batches`,
      theme: {
        bg: "bg-rose-50",
        icon: "text-rose-600",
        accent: "text-rose-600",
        border: "hover:border-rose-400",
        shadow: "hover:shadow-rose-100"
      }
    },
    {
      id: "02",
      title: "Subjects",
      desc: "Manage subjects and their academic structure.",
      icon: Notebook,
      status: "ready",
      path: `/timetables/${timetableId}/${departmentId}/subjects`,
      theme: {
        bg: "bg-violet-50",
        icon: "text-violet-600",
        accent: "text-violet-600",
        border: "hover:border-violet-400",
        shadow: "hover:shadow-violet-100"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(244,238,245)] pt-16">
      <Header />

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-b from-purple-600 to-purple-500">
        <div className="max-w-7xl mx-auto px-8 pt-14 pb-24 text-white relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10
            text-purple-100 text-[10px] font-bold uppercase tracking-widest rounded mb-3">
            <Settings className="w-3.5 h-3.5 text-[#FFD166]" />
            Department Setup
          </span>

          <h1 className="text-4xl font-bold mb-2">
            {decodeURIComponent(departmentName)}
          </h1>

          <p className="text-purple-100 max-w-xl">
            Complete the academic structure for this department before
            timetable generation.
          </p>

          {/* PROGRESS STRIP */}
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-xs text-purple-100 mb-1">
              <span>Setup Progress</span>
              <span>50%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-[#FFD166]" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-8 -mt-12 pb-14">

        {/* INTRO CARD */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-10
          shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50
              flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 mb-1">
                What needs to be configured?
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl">
                Each department requires batches and subjects to be defined.
                Complete both sections to ensure accurate timetable generation.
              </p>
            </div>
          </div>
        </div>

        {/* OPTIONS */}
        <h3 className="text-sm font-semibold uppercase tracking-wider
          text-slate-500 mb-6">
          Department Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`group text-left p-6 rounded-xl bg-white
                  border border-slate-200 transition-all duration-300
                  hover:-translate-y-0.5 hover:shadow-xl
                  ${item.theme.border} ${item.theme.shadow}`}
              >
                {/* ICON + ID */}
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

                {/* STATUS + CTA */}
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
      </main>
    </div>
  );
};

export default DepartmentSetup;
