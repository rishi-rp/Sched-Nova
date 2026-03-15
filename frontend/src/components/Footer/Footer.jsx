import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = ({ aboutRef }) => {
  return (
    <footer ref={aboutRef} className="w-full bg-[#9333ea] py-16 pb-8 font-sans">
      
      {/* Glass container */}
      <div className="mx-auto max-w-6xl px-10 py-10 flex flex-col md:flex-row gap-10 justify-between
                      bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">

        {/* Brand */}
        <div className="flex-1 min-w-[180px] text-indigo-100">
          <h2 className="text-2xl font-semibold text-white">SchedNova</h2>
          <p className="mt-2 text-sm leading-relaxed text-white">
            Smart, scalable scheduling system built for performance and clarity.
          </p>

          <div className="flex gap-4 mt-5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full
                         bg-white/20 text-white text-lg
                         transition-all duration-300 hover:bg-yellow-300 hover:-translate-y-1"
            >
              <FaGithub />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full
                         bg-white/20 text-white text-lg
                         transition-all duration-300 hover:bg-yellow-300 hover:-translate-y-1"
            >
              <FaTwitter />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full
                         bg-white/20 text-white text-lg
                         transition-all duration-300 hover:bg-yellow-300 hover:-translate-y-1"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Product */}
        <div className="flex-1 min-w-[180px] text-white">
          <h3 className="mb-3 text-sm font-semibold text-white uppercase tracking-wide">
            Product
          </h3>
          <ul className="space-y-2 text-sm text-white">
            <li className="cursor-pointer hover:text-yellow-200 transition-colors">Scheduler</li>
            <li className="cursor-pointer hover:text-yellow-200 transition-colors">Dashboard</li>
            <li className="cursor-pointer hover:text-yellow-200 transition-colors">Analytics</li>
          </ul>
        </div>

        {/* Company */}
        <div className="flex-1 min-w-[180px] text-white">
          <h3 className="mb-3 text-sm font-semibold text-yellow uppercase tracking-wide">
            Company
          </h3>
          <ul className="space-y-2 text-sm text-white">
            <li className="cursor-pointer hover:text-yellow-200 transition-colors">About</li>
            <li className="cursor-pointer hover:text-yellow-200 transition-colors">Privacy Policy</li>
            <li className="cursor-pointer hover:text-yellow-200 transition-colors">Terms</li>
          </ul>
        </div>

      </div>

      {/* Bottom */}
      <div className="mt-6 text-center text-xs text-white">
        © {new Date().getFullYear()} SchedNova. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;