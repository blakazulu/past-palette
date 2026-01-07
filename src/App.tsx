function App() {
  return (
    <div className="min-h-screen bg-ancient-900 text-ancient-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo placeholder */}
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
          <span className="text-ancient-900 font-bold text-2xl">PP</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
          Past Palette
        </h1>

        {/* Tagline */}
        <p className="text-ancient-300 text-lg">
          Color the Ancient World
        </p>

        {/* Status */}
        <div className="pt-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ancient-800 border border-ancient-700">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            <span className="text-sm text-ancient-300">Setting up...</span>
          </div>
        </div>

        {/* Tech badges */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {['React 19', 'TypeScript', 'Tailwind v4', 'Vite'].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs rounded-full bg-ancient-800/50 text-ancient-400 border border-ancient-700/50"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
