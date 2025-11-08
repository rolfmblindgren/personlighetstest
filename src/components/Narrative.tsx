import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function Narrative({ text }) {
  if (!text) return null;
  return (
    <article className="prose prose-sm prose-p:text-[0.9rem] leading-relaxed">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{text}</Markdown>
    </article>
  );
}
