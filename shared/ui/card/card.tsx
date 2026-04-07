export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
