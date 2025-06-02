export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  return (
    <div
      className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
