import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Settings,
  Sparkles
} from "lucide-react";
import Header from "../Header/Header";
import { useNavigate } from "react-router-dom";
import api from "../../Api/api";

const SavedTimetables = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const res = await api.get("/timetables");

        const enriched = await Promise.all(
          res.data.map(async (tt) => {
            const runsRes = await api.get(`/timetables/${tt.id}/runs`);

            return {
              id: tt.id,
              name: tt.name,
              createdAt: tt.created_at,
              status: runsRes.data.length > 0 ? "published" : "draft"
            };
          })
        );

        setTimetables(enriched);
      } catch (err) {
          console.error("Failed to load timetables", err);
      } finally {
          setLoading(false);
      }
    };

    fetchTimetables();
  }, []);


  /* TEMP DATA (replace later with real data) */
  // const timetables = [
  //   {
  //     id: 1,
  //     name: "CSE – Semester 4",
  //     academicYear: "2024–2025",
  //     status: "published",
  //     updatedAt: "2 days ago"
  //   },
  //   {
  //     id: 2,
  //     name: "ECE – Semester 6",
  //     academicYear: "2024–2025",
  //     status: "draft",
  //     updatedAt: "5 days ago"
  //   }
  // ];

  return (
    <div className="min-h-screen bg-[rgb(244,238,245)]">

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-b from-purple-600 to-purple-500">
        <div className="max-w-7xl mx-auto px-8 pt-14 pb-24 text-white">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10
            text-purple-100 text-[10px] font-bold uppercase tracking-widest
            rounded mb-3"
          >
            <Settings className="w-3.5 h-3.5 text-[#FFD166]" />
            Timetable Archive
          </span>

          <h1 className="text-4xl font-bold mb-2">
            Saved Timetables
          </h1>

          <p className="text-purple-100 max-w-xl">
            View, review, and manage previously generated timetables.
          </p>

          {/* QUICK STATS */}
          <div className="mt-6 flex gap-6 text-sm text-purple-100">
            <span>
              <strong className="text-white">{timetables.length}</strong>{" "}
              Total
            </span>
            <span>
              <strong className="text-white">
                {timetables.filter(t => t.status === "published").length}
              </strong>{" "}
              Published
            </span>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-8 -mt-12 pb-14">

        {/* INTRO CARD */}
        <div
          className="bg-white rounded-xl border border-slate-200
          p-6 mb-10 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-lg bg-indigo-50
              flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 mb-1">
                Your timetable history
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl">
                Each card represents a generated timetable. You can view
                published timetables or continue working on drafts.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION TITLE */}
        <h2
          className="text-sm font-semibold uppercase tracking-wider
          text-slate-500 mb-6"
        >
          Available Timetables
        </h2>

        {/* EMPTY STATE */}
        {loading ? (
          <div className="text-center text-slate-500 py-20">
            Loading timetables…
          </div>
        ) : timetables.length === 0 ? (
          <div
            className="bg-white border border-dashed border-slate-300
            rounded-xl p-12 text-center"
          >
            <CalendarDays className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 mb-1">
              No timetables found
            </h3>
            <p className="text-sm text-slate-500">
              Generate a timetable to see it appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timetables.map((tt) => (
              <div
                key={tt.id}
                className="group bg-white rounded-xl border border-slate-200
                  p-6 transition-all duration-300
                  hover:-translate-y-0.5 hover:shadow-xl"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-5">
                  <div
                    className="w-11 h-11 rounded-lg bg-indigo-50
                    flex items-center justify-center"
                  >
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                  </div>

                  {tt.status === "published" ? (
                    <span
                      className="inline-flex items-center gap-1.5
                      px-2 py-1 rounded-full bg-emerald-50
                      text-[11px] font-bold text-emerald-700 uppercase"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Published
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5
                      px-2 py-1 rounded-full bg-slate-100
                      text-[11px] font-bold text-slate-500 uppercase"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Draft
                    </span>
                  )}
                </div>

                {/* BODY */}
                <h3 className="font-semibold text-slate-900 mb-1">
                  {tt.name}
                </h3>

                <p className="text-sm text-slate-500 mb-2">
                  Created on{" "}
                  {new Date(tt.createdAt).toLocaleDateString()}
                </p>

                {/* ACTION */}
                <button
                  onClick={() => navigate(`/timetables/${tt.id}`)}
                  className="inline-flex items-center gap-2 text-sm
                    font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <Eye className="w-4 h-4" />
                  View Timetable
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedTimetables;
