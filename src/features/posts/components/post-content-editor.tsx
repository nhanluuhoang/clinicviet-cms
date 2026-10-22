import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Undo2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Props = { value: string; onChange: (value: string) => void }

export function PostContentEditor({ value, onChange }: Props) {
  const { t } = useTranslation()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer nofollow',
          },
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-72 px-4 py-3 text-sm outline-none [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
      },
    },
    onUpdate: ({ editor: currentEditor }) =>
      onChange(currentEditor.isEmpty ? '' : currentEditor.getHTML()),
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== value)
      editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt(
      t('messages.enterLinkUrl'),
      previousUrl ?? 'https://'
    )
    if (url === null) return
    if (!url.trim())
      return void editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run()
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim() })
      .run()
  }

  const toolbar = [
    {
      label: t('messages.heading2'),
      icon: Heading2,
      active: editor.isActive('heading', { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: t('messages.heading3'),
      icon: Heading3,
      active: editor.isActive('heading', { level: 3 }),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: t('messages.bold'),
      icon: Bold,
      active: editor.isActive('bold'),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: t('messages.italic'),
      icon: Italic,
      active: editor.isActive('italic'),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: t('messages.bulletList'),
      icon: List,
      active: editor.isActive('bulletList'),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: t('messages.numberedList'),
      icon: ListOrdered,
      active: editor.isActive('orderedList'),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: t('messages.quote'),
      icon: Quote,
      active: editor.isActive('blockquote'),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: t('messages.link'),
      icon: LinkIcon,
      active: editor.isActive('link'),
      action: setLink,
    },
    {
      label: t('messages.clearFormatting'),
      icon: RemoveFormatting,
      active: false,
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
  ]

  return (
    <div className='overflow-hidden rounded-md border bg-background focus-within:ring-[3px] focus-within:ring-ring/50'>
      <div className='flex flex-wrap gap-1 border-b bg-muted/40 p-2'>
        {toolbar.map(({ label, icon: Icon, active, action }) => (
          <Button
            key={label}
            type='button'
            variant='ghost'
            size='icon'
            aria-label={label}
            title={label}
            className={cn(
              'size-8',
              active && 'bg-accent text-accent-foreground'
            )}
            onClick={action}
          >
            <Icon />
          </Button>
        ))}
        <span className='mx-1 w-px bg-border' />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8'
          aria-label={t('messages.undo')}
          title={t('messages.undo')}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8'
          aria-label={t('messages.redo')}
          title={t('messages.redo')}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
