// components/Tooltip.tsx
import { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
};

export const Tooltip = ({
  content,
  children,
  side = "top",
  delayDuration = 0,
}: TooltipProps) => {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            className="bg-gray-800 text-white text-xs px-3 py-2 rounded shadow z-50 max-w-xs"
            sideOffset={5}
          >
            {content}
            <RadixTooltip.Arrow className="fill-gray-800" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
