import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatButtons = [
    { command: 'bold', icon: Bold, title: 'Bold' },
    { command: 'italic', icon: Italic, title: 'Italic' },
    { command: 'underline', icon: Underline, title: 'Underline' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex space-x-2">
        {formatButtons.map(({ command, icon: Icon, title }) => (
          <button
            key={command}
            type="button"
            onClick={() => execCommand(command)}
            onMouseDown={(e) => e.preventDefault()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title={title}
          >
            <Icon size={16} />
          </button>
        ))}
        
        <div className="border-l border-gray-300 mx-2"></div>
        
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="text-sm bg-white border border-gray-300 rounded px-2 py-1"
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        className={`p-4 min-h-[300px] focus:outline-none transition-all ${
          isEditorFocused ? 'bg-blue-50/30' : 'bg-white'
        }`}
        style={{ lineHeight: '1.6' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t border-gray-200">
        Click in the editor above to make changes. Use the toolbar for formatting.
      </div>
    </div>
  );
};

export default RichTextEditor;