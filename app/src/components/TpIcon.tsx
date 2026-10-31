import React from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  Bug,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CirclePlay,
  Clock,
  CodeXml,
  Compass,
  Cpu,
  Crown,
  Flame,
  FlaskConical,
  Footprints,
  Gamepad2,
  Gem,
  GitBranch,
  Globe,
  Hammer,
  Heart,
  House,
  Lightbulb,
  Lock,
  Map,
  Medal,
  Palette,
  Play,
  Repeat,
  Rocket,
  Search,
  Settings,
  Share2,
  Shield,
  Signal,
  Smile,
  Sparkles,
  Star,
  Swords,
  Target,
  TreePalm,
  Trees,
  Trophy,
  Volume2,
  X,
  Zap,
} from 'lucide-react-native';

export type TpIconName =
  | 'house'
  | 'book-open'
  | 'hammer'
  | 'trophy'
  | 'smile'
  | 'bell'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'circle-play'
  | 'play'
  | 'clock'
  | 'signal'
  | 'footprints'
  | 'arrow-right'
  | 'x'
  | 'heart'
  | 'lightbulb'
  | 'code-xml'
  | 'palette'
  | 'cpu'
  | 'bot'
  | 'rocket'
  | 'tree-palm'
  | 'git-branch'
  | 'trees'
  | 'repeat'
  | 'gamepad-2'
  | 'flask-conical'
  | 'lock'
  | 'check'
  | 'star'
  | 'flame'
  | 'coin'
  | 'gem'
  | 'xp'
  | 'crown'
  | 'map'
  | 'target'
  | 'swords'
  | 'settings'
  | 'share-2'
  | 'bug'
  | 'medal'
  | 'shield'
  | 'globe'
  | 'volume-2'
  | 'compass'
  | 'search'
  | 'sparkles';

