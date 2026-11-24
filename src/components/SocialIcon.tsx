import {
  AtSign,
  Dribbble,
  Github,
  Globe,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Youtube,
} from 'lucide-react';
import type { SocialIconName } from '../data/portfolio';

interface SocialIconProps {
  name: SocialIconName;
  size?: number;
}

export function SocialIcon({ name, size = 16 }: SocialIconProps) {
  const props = { size, strokeWidth: 1.5, 'aria-hidden': true as const };

  switch (name) {
    case 'github':
      return <Github {...props} />;
    case 'telegram':
      return <Send {...props} />;
    case 'twitter':
      return <AtSign {...props} />;
    case 'discord':
      return <MessageCircle {...props} />;
    case 'linkedin':
      return <Linkedin {...props} />;
    case 'mail':
      return <Mail {...props} />;
    case 'dribbble':
      return <Dribbble {...props} />;
    case 'youtube':
      return <Youtube {...props} />;
    case 'globe':
    default:
      return <Globe {...props} />;
  }
}
