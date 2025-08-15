// src/components/Button.jsx
import clsx from "clsx";

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-turkis-500 text-white hover:bg-turkis-600 focus:ring-turkis-300 rounded-full",
  secondary:
    "bg-white text-turkis-700 ring-1 ring-turkis-200 hover:bg-turkis-50 focus:ring-turkis-300 rounded-full",
  ghost:
    "bg-transparent text-turkis-700 hover:bg-turkis-50 focus:ring-turkis-300 rounded-full",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

export default function Button({
  as: Tag = "button",
  type = Tag === "button" ? "button" : undefined,
  variant = "primary",
  size = "md",
  full = false,
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
