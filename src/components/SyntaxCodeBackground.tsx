'use client';

import { useEffect, useState } from 'react';

interface CodeBlock {
  code: string;
  language: string;
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

export default function SyntaxCodeBackground() {
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);

  const codeSnippets = [
    {
      code: `interface User {
  id: number;
  name: string;
  email: string;
}`,
      language: 'typescript'
    },
    {
      code: `const fetchData = async () => {
  const res = await fetch(url);
  return res.json();
};`,
      language: 'javascript'
    },
    {
      code: `function fibonacci(n: number) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}`,
      language: 'typescript'
    },
    {
      code: `const [state, setState] = useState<number>(0);

useEffect(() => {
  console.log('State changed:', state);
}, [state]);`,
      language: 'react'
    },
    {
      code: `git commit -m "feat: add new feature"
git push origin main
git checkout -b feature/xyz`,
      language: 'bash'
    },
    {
      code: `SELECT u.id, u.name, COUNT(p.id) as posts
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id;`,
      language: 'sql'
    },
    {
      code: `docker build -t myapp:latest .
docker run -p 3000:3000 myapp
docker compose up -d`,
      language: 'bash'
    },
    {
      code: `export default function Component() {
  return (
    <div className="flex items-center">
      <h1>Hello World</h1>
    </div>
  );
}`,
      language: 'jsx'
    },
    {
      code: `const colors = {
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#a855f7'
};`,
      language: 'javascript'
    },
    {
      code: `app.get('/api/users', async (req, res) => {
  const users = await db.users.findMany();
  res.json(users);
});`,
      language: 'javascript'
    }
  ];

  useEffect(() => {
    const generated = codeSnippets.map((snippet, i) => ({
      ...snippet,
      x: Math.random() * 85 + 5,
      y: (i * 12) % 95,
      rotation: Math.random() * 8 - 4,
      delay: i * 1.5,
    }));
    setCodeBlocks(generated);
  }, []);

  // Syntax highlighting function
  const highlightSyntax = (code: string, language: string) => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      let highlightedLine = line;

      // Keywords
      const keywords = ['const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'interface', 'type', 'export', 'default', 'import', 'from', 'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'LEFT JOIN', 'COUNT', 'git', 'docker'];
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
        highlightedLine = highlightedLine.replace(regex, `<span class="text-purple-400">$1</span>`);
      });

      // Strings
      highlightedLine = highlightedLine.replace(/(["'`])(.*?)\1/g, '<span class="text-emerald-400">$1$2$1</span>');

      // Numbers
      highlightedLine = highlightedLine.replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');

      // Functions
      highlightedLine = highlightedLine.replace(/\b(\w+)(?=\()/g, '<span class="text-blue-400">$1</span>');

      // Comments
      highlightedLine = highlightedLine.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/g, '<span class="text-zinc-600">$1</span>');

      return (
        <div key={idx} dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
      );
    });
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {codeBlocks.map((block, index) => (
        <div
          key={index}
          className="absolute font-mono leading-relaxed"
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            animationName: `floatCode${index}`,
            animationDuration: `${20 + index * 2}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `${block.delay}s`,
            opacity: 0.7,
            zIndex: 0,
            fontSize: '13px'
          }}
        >
          <div className="bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 backdrop-blur-sm p-5 rounded-xl border-2 border-emerald-400/50 shadow-2xl shadow-emerald-500/30">
            <div className="text-emerald-300 mb-3 text-sm font-bold tracking-wide">{block.language.toUpperCase()}</div>
            <div className="text-zinc-100 whitespace-pre font-medium">
              {highlightSyntax(block.code, block.language)}
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        ${codeBlocks.map((block, index) => `
          @keyframes floatCode${index} {
            0%, 100% { 
              transform: translateY(0) rotate(${block.rotation}deg) scale(1);
            }
            25% { 
              transform: translateY(-40px) rotate(${block.rotation + 4}deg) scale(1.08);
            }
            50% { 
              transform: translateY(-80px) rotate(${block.rotation - 4}deg) scale(0.92);
            }
            75% { 
              transform: translateY(-40px) rotate(${block.rotation + 5}deg) scale(1.05);
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
}
