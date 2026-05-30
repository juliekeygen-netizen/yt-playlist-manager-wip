export function ThumbnailPlaceholder({
  size = 'sm',
  src,
  alt = '',
}: {
  size?: 'sm' | 'lg' | 'table';
  src?: string;
  alt?: string;
}) {
  const sizes = {
    sm: 'h-20 w-20',
    lg: 'h-[94px] w-[94px]',
    table: 'h-10 w-[72px]',
  };

  return (
    <div className={`${sizes[size]} overflow-hidden rounded-md border border-slate-500/20 bg-gradient-to-br from-[#07101b] via-[#0d1928] to-[#101d2e] shadow-inner shadow-black/40`}>
      {src ? (
        <img alt={alt} className="h-full w-full object-cover" loading="lazy" src={src} />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_70%_34%,rgba(148,163,184,0.12),transparent_15%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_45%)]" />
      )}
    </div>
  );
}
