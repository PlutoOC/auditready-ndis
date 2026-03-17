import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Sparkles, CheckCircle2, FileText } from 'lucide-react';

interface HeroVideoProps {
  onGetStarted: () => void;
}

export function HeroVideo({ onGetStarted }: HeroVideoProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatStep, setChatStep] = useState(0);

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
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-rose-200 mb-6 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-medium text-slate-700">Now with AI-Powered Compliance</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              <span className="text-emerald-800">Compliance</span>
              <span className="text-slate-900"> + </span>
              <span className="text-rose-600">AI</span>
              <br />
              <span className="text-slate-900">Made Simple</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-xl">
              Join 500+ NDIS providers using AuditReady to ace their audits. 
              AI writes your responses, maps your evidence, and tracks compliance — all in one platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                className="px-8 py-4 bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <Play className="w-5 h-5" />
                See AI in Action
              </motion.button>
            </div>
          </motion.div>

          {/* Right: AI Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-2xl shadow-rose-100/50">
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-400 to-orange-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">AuditReady AI</h3>
                  <p className="text-xs text-slate-500">Always here to help</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-80 p-6 space-y-4 overflow-y-auto bg-white">
                {!showChat ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-100 to-orange-100 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-rose-500" />
                    </div>
                    <p className="text-slate-500 mb-4">See how AI helps with compliance</p>
                    <button
                      onClick={() => setShowChat(true)}
                      className="px-6 py-2 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 transition-colors"
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
                          className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                            msg.type === 'user'
                              ? 'bg-emerald-700 text-white'
                              : msg.isResponse
                              ? 'bg-rose-50 border border-rose-200 text-slate-800'
                              : 'bg-slate-100 text-slate-700'
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
                        <div className="bg-slate-100 px-4 py-3 rounded-2xl flex items-center gap-2">
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
                  className="p-4 border-t border-rose-100 flex flex-wrap gap-2 bg-white"
                >
                  {['Check evidence', 'Generate report', 'Schedule audit'].map((action) => (
                    <button
                      key={action}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-full transition-colors"
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
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-emerald-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">80%</p>
                  <p className="text-xs text-slate-500">Time Saved</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-rose-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">308</p>
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
