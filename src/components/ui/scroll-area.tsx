import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ScrollArea component
 * Works with `import { ScrollArea } from "@/components/ui/scroll-area"`
 * and `import ScrollArea from "@/components/ui/scroll-area"`.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} {...props} className={cn("relative overflow-hidden", className)}>
        <div className="h-full w-full overflow-y-auto overflow-x-hidden pr-2">{children}</div>
      </div>
    )
  },
)
ScrollArea.displayName = "ScrollArea"

export default ScrollArea
