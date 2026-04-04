import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export function HelpTooltip({ content, title }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-neon-cyan cursor-help transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-background border border-neon-cyan">
          {title && <p className="font-bold text-neon-cyan mb-1">{title}</p>}
          <p className="text-sm text-foreground">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
