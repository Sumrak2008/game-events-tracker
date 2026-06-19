export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card text-muted flex items-center justify-center px-6 py-10 text-sm">
      {message}
    </div>
  );
}
