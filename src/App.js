import { useState } from 'react';

import './App.css';

function App() {
  const [markDown, setMarkDown] = useState("Welcome to MarkDown")
  const [markDownBackend, setMarkDownBackend] = useState("Welcome to MarkDown")
  const [file, setFile] = useState(null);

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
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    // Check if the uploaded file is a Markdown file
    if (file && file.type === 'text/markdown' || file.name.endsWith('.md')) {
      setFile(file);
    } else {
      alert('Please upload a valid Markdown (.md) file.');
    }
  };
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // Append the file to the FormData object

    try {
      const response = await fetch('http://localhost:4000/processFile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if(data.message){
        setMarkDownBackend(data.html)
        setMarkDown('')
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    }
  };
  return (
    <>
      <div className='container'>
        <input 
          className='file-upload'
          placeholder='Upload .md file and submit to process at backend'
          type='file'
          accept=".md"
          onChange={handleFileChange}
        />
        <button className='button' onClick={e=>{handleUpload()}}>Process at Backend</button>
      </div>
      <div className='center-div'>
        <textarea className='left-side' value={markDown} onChange={e=>{setMarkDown(e.target.value);setFile(null);setMarkDownBackend('')}} />
        {file && markDownBackend
          ?<div className='right-side' dangerouslySetInnerHTML={{ __html: parseMarkdown(markDownBackend)}} />
          :<div dangerouslySetInnerHTML={{ __html: parseMarkdown(markDown)}} className='right-side' />
        }
      </div>
    </>
  );
}

export default App;
