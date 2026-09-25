"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

const steps = [
  {
    title: "Download the Suite",
    desc: "Click the download button below to get the Nexora Elite bundle (ZIP file).",
    icon: "📥"
  },
  {
    title: "Extract the Folder",
    desc: "Right-click the downloaded ZIP and select 'Extract All' to get the extension folder.",
    icon: "📂"
  },
  {
    title: "Open Extensions Page",
    desc: "In Chrome, go to chrome://extensions/ or menu > Extensions > Manage Extensions.",
    icon: "🧩"
  },
  {
    title: "Enable Developer Mode",
    desc: "Toggle the 'Developer mode' switch in the top right corner of the page.",
    icon: "⚙️"
  },
  {
    title: "Load Extension",
    desc: "Click 'Load unpacked' and select the folder you extracted in Step 2.",
    icon: "✨"
  }
];

const features = [
  { title: "Lecture Bypass", desc: "Instantly complete VU and DigiSkills lectures with one click.", icon: "⚡" },
  { title: "AI Solver", desc: "Solve complex questions and assignments using Nexora AI.", icon: "🤖" },
  { title: "Perfect PDF", desc: "Generate professionally formatted assignment PDFs automatically.", icon: "📄" },
  { title: "UI Unblocker", desc: "Remove fee blocking overlays and restrictive LMS pop-ups.", icon: "🚫" },
  { title: "GDB Unlocker", desc: "Re-edit and resubmit GDBs even after the deadline.", icon: "🔓" },
  { title: "Interaction Fix", desc: "Re-enable copy-paste and context menus on restricted sites.", icon: "🔓" }
];

export default function ExtensionPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Simulate a slight delay for the premium feel
    setTimeout(() => {
      window.location.href = '/Nexora_Elite_v1.0.zip';
      setDownloading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="solution-bg-text">Elite Extension</div>
      
      <div className="container">
        {/* HERO SECTION */}
        <section className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-badge mx-auto mb-6"
          >
            🚀 Nexora Elite Companion
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-8"
          >
            Elevate Your <span className="gradient-text">LMS Experience</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-secondary mb-12"
          >
            The ultimate browser extension for Virtual University, DigiSkills, and Cisco NetAcad students. 
            Automate your tasks, solve assignments with AI, and bypass restrictive UI blocks.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className={`btn btn-primary btn-lg px-12 py-6 text-xl rounded-full shadow-glow ${downloading ? 'opacity-70' : ''}`}
            >
              {downloading ? 'Preparing Bundle...' : '📥 Download Nexora Elite Suite'}
            </button>
            <p className="mt-4 text-sm text-dim">Current Version: 1.0.2 • Free for all Nexora Users</p>
          </motion.div>
        </section>

        {/* FEATURES GRID */}
        <section className="mb-32">
          <div className="section-header text-center mb-12">
            <h2 className="text-3xl font-bold">Premium Power Features</h2>
            <p>Everything you need to master your academics in one extension.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-navy p-8 border border-white/5 hover:border-cyan-400/30 transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2">{f.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* INSTALLATION STEPS */}
        <section className="max-w-4xl mx-auto">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🛠️</div>
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
              <span className="p-3 bg-cyan-400/10 rounded-xl">🛠️</span>
              How to Install (Manual Method)
            </h2>
            
            <div className="space-y-12">
              {steps.map((s, i) => (
                <div key={s.title} className="flex gap-6 relative">
                  {i !== steps.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-[-32px] w-[2px] bg-gradient-to-b from-cyan-400/50 to-transparent" />
                  )}
                  <div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center text-navy font-bold shrink-0 z-10">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                       {s.title} <span className="text-sm opacity-50">{s.icon}</span>
                    </h4>
                    <p className="text-secondary">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-cyan-400/5 rounded-2xl border border-cyan-400/20 text-center">
              <p className="text-sm">
                <strong>Why can't I find this on the Web Store?</strong> <br/>
                We distribute Nexora Elite directly to ensure you get the latest "unrestricted" features that official stores sometimes block.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER CALL TO ACTION */}
        <section className="mt-32 text-center">
            <h2 className="text-2xl font-bold mb-6 italic">"Empowering the next generation of Virtual students."</h2>
            <div className="flex justify-center gap-4">
                <Link href="/" className="btn btn-outline">Back to Home</Link>
                <Link href="/mcq-practice" className="btn btn-secondary">Try Exam Hub</Link>
            </div>
        </section>
      </div>

      <style jsx>{`
        .hero-badge {
            background: rgba(34, 211, 238, 0.1);
            color: #22D3EE;
            padding: 8px 16px;
            border-radius: 99px;
            font-size: 0.9rem;
            font-weight: 800;
            width: fit-content;
            border: 1px solid rgba(34, 211, 238, 0.2);
        }
        .gradient-text {
            background: linear-gradient(135deg, #22D3EE 0%, #818CF8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .text-secondary {
            color: #94A3B8;
        }
        .text-dim {
            color: #64748B;
        }
        .glass-card-navy {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 24px;
        }
        .shadow-glow {
            box-shadow: 0 0 30px rgba(34, 211, 238, 0.3);
        }
        .btn-primary {
            background: #22D3EE;
            color: #0F172A;
            font-weight: 800;
        }
        .btn-lg {
            padding: 16px 32px;
            font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}
