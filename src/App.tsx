import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
              AuditReady NDIS
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Internal audit and self-assessment tool for NDIS providers
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Streamline your compliance with the NDIS Practice Standards
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-8">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                Learn More
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Supabase connection: {supabase ? '✅ Connected' : '❌ Failed'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
