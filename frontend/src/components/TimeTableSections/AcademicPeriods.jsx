import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  CalendarDays,
  CalendarClock
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../Api/api";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const AcademicPeriods = () => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [periods, setPeriods] = useState([{ start: "", end: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { timetableId } = useParams();

  const canSave =
  selectedDays.length > 0 &&
  periods.length > 0 &&
  periods.every(p => p.start && p.end) &&
  !error &&
  isDirty;

  const navigate = useNavigate();


  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(
          `/timetables/${timetableId}/periods`
        );

        // map backend → UI shape
        if (res.data.length === 0) {
          // ✅ IMPORTANT: keep one empty period

          setPeriods([{ start: "", end: "" }]);
          setSelectedDays([]);

        } else {
          // ✅ 1. Extract unique days
          setSelectedDays(
            [...new Set(res.data.map(p => p.day))]
          );

          // ✅ 2. Deduplicate periods by period_number
          const periodMap = new Map();

          res.data.forEach(p => {
            if (!periodMap.has(p.period_number)) {
              periodMap.set(p.period_number, {
                start: p.start_time ?? "",
                end: p.end_time ?? ""
              });
            }
          });

          // ✅ 3. Convert to ordered array
          setPeriods(
            Array.from(periodMap.entries())
              .sort((a, b) => a[0] - b[0]) // sort by period_number
              .map(([, value]) => value)
          );
        }

        setIsDirty(false);
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, [timetableId]);
  

  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);



  const toggleDay = (day) => {
    setIsDirty(true);

    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const updatePeriod = (index, field, value) => {
    setIsDirty(true);
    setError("");

    // ✅ Allow typing until full HH:MM is entered
    if (value.length < 5) {
      const updated = [...periods];
      updated[index] = { ...updated[index], [field]: value };
      setPeriods(updated);
      return;
    }

    const current = periods[index];
    const prev = periods[index - 1];
    const next = periods[index + 1];

    // ❌ End must be after start
    if (
      field === "end" &&
      current.start &&
      value &&
      value <= current.start
    ) {
      setError("End time must be after start time.");
      return;
    }

    // ❌ Start must be after previous end
    if (
      field === "start" &&
      prev?.end &&
      value < prev.end
    ) {
      setError("Period must start after previous period ends.");
      return;
    }

    // ❌ Changing end must not overlap next period
    if (
      field === "end" &&
      next?.start &&
      value > next.start
    ) {
      setError("This change overlaps with the next period.");
      return;
    }

    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    setPeriods(updated);
  };


  const addPeriod = () => {
    if (periods.length === 0) {
      setPeriods([{ start: "", end: "" }]);
      return;
    }
    
    const last = periods[periods.length - 1];

    if (!last.start || !last.end) {
      setError("Complete the previous period first.");
      return;
    }

    setError("");
    setPeriods([...periods, { start: last.end, end: "" }]);
  };


  const removePeriod = (index) => {
    setIsDirty(true);

    if (periods.length === 1) return;
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!canSave) return;

    setLoading(true);
    try {
      const payload = [];

      selectedDays.forEach(day => {
        periods.forEach((p, index) => {
          payload.push({
            timetable_id: timetableId,
            day,
            period_number: index + 1,
            start_time: p.start,
            end_time: p.end
          });
        });
      });

      await api.put(
        `/periods/bulk`,
        payload
      );

      setIsDirty(false);
      alert("Academic periods saved successfully!");

      navigate(`/timetables/${timetableId}`)
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0].msg); // ✅ string
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Something went wrong. Please try again.");
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
            Academic Configuration
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-3">
            Academic <span className="text-[#FFD166]">Periods</span>
          </h1>

          <p className="text-purple-100 text-base max-w-2xl leading-relaxed">
            Define teaching days and daily time slots used across the academic timetable.
          </p>

          <div className="flex gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FFD166]" />
              {selectedDays.length} Days Selected
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFD166]" />
              {periods.length} Periods Configured
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-8 py-12 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          {/* DAYS */}
          <div className="mb-12">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <CalendarDays className="w-5 h-5 text-purple-600" />
              Teaching Days
            </h2>

            <br></br>

            <div className="grid grid-cols-7 gap-4">
              {daysOfWeek.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`relative px-5 py-3 rounded-xl text-sm font-medium
                      transition-colors duration-200
                      ${
                        active
                          ? "bg-[#9333ea] text-white"
                          : "bg-white text-slate-700 border border-slate-300 hover:border-purple-400"
                      }`}
                  >
                    {active && (
                      <CheckCircle2 className="absolute -top-2 -right-2 w-5 h-5 text-[#FFD166] bg-white rounded-full" />
                    )}
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="relative my-10">
            <div className="h-px bg-slate-200" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs font-semibold text-slate-400">
              TIME PERIODS
            </span>
          </div>

          {/* PERIODS */}
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <CalendarClock className="w-5 h-5 text-purple-600" />
              Daily Period Structure
            </h2>

            <br></br>

            <div className="space-y-4">
              {periods.map((period, index) => (
                <div
                  key={index}
                  className="flex items-center gap-6 px-6 py-4 rounded-xl
                  bg-white border border-slate-200 hover:border-purple-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                    {index + 1}
                  </div>

                  <div className="flex-1 flex items-center gap-4">
                    <input
                      type="time"
                      value={period.start}
                      onChange={(e) =>
                        updatePeriod(index, "start", e.target.value)
                      }
                      className="px-4 py-2.5 rounded-lg border border-slate-300
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                      text-sm font-medium"
                    />

                    <span className="text-slate-500 text-sm">to</span>

                    <input
                      type="time"
                      value={period.end}
                      onChange={(e) =>
                        updatePeriod(index, "end", e.target.value)
                      }
                      className="px-4 py-2.5 rounded-lg border border-slate-300
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                      text-sm font-medium"
                    />

                    {period.start && period.end && (
                      <span className="ml-auto text-xs text-green-600 font-medium">
                        Valid
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removePeriod(index)}
                    disabled={periods.length === 1}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500
                    hover:bg-red-100 hover:text-red-600 transition-colors
                    disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addPeriod}
              className="mt-8 inline-flex items-center gap-2
              px-8 py-3 rounded-xl bg-[#9333ea] text-white
              text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              <Plus size={18} />
              Add Period
            </button>
          </div>

          {/* ERROR */}
          {typeof error === "string" && error && (
            <div className="mt-6 px-4 py-3 rounded-lg
                            border border-red-400
                            bg-red-50/70 backdrop-blur-sm
                            text-sm text-red-700 font-medium
                            shadow-sm">
              {error}
            </div>
          )}

          {/* SAVE */}
          <div className="mt-12 pt-8 border-t flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Ensure all periods are configured correctly before saving.
            </p>
            <button
            disabled={!canSave || loading}
            onClick={handleSave}
            className="px-8 py-3 rounded-xl bg-[#9333ea] text-white
              text-sm font-semibold hover:bg-purple-700 transition-colors 
              disabled:opacity-50 disabled:cursor-not-allowed">
              Save Configuration
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AcademicPeriods;
