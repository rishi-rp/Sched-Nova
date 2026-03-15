import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/api";

const TimetablePopup = ({ isOpen, onClose }) => {
  const [timetableName, setTimetableName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateTimetable = async () => {
    if (!timetableName.trim()) return;

    try {
      setLoading(true);

      // 🔥 BACKEND CALL
      const res = await api.post("/timetables", {
        name: timetableName,
      });

      console.log("Timetable created:", res.data);

      setTimetableName("");
      onClose();

      // 🔁 Navigate using returned ID (recommended)
      navigate(`/timetables/${res.data.id}`);

    } catch (err) {
      console.error("Failed to create timetable:", err);
      alert(err.response?.data?.detail || "Failed to create timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTimetableName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[fadeIn_0.3s_ease-out]">

        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Create Timetable
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timetable Name
            </label>
            <input
              type="text"
              value={timetableName}
              onChange={(e) => setTimetableName(e.target.value)}
              placeholder="e.g. Fall 2024 Schedule"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl
                focus:border-purple-600 focus:outline-none transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700
              rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateTimetable}
            disabled={!timetableName.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600
              text-white rounded-xl font-semibold transition-all
              hover:from-purple-700 hover:to-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Timetable"}
          </button>
        </div>
      </div>

      {/* ================= ANIMATION ================= */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default TimetablePopup;
