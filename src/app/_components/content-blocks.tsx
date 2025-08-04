"use client";

interface ContentBlock {
  type: string;
  content: string;
}

interface ContentBlocksProps {
  blocks: ContentBlock[];
  className?: string;
}

export function ContentBlocks({ blocks, className = "" }: ContentBlocksProps) {
  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  return (
    <div className={`prose max-w-none ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'title':
            return (
              <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6">
                {block.content}
              </h1>
            );
          
          case 'heading':
            return (
              <h2 key={index} className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
                {block.content}
              </h2>
            );
          
          case 'subheading':
            return (
              <h3 key={index} className="text-xl font-medium text-gray-900 mt-6 mb-3">
                {block.content}
              </h3>
            );
          
          case 'paragraph':
            return (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {block.content}
              </p>
            );
          
          case 'list':
            try {
              const listItems = JSON.parse(block.content);
              if (Array.isArray(listItems)) {
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                    {listItems.map((item, itemIndex) => (
                      <li key={itemIndex} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }
            } catch (e) {
              // If JSON parsing fails, treat as regular text
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {block.content}
                </p>
              );
            }
            break;
          
          case 'numbered_list':
            try {
              const listItems = JSON.parse(block.content);
              if (Array.isArray(listItems)) {
                return (
                  <ol key={index} className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                    {listItems.map((item, itemIndex) => (
                      <li key={itemIndex} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ol>
                );
              }
            } catch (e) {
              // If JSON parsing fails, treat as regular text
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {block.content}
                </p>
              );
            }
            break;
          
          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-600 bg-gray-50 py-3">
                {block.content}
              </blockquote>
            );
          
          case 'code':
            return (
              <pre key={index} className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <code className="text-sm font-mono text-gray-800">
                  {block.content}
                </code>
              </pre>
            );
          
          case 'divider':
            return (
              <hr key={index} className="my-8 border-gray-300" />
            );
          
          default:
            // For unknown types, render as paragraph
            return (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {block.content}
              </p>
            );
        }
      })}
    </div>
  );
}

// Preview component for showing a truncated version in feeds
export function ContentBlocksPreview({ blocks, maxBlocks = 2, className = "" }: ContentBlocksProps & { maxBlocks?: number }) {
  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  const previewBlocks = blocks.slice(0, maxBlocks);
  
  return (
    <div className={`prose max-w-none ${className}`}>
      {previewBlocks.map((block, index) => {
        switch (block.type) {
          case 'title':
            // Skip title in preview since it's usually shown separately
            return null;
          
          case 'heading':
            return (
              <h3 key={index} className="text-lg font-medium text-gray-900 mb-2">
                {block.content}
              </h3>
            );
          
          case 'paragraph':
            const paragraphContent = block.content.length > 150 
              ? block.content.substring(0, 150) + "..." 
              : block.content;
            return (
              <p key={index} className="text-gray-600 text-sm leading-relaxed">
                {paragraphContent}
              </p>
            );
          
          case 'list':
            try {
              const listItems = JSON.parse(block.content);
              if (Array.isArray(listItems)) {
                const previewItems = listItems.slice(0, 2);
                return (
                  <ul key={index} className="list-disc list-inside text-sm text-gray-600">
                    {previewItems.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.length > 60 ? item.substring(0, 60) + "..." : item}
                      </li>
                    ))}
                    {listItems.length > 2 && (
                      <li className="text-gray-400">...and {listItems.length - 2} more</li>
                    )}
                  </ul>
                );
              }
            } catch (e) {
              const fallbackContent = block.content.length > 100 
                ? block.content.substring(0, 100) + "..." 
                : block.content;
              return (
                <p key={index} className="text-gray-600 text-sm leading-relaxed">
                  {fallbackContent}
                </p>
              );
            }
            break;
          
          default:
            const defaultContent = block.content.length > 100 
              ? block.content.substring(0, 100) + "..." 
              : block.content;
            return (
              <p key={index} className="text-gray-600 text-sm leading-relaxed">
                {defaultContent}
              </p>
            );
        }
      })}
    </div>
  );
}
