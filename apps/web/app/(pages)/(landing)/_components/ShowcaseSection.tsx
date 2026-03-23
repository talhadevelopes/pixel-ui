"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const SHOWCASE_IMAGES = [
  "/img1.png",
  "/img2.png",
  "/img3.png",
  "/img4.png",
  "/img5.png",
  "/img6.png",
  "/img7.png",
  "/img8.png",
];

export function ShowcaseSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full px-4 md:px-12 lg:px-24 py-24 bg-[#FAFBFF]" style={{ overflow: "hidden" }}>
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ flex: "0 0 auto", width: "100%", maxWidth: "500px" }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest border border-blue-100/50">
            <Sparkles className="w-3.5 h-3.5" /> Live preview
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-[#0B1740] leading-tight mb-6 tracking-tight">
            Build stunning UIs<br />with AI in seconds
          </h2>

          <p className="text-lg text-[#5570A8] leading-relaxed mb-10">
            Describe your UI, watch it come to life. Edit elements, tweak styles, and export clean production-ready code.
          </p>

          <div className="flex flex-col gap-4 mb-12">
            {[
              "Describe your UI in plain text",
              "AI generates production-ready Code",
              "Export and ship in minutes",
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-4 text-[15px] font-medium text-[#334A80]"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600 border border-blue-200/50">
                  {i + 1}
                </div>
                {step}
              </motion.div>
            ))}
          </div>

          
        </motion.div>

        {/* Right — image frame */}
        <motion.div 
          className="relative flex items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ flex: "1 1 auto", width: "100%", minWidth: 0 }}
        >
          {/* Decorative background shadow/glow */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-200/20 blur-3xl rounded-full" />
          
          {/* Main frame */}
          <div className="relative w-full rounded-2xl border border-[#E0E8FA] overflow-hidden shadow-2xl shadow-blue-100/80 bg-white" style={{ width: "100%" }}>
            {/* Browser bar */}
            <div className="h-10 bg-[#F8FAFF] border-b border-[#E0E8FA] flex items-center px-5 gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEB22D]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 flex justify-center pr-14">
                <div className="bg-white border border-[#E0E8FA] rounded-md px-6 py-1 text-[11px] font-medium text-[#8A9AC0] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500/20" />
                  app.pixel-ui.dev/playground
                </div>
              </div>
            </div>

            {/* Image Preview Area */}
            <div className="relative bg-white" style={{ width: "100%", height: "auto", overflow: "hidden" }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={SHOWCASE_IMAGES[currentIndex]}
                  alt={`Pixel UI Showcase ${currentIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </AnimatePresence>

              {/* Progress Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {SHOWCASE_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "w-6 bg-blue-600" : "w-1.5 bg-blue-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}