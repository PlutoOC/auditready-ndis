import { motion } from 'framer-motion';

const integrations = [
  { name: 'Xero', color: '#13B5EA' },
  { name: 'MYOB', color: '#6100A5' },
  { name: 'QuickBooks', color: '#2CA01C' },
  { name: 'Google Workspace', color: '#4285F4' },
  { name: 'Microsoft 365', color: '#D83B01' },
  { name: 'Dropbox', color: '#0061FF' },
  { name: 'OneDrive', color: '#0078D4' },
  { name: 'Slack', color: '#4A154B' },
  { name: 'Teams', color: '#6264A7' },
  { name: 'Zoom', color: '#2D8CFF' },
  { name: 'NDIS Portal', color: '#E4002B' },
  { name: 'Airtable', color: '#18BFFF' },
];

export function LogoMarquee() {
  // Double the array for seamless loop
  const allLogos = [...integrations, ...integrations];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h3 className="text-center text-lg font-medium text-slate-600 dark:text-slate-400">
          Seamless integrations with your entire tech stack
        </h3>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10" />

        {/* Scrolling Container */}
        <motion.div
          animate={{ x: [0, -50 * integrations.length * 4] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          className="flex gap-8 items-center"
        >
          {allLogos.map((integration, index) => (
            <div
              key={`${integration.name}-${index}`}
              className="flex-shrink-0 px-8 py-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: integration.color }}
                >
                  {integration.name.charAt(0)}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {integration.name}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center">
        <a
          href="#integrations"
          className="text-emerald-700 dark:text-emerald-600 font-medium hover:underline"
        >
          See all integrations →
        </a>
      </div>
    </section>
  );
}
