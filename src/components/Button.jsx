// src/components/Button.jsx
import clsx from "clsx";

const base =
  // mobil først: full bredde, rund og smooth
  "inline-flex items-center justify-center font-semibold transition-all duration-200 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed " +
  "rounded-2xl shadow-sm w-full sm:w-auto"; // full width på mobil, auto på >= sm

const variants = {
  primary:   "bg-turkis-500 text-white hover:bg-turkis-600 focus:ring-turkis-300",
  secondary: "bg-white text-turkis-700 ring-1 ring-turkis-200 hover:bg-turkis-50 focus:ring-turkis-300",
  ghost:     "bg-transparent text-turkis-700 hover:bg-turkis-50 focus:ring-turkis-300",
};

// Innebygget responsiv skalering (mobil → tablet → desktop)
const sizes = {
  sm: "h-10 px-4 text-sm sm:h-10 sm:px-4 sm:text-sm md:h-11 md:px-5",
  md: "h-12 px-6 text-base sm:h-12 sm:px-6 md:h-13 md:px-7 md:text-lg",
  lg: "h-14 px-8 text-lg sm:h-14 sm:px-8 md:h-16 md:px-10 md:text-xl",
};

export default function Button({
  as: Tag = "button",
  type = Tag === "button" ? "button" : undefined,
  variant = "primary",
  size = "md",
  full = false,           // tving 100% bredde uansett breakpoint
  pill = false,           // gjør den helt pill-rund
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  loading = false,
  className,
  children,
  ...props
}) {
  return (
    <Tag
      type={type}
      aria-busy={loading || undefined}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        pill && "rounded-full",
        full && "w-full",
        className
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {LeadingIcon && (
        <LeadingIcon className={clsx("mr-2", size === "lg" ? "w-6 h-6" : "w-5 h-5")} />
      )}
      <span>{loading ? "Laster..." : children}</span>
      {TrailingIcon && (
        <TrailingIcon className={clsx("ml-2", size === "lg" ? "w-6 h-6" : "w-5 h-5")} />
      )}
    </Tag>
  );
}
