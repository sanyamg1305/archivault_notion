"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RichTextEditor({
  name,
  defaultValue,
  placeholder,
  minHeightClassName = "min-h-40",
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeightClassName?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({ html: false, tightLists: true }),
    ],
    content: defaultValue ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral max-w-none focus:outline-none",
          "prose-headings:font-semibold prose-a:text-primary",
          minHeightClassName,
          "px-3 py-2"
        ),
      },
    },
  });

  const markdown = editor
    ? (editor.storage as unknown as { markdown: MarkdownStorage }).markdown.getMarkdown()
    : (defaultValue ?? "");

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={markdown} readOnly />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return <div className="h-11 border-b bg-muted/30" />;
  }

  const items: {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick: () => void;
  }[] = [
    {
      icon: <Bold className="size-4" />,
      label: "Bold",
      isActive: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: <Italic className="size-4" />,
      label: "Italic",
      isActive: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: <Heading2 className="size-4" />,
      label: "Heading 2",
      isActive: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: <Heading3 className="size-4" />,
      label: "Heading 3",
      isActive: editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: <List className="size-4" />,
      label: "Bullet list",
      isActive: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: <ListOrdered className="size-4" />,
      label: "Numbered list",
      isActive: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: <Quote className="size-4" />,
      label: "Quote",
      isActive: editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: <Code className="size-4" />,
      label: "Code block",
      isActive: editor.isActive("codeBlock"),
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      icon: <Link2 className="size-4" />,
      label: "Link",
      isActive: editor.isActive("link"),
      onClick: () => {
        const url = window.prompt("Link URL");
        if (url) editor.chain().focus().setLink({ href: url }).run();
        else editor.chain().focus().unsetLink().run();
      },
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1.5">
      {items.map((item) => (
        <Button
          key={item.label}
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-7", item.isActive && "bg-accent text-accent-foreground")}
          aria-label={item.label}
          title={item.label}
          onClick={item.onClick}
        >
          {item.icon}
        </Button>
      ))}
      <div className="mx-1 h-5 w-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label="Undo"
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label="Redo"
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="size-4" />
      </Button>
    </div>
  );
}
