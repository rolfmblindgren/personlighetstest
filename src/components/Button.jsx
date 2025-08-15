// src/components/Button.jsx
import clsx from "clsx";

const base =
  "inline-flex items-center justify-center font-semibold " +
  "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
  "disabled:opacity-60 disabled:cursor-not-allowed rounded-full shadow-md";

const variants = {
  primary: "bg-turkis-500 text-white hover:bg-turkis-600 active:bg-turkis-700 focus:ring-turkis-300",
  secondary: "bg-white text-turkis-700 ring-1 ring-turkis-200 hover:bg-turkis-50 focus:ring-turkis-300",
  ghost: "bg-transparent text-turkis-700 hover:bg-turkis-50 focus:ring-turkis-300",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-7 text-lg",
};

export default function Button({
  as: Tag = "button",
  type = Tag === "button" ? "button" : undefined,
  variant = "primary",
  size = "md",
  full = false,
  className,
  children,
  ...props
}) {
  return (
    <Tag
      type={type}
      className={clsx(base, variants[variant], sizes[size], full && "w-full", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
