'use client';

import { useEffect, useState } from 'react';

interface CodeSnippet {
  code: string;
  language: string;
  x: number;
  y: number;
  rotation: number;
}

export default function CodeSnippetsBackground() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);

  const codeExamples = [
    { code: 'const greeting = "Hello, World!";', language: 'typescript' },
    { code: 'function fibonacci(n) {\n  return n < 2 ? n : fibonacci(n-1) + fibonacci(n-2);\n}', language: 'javascript' },
    { code: 'async function fetchData() {\n  const response = await fetch(url);\n  return response.json();\n}', language: 'typescript' },
    { code: 'const [state, setState] = useState(0);', language: 'react' },
    { code: 'git commit -m "feat: add new feature"', language: 'bash' },
    { code: 'SELECT * FROM users WHERE active = true;', language: 'sql' },
    { code: 'docker build -t myapp:latest .', language: 'bash' },
    { code: 'interface User {\n  id: number;\n  name: string;\n}', language: 'typescript' },
  ];

  useEffect(() => {
    const generated = codeExamples.map((snippet, i) => ({
      ...snippet,
      x: Math.random() * 90 + 5,
      y: (i * 15) % 100,
      rotation: Math.random() * 10 - 5,
    }));
    setSnippets(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10 z-0">
      {snippets.map((snippet, index) => (
        <div
          key={index}
          className="absolute font-mono text-xs whitespace-pre blur-[1px]"
          style={{
            left: `${snippet.x}%`,
            top: `${snippet.y}%`,
            transform: `rotate(${snippet.rotation}deg)`,
            animation: `float ${20 + index * 5}s infinite ease-in-out`,
            animationDelay: `${index * 2}s`,
          }}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            {snippet.code}
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(${0}deg); }
          50% { transform: translateY(-30px) rotate(${5}deg); }
        }
      `}</style>
    </div>
  );
}
