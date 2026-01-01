import { skills } from '@/data/skills';

export default function Skills() {
  return (
    <section className="px-6 py-20 font-mono" id="skills">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">
            $ ls -la ./skills
          </h2>
          <p className="text-zinc-500">Technologies and frameworks in my toolkit</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.name}
                className="flex flex-col items-center gap-3 p-4 border-2 border-emerald-500/30 rounded bg-black/50 backdrop-blur-sm hover:border-emerald-500/60 hover:bg-emerald-500/5 transition group"
              >
                <Icon 
                  className="text-3xl text-emerald-400 group-hover:text-emerald-300 transition"
                />
                <span className="text-sm text-zinc-400 text-center group-hover:text-zinc-300 transition">
                  {skill.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
