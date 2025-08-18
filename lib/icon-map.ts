// lib/icon-map.ts
import {
  Target,
  Briefcase,
  FileText,
  Phone,
  Lock,
  Hourglass,
  AlarmClock,
  Rocket,
  Star,
  NotebookPen,
  BarChart3,
  Mic,
  Megaphone,
  Lightbulb,
  Handshake,
  CalendarDays,
  CircleHelp,
  CheckCircle2,
  Check,
  XCircle,
  X,
  Sparkles,
  Flame,
  UserRound,
  HelpCircle,
  AlertTriangle,
  CircleSlash,
  GraduationCap,
  Search,
  TrendingUp,
  Smile,
  Ghost,
  Users,
  Bot,
  Zap,
  Clock,
  MessageCircle,
  BookOpen,
  Video,
  FileDown,
  Settings,
  Newspaper,
  Heart,
  Home,
  Building,
  type LucideIcon
} from 'lucide-react';

// Define all available icon names as a union type
export type IconName = 
  | 'target'
  | 'briefcase'
  | 'file-text'
  | 'phone'
  | 'lock'
  | 'hourglass'
  | 'alarm-clock'
  | 'rocket'
  | 'star'
  | 'notebook-pen'
  | 'bar-chart'
  | 'mic'
  | 'megaphone'
  | 'lightbulb'
  | 'handshake'
  | 'calendar-days'
  | 'circle-help'
  | 'check-circle'
  | 'check'
  | 'x-circle'
  | 'x'
  | 'sparkles'
  | 'flame'
  | 'user-round'
  | 'help-circle'
  | 'alert-triangle'
  | 'circle-slash'
  | 'graduation-cap'
  | 'search'
  | 'trending-up'
  | 'smile'
  | 'ghost'
  | 'users'
  | 'bot'
  | 'zap'
  | 'clock'
  | 'message-circle'
  | 'book-open'
  | 'video'
  | 'file-down'
  | 'settings'
  | 'newspaper'
  | 'heart'
  | 'home'
  | 'building';

// Central mapping of icon names to Lucide components
export const iconsByName: Record<IconName, LucideIcon> = {
  'target': Target,
  'briefcase': Briefcase,
  'file-text': FileText,
  'phone': Phone,
  'lock': Lock,
  'hourglass': Hourglass,
  'alarm-clock': AlarmClock,
  'rocket': Rocket,
  'star': Star,
  'notebook-pen': NotebookPen,
  'bar-chart': BarChart3,
  'mic': Mic,
  'megaphone': Megaphone,
  'lightbulb': Lightbulb,
  'handshake': Handshake,
  'calendar-days': CalendarDays,
  'circle-help': CircleHelp,
  'check-circle': CheckCircle2,
  'check': Check,
  'x-circle': XCircle,
  'x': X,
  'sparkles': Sparkles,
  'flame': Flame,
  'user-round': UserRound,
  'help-circle': HelpCircle,
  'alert-triangle': AlertTriangle,
  'circle-slash': CircleSlash,
  'graduation-cap': GraduationCap,
  'search': Search,
  'trending-up': TrendingUp,
  'smile': Smile,
  'ghost': Ghost,
  'users': Users,
  'bot': Bot,
  'zap': Zap,
  'clock': Clock,
  'message-circle': MessageCircle,
  'book-open': BookOpen,
  'video': Video,
  'file-down': FileDown,
  'settings': Settings,
  'newspaper': Newspaper,
  'heart': Heart,
  'home': Home,
  'building': Building,
};

// Emoji to icon name mapping for legacy support
export const emojiToIconName: Record<string, IconName> = {
  // Core emojis found in the codebase
  '🎯': 'target',
  '💼': 'briefcase',
  '📄': 'file-text',
  '📞': 'phone',
  '🔒': 'lock',
  '🔐': 'lock',
  '⏳': 'hourglass',
  '⏰': 'alarm-clock',
  '🚀': 'rocket',
  '⭐': 'star',
  '📝': 'notebook-pen',
  '📊': 'bar-chart',
  '🎤': 'mic',
  '📢': 'megaphone',
  '💡': 'lightbulb',
  '🤝': 'handshake',
  '🗓️': 'calendar-days',
  '❓': 'circle-help',
  '✅': 'check-circle',
  '✓': 'check',
  '❌': 'x-circle',
  '✗': 'x',
  '✨': 'sparkles',
  '🔥': 'flame',
  '🙋🏻‍♀️': 'user-round',
  '🤷‍♀️': 'help-circle',
  '😤': 'alert-triangle',
  '🚫': 'circle-slash',
  '🎓': 'graduation-cap',
  '🔍': 'search',
  '📈': 'trending-up',
  '🙂': 'smile',
  
  // Additional emojis from components
  '👻': 'ghost',
  '🏃‍♂️': 'users', // representing people/movement
  '😵': 'alert-triangle', // representing confusion/problems
  '🤖': 'bot',
  '⚡': 'zap',
  '💬': 'message-circle',
  '📖': 'book-open',
  '📹': 'video',
  '📁': 'file-down',
  '🗣': 'megaphone', // representing speaking
  '🧠': 'lightbulb', // representing thinking/intelligence
  '⚙️': 'settings',
  '📰': 'newspaper',
  '🎉': 'sparkles', // representing celebration
  '👤': 'user-round',
  '📌': 'target', // representing pinpoint/focus
};

// Resolver function to get icon component from emoji string or icon name
export function resolveIcon(input: string | IconName): LucideIcon {
  // If it's already an icon name, return it directly
  if (input in iconsByName) {
    return iconsByName[input as IconName];
  }
  
  // Try to resolve from emoji mapping
  const iconName = emojiToIconName[input];
  if (iconName) {
    return iconsByName[iconName];
  }
  
  // Fallback to a default icon
  console.warn(`Icon not found for input: ${input}, using default target icon`);
  return iconsByName.target;
}