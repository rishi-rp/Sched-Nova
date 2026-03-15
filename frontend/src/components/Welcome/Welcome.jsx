import {
  CalendarPlus,
  CalendarDays,
  BarChart3,
  ShieldCheck
} from "lucide-react";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useState } from "react";
import TimeTableModal from "./TimeTableModal";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const [departments, setDepartments] = useState(["CSE", "ECE", "MECH", "CIVIL"]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleAddDepartment = (newDept) => {
    setDepartments([...departments, newDept]);
  };

  const handleNavigate = (path) => {
    if (path === "/create") {
      setShowModal(true);
      return;
  }

    navigate(path);
  };


  const handleCreate = (data) => {
    console.log("Timetable data:", data);
    // 🚫 no navigation logic yet
  };

  const cards = [
    {
      icon: CalendarPlus,
      title: "Create Timetable",
      description: "Build your perfect schedule",
      path: "/create",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: CalendarDays,
      title: "View Timetable",
      description: "Access your schedules",
      path: "/timetables",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track your productivity",
      path: "/analytics",
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      icon: ShieldCheck,
      title: "Secure Settings",
      description: "Manage your preferences",
      path: "/settings",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <>
      <Header />

      <main>

        {/* HERO SECTION */}
        <section className="relative w-full bg-[#9333ea]">
          <div className="max-w-6xl mx-auto px-6 py-28 text-center text-white">

            <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
              ✨ Welcome back to SchedNova
            </span>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Plan smarter. <br />
              <span className="text-[#FFD166]">Focus better.</span>
            </h1>

            <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-10">
              Your time is limited. SchedNova helps you design schedules that
              actually work — without stress or chaos.
            </p>

            {/* PRIMARY ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleNavigate("/create")}
                className="px-8 py-4 bg-[#FFD166] text-purple-900 font-semibold rounded-xl shadow-lg hover:scale-105 transition"
              >
                Create Today’s Timetable
              </button>

              <button
                onClick={() => handleNavigate("/view")}
                className="px-8 py-4 border border-white/30 rounded-xl hover:bg-white/10 transition"
              >
                View Existing Schedule
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-20 bg-[rgb(244,238,245)] rounded-t-[40px]" />
        </section>

        {/*ACTION CARDS */}
        <section className="bg-[rgb(244,238,245)] py-20 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {cards.map((card, index) => {
              const Icon = card.icon;

              return (
                <button
                  key={index}
                  onClick={() => handleNavigate(card.path)}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  <div className="relative z-10 flex flex-col items-start gap-4 text-left">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {card.description}
                      </p>
                    </div>

                    <div className="mt-2 text-purple-600 font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                      Get Started
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </button>
              );
            })}

          </div>
        </section>

        {/* EXTRA CTA */}
        <section className="bg-[rgb(244,238,245)] pb-20 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Need help getting started?
          </p>
          <button className="px-6 py-3 border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium">
            View Quick Guide
          </button>
        </section>

      </main>

      <TimeTableModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        departments={departments}
        onAddDepartment={handleAddDepartment}
      />

      <Footer />
    </>
  );
};

export default Welcome;
