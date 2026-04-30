import ReactMarkdown from 'react-markdown';

export function Markdown({ children }: { children: string }) {
  if (!children) return null;
  return (
    <div className="prose prose-sm max-w-none
                    prose-headings:font-heading prose-headings:text-navy
                    prose-a:text-orange hover:prose-a:underline
                    prose-strong:text-navy">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
