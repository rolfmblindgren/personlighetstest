// src/components/Button.jsx
import clsx from "clsx";

const base =
  "inline-flex select-none items-center justify-center " +
  "rounded-2xl font-semibold shadow-sm " +
  "transition-all duration-200 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-2 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary:  "bg-turkis-500 text-white hover:bg-turkis-600 focus:ring-turkis-300",
  secondary:"bg-white text-turkis-700 ring-1 ring-turkis-200 hover:bg-turkis-50 focus:ring-turkis-300",
  ghost:    "bg-transparent text-turkis-700 hover:bg-turkis-50 focus:ring-turkis-300",
};

const sizes = {
  sm: "h-9  px-3 text-sm",
  md: "h-11 px-5 text-base",   // default
  lg: "h-12 px-6 text-lg",
};

export default function Button({
  as: Tag = "button",
  type = Tag === "button" ? "button" : undefined,
  variant = "primary",
  size = "md",
  full = false,           // bare når du vil ha w-full
  className,
  children,
  ...props
}) {
  return (
    <Tag
      type={type}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        full && "w-full",  // default er auto-bredde
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
