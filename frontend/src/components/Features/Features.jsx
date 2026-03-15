import {BarChart3, Calendar, Expand, Layers, RefreshCw, ShieldCheck, Users} from 'lucide-react';
import { useState } from 'react';
import Welcome from '../Welcome/Welcome';
import { useNavigate } from 'react-router-dom';

const Features = ({ featuresRef }) => {
  const navigate = useNavigate();

  return (
    <main className="font-['Segoe_UI',sans-serif]">

      {/* HERO SECTION */}
      <section
        className="py-[160px]
                   bg-[#9333ea]
                   flex flex-col justify-center items-center text-center"
      >
        <div>
          <h1
            className="text-[64px] font-extrabold text-[white]
                      tracking-[1.5px]
                      max-[900px]:text-[52px]
                      max-[600px]:text-[40px]"
          >
            Welcome to <span className="text-[#FFD166]">SchedNova</span>
          </h1>

          <p
            className="mt-[8px] text-[17px] max-w-[780px]
                      text-[#e5edff] leading-[1.6]"
          >
            SchedNova is a smart timetable and classroom scheduling system designed to minimize conflicts, save time, and improve academic productivity. Manage your classes with ease and innovation.
          </p>

          <br></br>
          <br></br>
          <button
              onClick={() => navigate("/login")}
              className="px-[35px] py-[12px] text-[20px]
                        rounded-full shadow-lg border-none cursor-pointer
                        bg-white text-[#1D9AF0] font-semibold
                        transition-all duration-200
                        hover:-translate-y-[2px] hover:bg-yellow-300 hover:text-black"
            >
              Get Started →
            </button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        ref={featuresRef}
        className="py-[70px] px-[40px]
                   bg-[rgb(244,238,245)]"
      >
        <div className="text-center mb-[50px]">
          <h2
            className="text-[36px] font-extrabold text-[#9333ea]
                      tracking-[1px]
                      max-[600px]:text-[28px]"
          >
            Powerful Features
          </h2>

          <p
            className="mt-[10px] text-[16px] max-w-[720px] mx-auto
                      text-black leading-[1.6]"
          >
            Everything you need to create, manage, and optimize schedules —
            designed for speed, flexibility, and real-world academic workflows.
          </p>
        </div>

        <div
          className="max-w-[1100px] mx-auto
                     grid grid-cols-3 gap-[80px]
                     max-[900px]:grid-cols-2
                     max-[600px]:grid-cols-1"
        >
          {[
            {
              icon: <Calendar className='w-8 h-8' />,
              title: "Smart Scheduling",
              desc: "Automatically generate optimized timetables with zero conflicts.",
            },
            {
              icon: <Users className='w-8 h-8' />,
              title: "Multi-Department Support",
              desc: "Handle UG, PG, and cross-department electives effortlessly.",
            },
            {
              icon: <Layers className='w-8 h-8' />,
              title: "Balanced Workload",
              desc: "Ensure fair distribution of classes for faculty & students.",
            },
            {
              icon: <BarChart3 className='w-8 h-8' />,
              title: "Analytics & Insights",
              desc: "Understand workload distribution and resource utilization.",
            },
            {
              icon: <Expand className='w-8 h-8' />,
              title: "Scalable Design",
              desc: "Built to scale from small teams to large institutions.",
            },
            {
              icon: <RefreshCw className='w-8 h-8' />,
              title: "Dynamic Adjustments",
              desc: "Easily rearrange for faculty leaves & special classes..",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-[26px] rounded-[16px]
                         bg-white backdrop-blur-[12px]
                         border-2 border-[#9333ea]
                         shadow-[0_8px_22px_rgba(0,0,0,0.22)]
                         text-[#9333ea]
                         transition-all duration-200
                         hover:-translate-y-[5px]
                         hover:shadow-[0_14px_32px_rgba(0,0,0,0.3)]"
            >
              <div className="mb-4">
                { feature.icon }
              </div>

              <h3 className="text-[20px] mb-[8px]">
                {feature.title}
              </h3>

              <p className="text-[14px] leading-[1.55] text-[#4f4c5d]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Features;
