type ExhibitionLinkProps = {
  className?: string;
  label?: string;
};

export function ExhibitionLink({
  className = "",
  label = "Exhibition index",
}: ExhibitionLinkProps) {
  return (
    <a className={`exhibition-link ${className}`.trim()} href="/">
      <span aria-hidden="true">↗</span>
      {label}
    </a>
  );
}
