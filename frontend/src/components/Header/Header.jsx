import { useState } from "react";
import AuthPage from "../AuthPage/AuthPage";
import { useNavigate } from "react-router-dom";

function Header({ featuresRef, aboutRef }) {
  const navigate = useNavigate();

  const scrollToSection = (ref) => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className="fixed top-0 left-0 w-full h-[60px] z-[1000]
                 bg-[rgb(244,238,245)]
                 font-['Segoe_UI',sans-serif]"
    >
      <div
        className="h-full w-full flex items-center justify-between
                   px-[clamp(24px,5vw,80px)]
                   shadow-[0_8px_22px_rgba(0,0,0,0.1)]"
      >
        {/* Logo / Brand */}
          <h1 className="text-[30px] font-bold text-[#9333ea] tracking-[0.5px]">
            SchedNova
          </h1>

        {/* Actions */}
        <div className="flex gap-[18px]">
          <button
            onClick={() => scrollToSection(featuresRef)}
            className="bg-transparent border-none p-0
                      text-[18px] font-[500] text-black
                      cursor-pointer
                      transition-all duration-200
                      hover:text-[#f6c453]
                      hover:-translate-y-[2px]"
          >
            Features
          </button>

          <button
            onClick={() => scrollToSection(aboutRef)}
            className="bg-transparent border-none p-0
                      text-[18px] font-[500] text-black
                      cursor-pointer
                      transition-all duration-200
                      hover:text-[#f6c453]
                      hover:-translate-y-[2px]"
          >
            About
          </button>

          <button
            onClick={() => navigate("/login")}
            className="bg-transparent border-none p-0
                      text-[18px] font-[500] text-black
                      cursor-pointer
                      transition-all duration-200
                      hover:text-[#f6c453]
                      hover:-translate-y-[2px]"
          >
            Log In
          </button>


        </div>
      </div>
    </header>
  );
}

export default Header;
