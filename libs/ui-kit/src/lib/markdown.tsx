
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";


function LinkRenderer(props) {
  return <a href={props.href} target="_blank">{props.children}</a>
}

interface MarkdownProps {
  text: string;
  className: string;
}

export const Markdown = ({text, className}: MarkdownProps) => {
   return (
       <ReactMarkdown className={className} linkTarget="_blank" rehypePlugins={[rehypeRaw]}>
        {text}
      </ReactMarkdown>
       );
};
