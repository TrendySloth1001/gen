import { IconType } from 'react-icons';
import { 
  SiTypescript, 
  SiFlutter, 
  SiDart, 
  SiPostgresql,
  SiExpress,
  SiNodedotjs,
  SiSocketdotio,
  SiRedis,
  SiReact,
  SiNextdotjs,
  SiGit,
  SiDocker,
  SiMongodb,
  SiPython,
  SiFigma
} from 'react-icons/si';

export interface Skill {
  name: string;
  icon: IconType;
  color: string; // Hex color for icon hover effect
}

export const skills: Skill[] = [
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'Flutter', icon: SiFlutter, color: '#02569B' },
  { name: 'Dart', icon: SiDart, color: '#0175C2' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  { name: 'Express', icon: SiExpress, color: '#000000' },
  { name: 'SQL', icon: SiPostgresql, color: '#4169E1' },
  { name: 'WebSockets', icon: SiSocketdotio, color: '#010101' },
  { name: 'BullMQ', icon: SiRedis, color: '#DC382D' },
  { name: 'React', icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#000000' },
  { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
  { name: 'Git', icon: SiGit, color: '#F05032' },
  { name: 'Docker', icon: SiDocker, color: '#2496ED' },
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
];

// Add or remove skills as needed - icons from react-icons/si (Simple Icons)
// Browse available icons: https://react-icons.github.io/react-icons/icons/si/
