import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-[26px] w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-normal whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        live:
          "border-[#292929] bg-[#1A1A1A] text-[#F6F6F6]",
        maintenance:
          "border-[#292929] bg-[#1A1A1A] text-[#F6F6F6]",
        draft:
          "border-[#292929] bg-[#1A1A1A] text-[#838383]",
        coral:
          "border-[#FF6347]/20 bg-[#FF6347]/[0.07] text-[#FF967F]",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive",
        outline:
          "border-[#292929] bg-[#1A1A1A] text-[#F6F6F6]",
        ghost:
          "border-transparent hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        suppressHydrationWarning: true,
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