export interface TpIconProps {
  name: TpIconName | string;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

export function resolveIconName(rawName?: string | null): TpIconName {
  const key = (rawName ?? '').trim().toLowerCase();
  switch (key) {
    case 'house':
    case 'home':
      return 'house';
    case 'book-open':
    case 'bookopen':
    case 'learn':
      return 'book-open';
    case 'hammer':
    case 'build':
      return 'hammer';
    case 'trophy':
    case 'rewards':
      return 'trophy';
    case 'smile':
    case 'me':
      return 'smile';
    case 'code':
    case 'code-xml':
    case 'coding':
    case 'coding-pod':
      return 'code-xml';
    case 'palette':
    case 'design':
    case 'design-pod':
      return 'palette';
    case 'cpu':
    case 'ai':
    case 'ai-pod':
      return 'cpu';
    case 'bot':
    case 'robotics':
    case 'robotics-pod':
      return 'bot';
    case 'rocket':
    case 'founder':
    case 'founder-pod':
      return 'rocket';
    case 'tree-palm':
    case 'palm':
    case 'lagoon':
    case 'python-lagoon':
      return 'tree-palm';
    case 'git-branch':
    case 'branch':
    case 'if-else':
    case 'logic':
      return 'git-branch';
    case 'trees':
    case 'jungle':
    case 'variables-jungle':
      return 'trees';
    case 'repeat':
    case 'loops':
    case 'loops-valley':
      return 'repeat';
    case 'gamepad':
    case 'gamepad-2':
    case 'game':
    case 'game-island':
      return 'gamepad-2';
    case 'flask':
    case 'flask-conical':
    case 'data-lab':
      return 'flask-conical';
    case 'bug':
      return 'bug';
    case 'flame':
    case 'streak':
      return 'flame';
    case 'coin':
    case 'coins':
      return 'coin';
    case 'gem':
    case 'gems':
      return 'gem';
    case 'xp':
    case 'zap':
    case 'sparkles':
      return 'xp';
    case 'crown':
      return 'crown';
    case 'map':
      return 'map';
    case 'target':
      return 'target';
    case 'swords':
      return 'swords';
    case 'settings':
      return 'settings';
    case 'share':
    case 'share-2':
      return 'share-2';
    case 'medal':
      return 'medal';
    case 'shield':
      return 'shield';
    case 'globe':
      return 'globe';
    case 'volume':
    case 'volume-2':
      return 'volume-2';
    case 'lock':
      return 'lock';
    case 'check':
      return 'check';
    case 'star':
      return 'star';
    case 'bell':
      return 'bell';
    case 'chevron-left':
      return 'chevron-left';
    case 'chevron-right':
      return 'chevron-right';
    case 'chevron-down':
      return 'chevron-down';
    case 'circle-play':
      return 'circle-play';
    case 'play':
      return 'play';
    case 'clock':
      return 'clock';
    case 'signal':
      return 'signal';
    case 'footprints':
      return 'footprints';
    case 'arrow-right':
      return 'arrow-right';
    case 'x':
      return 'x';
    case 'heart':
      return 'heart';
    case 'lightbulb':
      return 'lightbulb';
    default:
      return 'sparkles';
  }
}

export function TpIcon({
  name,
  size = 18,
  color = '#0F172A',
  fill = 'none',
  strokeWidth = 2.4,
}: TpIconProps): React.JSX.Element {
  const resolved = resolveIconName(name);
  const commonProps = { size, color, fill, strokeWidth };

  switch (resolved) {
    case 'house':
      return <House {...commonProps} />;
    case 'book-open':
      return <BookOpen {...commonProps} />;
    case 'hammer':
      return <Hammer {...commonProps} />;
    case 'trophy':
      return <Trophy {...commonProps} />;
    case 'smile':
      return <Smile {...commonProps} />;
    case 'bell':
      return <Bell {...commonProps} />;
    case 'chevron-left':
      return <ChevronLeft {...commonProps} />;
    case 'chevron-right':
      return <ChevronRight {...commonProps} />;
    case 'chevron-down':
      return <ChevronDown {...commonProps} />;
    case 'circle-play':
      return <CirclePlay {...commonProps} />;
    case 'play':
      return <Play {...commonProps} />;
    case 'clock':
      return <Clock {...commonProps} />;
    case 'signal':
      return <Signal {...commonProps} />;
    case 'footprints':
      return <Footprints {...commonProps} />;
    case 'arrow-right':
      return <ArrowRight {...commonProps} />;
    case 'x':
      return <X {...commonProps} />;
    case 'heart':
      return <Heart {...commonProps} />;
    case 'lightbulb':
      return <Lightbulb {...commonProps} />;
    case 'code-xml':
      return <CodeXml {...commonProps} />;
    case 'palette':
      return <Palette {...commonProps} />;
    case 'cpu':
      return <Cpu {...commonProps} />;
    case 'bot':
      return <Bot {...commonProps} />;
    case 'rocket':
      return <Rocket {...commonProps} />;
    case 'tree-palm':
      return <TreePalm {...commonProps} />;
    case 'git-branch':
      return <GitBranch {...commonProps} />;
    case 'trees':
      return <Trees {...commonProps} />;
    case 'repeat':
      return <Repeat {...commonProps} />;
    case 'gamepad-2':
      return <Gamepad2 {...commonProps} />;
    case 'flask-conical':
      return <FlaskConical {...commonProps} />;
    case 'lock':
      return <Lock {...commonProps} />;
    case 'check':
      return <Check {...commonProps} />;
    case 'star':
      return <Star {...commonProps} />;
    case 'flame':
      return <Flame {...commonProps} />;
    case 'coin':
      return <CircleDollarSign {...commonProps} />;
    case 'gem':
      return <Gem {...commonProps} />;
    case 'xp':
      return <Zap {...commonProps} />;
    case 'crown':
      return <Crown {...commonProps} />;
    case 'map':
      return <Map {...commonProps} />;
    case 'target':
      return <Target {...commonProps} />;
    case 'swords':
      return <Swords {...commonProps} />;
    case 'settings':
      return <Settings {...commonProps} />;
    case 'share-2':
      return <Share2 {...commonProps} />;
    case 'bug':
      return <Bug {...commonProps} />;
    case 'medal':
      return <Medal {...commonProps} />;
    case 'shield':
      return <Shield {...commonProps} />;
    case 'globe':
      return <Globe {...commonProps} />;
    case 'volume-2':
      return <Volume2 {...commonProps} />;
    case 'compass':
      return <Compass {...commonProps} />;
    case 'search':
      return <Search {...commonProps} />;
    default:
      return <Sparkles {...commonProps} />;
  }
}
