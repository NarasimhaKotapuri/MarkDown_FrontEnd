import { useState } from 'react';
import './App.css';

function App() {
  const [markDown, setMarkDown] = useState("Welcome to MarkDown")

  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const htmlLines = [];

    let inList = false;

    lines.forEach((line) => {
      // Headers
      if (/^#{1,6} /.test(line)) {
        const headerLevel = line.match(/^#+/)[0].length;
        htmlLines.push(`<h${headerLevel}>${line.slice(headerLevel + 1).trim()}</h${headerLevel}>`);
        inList = false;
      } 
      // Bold
      else if (/\*\*(.*?)\*\*/.test(line)) {
        htmlLines.push(`<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`);
        inList = false;
      } 
      // Italic
      else if (/\*(.*?)\*/.test(line)) {
        htmlLines.push(`<p>${line.replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`);
        inList = false;
      } 
      // Links
      else if (/\[([^\]]+)\]\(([^)]+)\)/.test(line)) {
        htmlLines.push(`<p>${line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')}</p>`);
        inList = false;
      } 
      // Images
      else if (/\!\[([^\]]*)\]\(([^)]+)\)/.test(line)) {
        htmlLines.push(`<p><img src="$2" alt="$1" /></p>`);
        inList = false;
      } 
      // Unordered lists
      else if (/^- /.test(line)) {
        if (!inList) {
          htmlLines.push('<ul>');
          inList = true;
        }
        htmlLines.push(`<li>${line.slice(2).trim()}</li>`);
      } 
      // Ordered lists
      else if (/^\d+\. /.test(line)) {
        if (!inList) {
          htmlLines.push('<ol>');
          inList = true;
        }
        htmlLines.push(`<li>${line.replace(/^\d+\. /, '').trim()}</li>`);
      } 
      // Block quotes
      else if (/^> /.test(line)) {
        htmlLines.push(`<blockquote>${line.slice(2).trim()}</blockquote>`);
        inList = false;
      } 
      // End of list
      else {
        if (inList) {
          htmlLines.push('</ul>');
          inList = false;
        }
        htmlLines.push(`<p>${line.trim()}</p>`);
      }
    });

    // Close any open list
    if (inList) {
      htmlLines.push('</ul>');
    }

    return htmlLines.join('');
  };
  return (
    <>
      <div className='center-div'>
        <textarea className='left-side' value={markDown} onChange={e=>setMarkDown(e.target.value)} />
        <div dangerouslySetInnerHTML={{ __html: parseMarkdown(markDown) }}  className='right-side' />
      </div>
    </>
  );
}

export default App;
