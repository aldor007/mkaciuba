
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";


interface MarkdownProps {
  text: string;
  className?: string;
}

export const Markdown = ({text, className = ''}: MarkdownProps) => {
   return (
       <ReactMarkdown
         className={className}
         rehypePlugins={[rehypeRaw]}
         components={{
           a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
         }}
       >
        {text}
      </ReactMarkdown>
       );
};
