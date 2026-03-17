import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ArrowRight, Sparkles, CheckCircle2, FileText } from 'lucide-react';

interface HeroVideoProps {
  onGetStarted: () => void;
}

export function HeroVideo({ onGetStarted }: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simulated chat conversation
  const chatMessages = [
    { type: 'user', text: 'Help me write a response for QI 1.1 about governance', delay: 1000 },
    { type: 'ai', text: 'I\'ll help you with that. Let me check your evidence first...', delay: 2000 },
    { type: 'ai', text: '✓ Found your Governance Policy\n✓ Found Board Meeting Minutes\n✓ Found Risk Register', delay: 3500 },
    { type: 'ai', text: 'Here\'s a tailored response based on your evidence:', delay: 5000 },
    { type: 'ai', text: '"Our organization maintains robust governance through documented policies, regular board oversight, and comprehensive risk management. Evidence includes: Governance Policy (v2.1), Board Minutes Q1-Q4 2025, and Enterprise Risk Register."', delay: 6500, isResponse: true },
  ];

  useEffect(() => {
    if (showChat) {
      chatMessages.forEach((msg, index) => {
        setTimeout(() => {
          setChatStep(index + 1);
        }, msg.delay);
      });
    }
  }, [showChat]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/hero-poster.jpg"
        >
          <source src="/auditready-demo.mp4" type="video/mp4" />
        </video>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Now with AI-Powered Compliance</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">
                Compliance
              </span>
              <span className="text-white"> + </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                AI
              </span>
              <br />
              <span className="text-white">Made Simple</span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 max-w-xl">
              Join 500+ NDIS providers using AuditReady to ace their audits. 
              AI writes your responses, maps your evidence, and tracks compliance — all in one platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <Play className="w-5 h-5" />
                See AI in Action
              </motion.button>
            </div>

            {/* Video Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>
              <span className="text-sm text-slate-400">Watch the product tour</span>
            </div>
          </motion.div>

          {/* Right: AI Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AuditReady AI</h3>
                  <p className="text-xs text-slate-400">Always here to help</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => { setShowChat(false); setChatStep(0); }}
                    className="text-slate-400 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-80 p-4 space-y-4 overflow-y-auto">
                {!showChat ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="w-12 h-12 text-indigo-400 mb-4" />
                    <p className="text-slate-400 mb-4">See how AI helps with compliance</p>
                    <button
                      onClick={() => setShowChat(true)}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Start Demo
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {chatMessages.slice(0, chatStep).map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                            msg.type === 'user'
                              ? 'bg-indigo-600 text-white'
                              : msg.isResponse
                              ? 'bg-green-500/20 border border-green-500/30 text-green-100'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                    {chatStep < chatMessages.length && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-slate-700 px-4 py-3 rounded-2xl flex items-center gap-2">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6 }}
                              className="w-2 h-2 bg-slate-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                              className="w-2 h-2 bg-slate-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                              className="w-2 h-2 bg-slate-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* Quick Actions */}
              {showChat && chatStep >= chatMessages.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border-t border-slate-700/50 flex flex-wrap gap-2"
                >
                  {['Check evidence', 'Generate report', 'Schedule audit'].map((action) => (
                    <button
                      key={action}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-full transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">80%</p>
                  <p className="text-xs text-slate-500">Time Saved</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">308</p>
                  <p className="text-xs text-slate-500">QIs Covered</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
