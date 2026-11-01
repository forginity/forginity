import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-coral text-[#090909] font-medium hover:brightness-105 active:bg-[#D94F2E] active:brightness-95",
        solid:
          "bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:bg-[#D94F2E]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[#363636] active:bg-[#1A1A1A]",
        ghost:
          "hover:bg-accent hover:text-foreground",
        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90 active:brightness-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[58px] py-[22px] px-6 text-base rounded-full gap-2",
        hero:
          "h-[58px] py-[22px] px-8 text-base rounded-full gap-2.5",
        sm:
          "h-9 px-4 text-sm rounded-xl gap-1.5",
        xs:
          "h-7 px-3 text-xs rounded-lg gap-1",
        lg:
          "h-[58px] py-[22px] px-8 text-base rounded-full gap-2",
        icon:
          "size-[58px] rounded-full p-0",
        "icon-sm":
          "size-9 rounded-xl p-0",
        "icon-xs":
          "size-7 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
