import React, { useRef, useState, useEffect } from "react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Eye as EyeIcon,
  Edit3 as Edit3Icon,
} from "lucide-react";

interface RichTextAreaProps {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}

const Bold: any = BoldIcon;
const Italic: any = ItalicIcon;
const List: any = ListIcon;
const ListOrdered: any = ListOrderedIcon;
const Eye: any = EyeIcon;
const Edit3: any = Edit3Icon;

export function RichTextArea({
  label,
  sublabel,
  icon,
  value,
  onChange,
  rows = 5,
  placeholder,
  className = "",
}: RichTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, activeTab]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (
    command: string,
    arg: string | undefined = undefined,
  ) => {
    if (activeTab !== "edit") return;
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <label className="text-xs font-bold text-white flex items-center space-x-1.5">
          {icon}
          <span>{label}</span>
        </label>
        <div className="flex items-center space-x-2">
          {sublabel && (
            <span className="text-[10px] text-[#B0A894] font-normal hidden sm:inline">
              {sublabel}
            </span>
          )}
          {/* Botones Modo Edición / Vista Previa */}
          <div className="flex bg-[#1A140E] p-0.5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1 transition-all ${
                activeTab === "edit"
                  ? "bg-[#C9A45C] text-black font-bold"
                  : "text-[#B0A894] hover:text-white"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center space-x-1 transition-all ${
                activeTab === "preview"
                  ? "bg-[#C9A45C] text-black font-bold"
                  : "text-[#B0A894] hover:text-white"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0C0A07] border border-white/10 rounded-xl overflow-hidden focus-within:border-[#C9A45C] transition-all shadow-inner">
        {/* Barra de Herramientas */}
        {activeTab === "edit" && (
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-[#1A140E] border-b border-white/10">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("bold");
              }}
              title="Negrita"
              className="p-1 rounded text-[#B0A894] hover:text-[#C9A45C] hover:bg-white/5 transition-all text-xs font-bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("italic");
              }}
              title="Cursiva"
              className="p-1 rounded text-[#B0A894] hover:text-[#C9A45C] hover:bg-white/5 transition-all text-xs"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="h-3 w-[1px] bg-white/10 mx-0.5" />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("insertUnorderedList");
              }}
              title="Lista"
              className="p-1 rounded text-[#B0A894] hover:text-[#C9A45C] hover:bg-white/5 transition-all text-xs"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand("insertOrderedList");
              }}
              title="Lista Numerada"
              className="p-1 rounded text-[#B0A894] hover:text-[#C9A45C] hover:bg-white/5 transition-all text-xs"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Editor Content */}
        {activeTab === "edit" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            style={{ minHeight: `${rows * 1.5}rem` }}
            className="w-full bg-transparent p-3 sm:p-4 text-xs text-white outline-none leading-relaxed overflow-y-auto rich-editor-content"
            data-placeholder={placeholder}
          />
        ) : (
          <div
            style={{ minHeight: `${rows * 1.5}rem` }}
            className="w-full bg-[#080705] p-3 sm:p-4 text-xs text-[#E5DBC7] leading-relaxed overflow-y-auto rich-editor-content border-l-2 border-[#C9A45C]"
            dangerouslySetInnerHTML={{
              __html:
                value ||
                "<span class='text-gray-500 italic'>Sin contenido</span>",
            }}
          />
        )}
      </div>
    </div>
  );
}
