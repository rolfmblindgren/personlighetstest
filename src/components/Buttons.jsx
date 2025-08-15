// src/components/Button.jsx
import clsx from "clsx";

const base =
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-400",
  secondary:
    "bg-white text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50 focus:ring-teal-300",
  ghost:
    "bg-transparent text-teal-700 hover:bg-teal-50 focus:ring-teal-300",
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
