import {
  BookOpen,
  ScrollText,
  Landmark,
  Brain,
  Users,
  Sparkles,
  Layers,
  Shapes,
  type LucideIcon,
} from "lucide-react";

// ponytail: category names are free-text admin data with no icon field —
// assign a stable icon by hashing the name rather than guessing a semantic mapping.
// Upgrade path: add an optional `icon` field on Column if editors want to pick one.
const TOPIC_ICONS: LucideIcon[] = [
  BookOpen,
  ScrollText,
  Landmark,
  Brain,
  Users,
  Sparkles,
  Layers,
  Shapes,
];

export function iconForTopic(name: string): LucideIcon {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return TOPIC_ICONS[hash % TOPIC_ICONS.length];
}
