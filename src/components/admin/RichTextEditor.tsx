'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import ListItem from '@tiptap/extension-list-item'
// Table extensions will be added later
import { useState, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code2,
  Eye,
  Undo,
  Redo
} from 'lucide-react'
import ImageEditModal from './ImageEditModal'
import LinkEditModal from './LinkEditModal'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [currentFormats, setCurrentFormats] = useState<string[]>([])
  const [imageEditModal, setImageEditModal] = useState<{
    isOpen: boolean
    data: { src: string; alt: string; title?: string }
    position?: { from: number; to: number }
  }>({
    isOpen: false,
    data: { src: '', alt: '', title: '' }
  })
  
  const [linkEditModal, setLinkEditModal] = useState<{
    isOpen: boolean
    data: { href: string; text: string; target?: string }
    position?: { from: number; to: number }
  }>({
    isOpen: false,
    data: { href: '', text: '', target: '' }
  })

  // Function to update current format indicators
  const updateCurrentFormats = (editor: any) => {
    if (!editor) return
    
    const formats: string[] = []
    
    // Check text formatting
    if (editor.isActive('bold')) formats.push('Bold')
    if (editor.isActive('italic')) formats.push('Italic')
    if (editor.isActive('underline')) formats.push('Underline')
    if (editor.isActive('strike')) formats.push('Strikethrough')
    if (editor.isActive('code')) formats.push('Code')
    
    // Check headings
    if (editor.isActive('heading', { level: 1 })) formats.push('H1')
    if (editor.isActive('heading', { level: 2 })) formats.push('H2')
    if (editor.isActive('heading', { level: 3 })) formats.push('H3')
    
    // Check paragraph
    if (editor.isActive('paragraph') && !formats.some(f => f.startsWith('H'))) {
      formats.push('P')
    }
    
    // Check lists
    if (editor.isActive('bulletList')) formats.push('Bullet List')
    if (editor.isActive('orderedList')) formats.push('Numbered List')
    
    // Check other formats
    if (editor.isActive('blockquote')) formats.push('Quote')
    if (editor.isActive('link')) formats.push('Link')
    
    // Check text alignment
    if (editor.isActive({ textAlign: 'center' })) formats.push('Center')
    if (editor.isActive({ textAlign: 'right' })) formats.push('Right')
    if (editor.isActive({ textAlign: 'justify' })) formats.push('Justify')
    
    setCurrentFormats(formats)
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        listItem: false, // We'll use custom ListItem
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'ml-6 mb-1 pl-2',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        allowBase64: true, // Allow base64 images
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer no-link-click',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      updateCurrentFormats(editor)
    },
    onSelectionUpdate: ({ editor }) => {
      updateCurrentFormats(editor)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0',
      },
      handlePaste: (view, event, slice) => {
        // Simple paste handler - let TipTap do most of the work
        const { clipboardData } = event
        if (clipboardData) {
          const html = clipboardData.getData('text/html')
          
          if (html) {
            // Check for images in the pasted content for auto-upload feature
            const imageMatches = html.match(/<img[^>]*>/gi)
            if (imageMatches && imageMatches.length > 0) {
              console.log(`Found ${imageMatches.length} image(s) in pasted content - will be auto-uploaded on save`)
            }
            
            // Let TipTap handle the paste naturally
            return false // Let TipTap handle it
          }
        }
        
        // Let TipTap handle the paste
        return false
      },
      handleDoubleClick: (view, pos, event) => {
        handleDoubleClick(event as MouseEvent)
        return false
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement
        // Prevent single click on links from opening them
        if (target.tagName === 'A') {
          event.preventDefault()
          event.stopPropagation()
          return true // Handled
        }
        return false
      },
    },
  })

  // Initialize format state when editor is ready
  useEffect(() => {
    if (editor) {
      updateCurrentFormats(editor)
    }
  }, [editor])

  // Add event listener to prevent link clicks and handle double clicks
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom
      
      const handleLinkClick = (event: Event) => {
        const target = event.target as HTMLElement
        const link = target.tagName === 'A' ? target : target.closest('a')
        if (link) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          // Remove href temporarily to prevent navigation
          const href = link.getAttribute('href')
          if (href) {
            link.removeAttribute('href')
            setTimeout(() => {
              link.setAttribute('href', href)
            }, 100)
          }
          return false
        }
      }
      
      const handleLinkMouseDown = (event: Event) => {
        const target = event.target as HTMLElement
        const link = target.tagName === 'A' ? target : target.closest('a')
        if (link) {
          event.preventDefault()
          event.stopPropagation()
          return false
        }
      }
      
      // Add multiple event listeners to catch all possible click events
      editorElement.addEventListener('click', handleLinkClick, true)
      editorElement.addEventListener('mousedown', handleLinkMouseDown, true)
      editorElement.addEventListener('mouseup', handleLinkClick, true)
      
      return () => {
        editorElement.removeEventListener('click', handleLinkClick, true)
        editorElement.removeEventListener('mousedown', handleLinkMouseDown, true)
        editorElement.removeEventListener('mouseup', handleLinkClick, true)
      }
    }
  }, [editor])

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switch from HTML to rich text mode
      editor?.commands.setContent(htmlContent)
      setIsHtmlMode(false)
    } else {
      // Switch from rich text to HTML mode
      setHtmlContent(editor?.getHTML() || '')
      setIsHtmlMode(true)
    }
  }

  const handleHtmlChange = (value: string) => {
    setHtmlContent(value)
    onChange(value)
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  // Handle double click for editing images and links
  const handleDoubleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    
    // Handle image double click
    if (target.tagName === 'IMG') {
      event.preventDefault()
      event.stopPropagation()
      
      const img = target as HTMLImageElement
      const src = img.getAttribute('src') || ''
      const alt = img.getAttribute('alt') || ''
      const title = img.getAttribute('title') || ''
      
      // Find the position of this image in the editor
      if (editor) {
        const { state } = editor
        let imagePos = -1
        
        state.doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.src === src) {
            imagePos = pos
            return false // Stop searching
          }
        })
        
        if (imagePos !== -1) {
          setImageEditModal({
            isOpen: true,
            data: { src, alt, title },
            position: { from: imagePos, to: imagePos + 1 }
          })
        }
      }
    }
    
    // Handle link double click
    if (target.tagName === 'A') {
      event.preventDefault()
      event.stopPropagation()
      
      const link = target as HTMLAnchorElement
      const href = link.getAttribute('href') || ''
      const text = link.textContent || ''
      const target_attr = link.getAttribute('target') || '_self'
      
      // Find the position of this link in the editor
      if (editor) {
        const { state, view } = editor
        const pos = view.posAtDOM(link, 0)
        const $pos = state.doc.resolve(pos)
        const linkMark = $pos.marks().find(mark => mark.type.name === 'link')
        
        if (linkMark) {
          // Find the range of the link
          let start = pos
          let end = pos
          
          // Find start of link
          while (start > 0) {
            const $start = state.doc.resolve(start - 1)
            if (!$start.marks().some(mark => mark.type.name === 'link' && mark.attrs.href === href)) {
              break
            }
            start--
          }
          
          // Find end of link
          while (end < state.doc.content.size) {
            const $end = state.doc.resolve(end + 1)
            if (!$end.marks().some(mark => mark.type.name === 'link' && mark.attrs.href === href)) {
              break
            }
            end++
          }
          
          setLinkEditModal({
            isOpen: true,
            data: { href, text, target: target_attr },
            position: { from: start, to: end }
          })
        }
      }
    }
  }

  // Handle image edit save
  const handleImageEditSave = (data: { src: string; alt: string; title?: string }) => {
    if (editor && imageEditModal.position) {
      const { from, to } = imageEditModal.position
      
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .setImage({
          src: data.src,
          alt: data.alt,
          title: data.title
        })
        .run()
    }
    
    setImageEditModal({
      isOpen: false,
      data: { src: '', alt: '', title: '' }
    })
  }

  // Handle link edit save
  const handleLinkEditSave = (data: { href: string; text?: string; target?: string }) => {
    if (editor && linkEditModal.position) {
      const { from, to } = linkEditModal.position
      
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .setLink({
          href: data.href,
          target: data.target
        })
        .run()
      
      // If text is provided, replace the selected text
      if (data.text && data.text !== linkEditModal.data.text) {
        editor
          .chain()
          .focus()
          .insertContent(data.text)
          .run()
      }
    }
    
    setLinkEditModal({
      isOpen: false,
      data: { href: '', text: '', target: '' }
    })
  }

  // Handle link removal
  const handleLinkRemove = () => {
    if (editor && linkEditModal.position) {
      const { from, to } = linkEditModal.position
      
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .unsetLink()
        .run()
    }
    
    setLinkEditModal({
      isOpen: false,
      data: { href: '', text: '', target: '' }
    })
  }

  // Table functionality will be added later

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col h-full">
      <style jsx>{`
        :global(.ProseMirror ul) {
          padding-left: 2rem !important;
          margin-left: 0 !important;
        }
        :global(.ProseMirror ol) {
          padding-left: 2rem !important;
          margin-left: 0 !important;
        }
        :global(.ProseMirror li) {
          margin-left: 0 !important;
          padding-left: 0.5rem !important;
        }
        :global(.ProseMirror li::marker) {
          content: '•' !important;
        }
        :global(.ProseMirror a) {
          text-decoration: underline !important;
          color: #2563eb !important;
          cursor: pointer !important;
        }
        :global(.ProseMirror a:hover) {
          color: #1d4ed8 !important;
        }
        :global(.ProseMirror a[href]) {
          pointer-events: none !important;
        }
        :global(.ProseMirror a[href]:hover) {
          pointer-events: none !important;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-gray-50">
        {/* Current Format Indicator */}
        {!isHtmlMode && currentFormats.length > 0 && (
          <>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-xs font-medium text-blue-700">Current:</span>
              <div className="flex flex-wrap gap-1">
                {currentFormats.map((format, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-px h-6 bg-gray-300 mx-2" />
          </>
        )}

        {/* Mode Toggle */}
        <button
          onClick={toggleHtmlMode}
          className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded transition-colors ${
            isHtmlMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
          title={isHtmlMode ? 'Switch to Visual Mode' : 'Switch to HTML Mode'}
        >
          {isHtmlMode ? <Eye className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
          <span>{isHtmlMode ? 'Visual' : 'HTML'}</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {!isHtmlMode && (
          <>
            {/* Undo/Redo */}
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* Headings */}
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
              }`}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* Text Formatting */}
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('bold') ? 'bg-gray-200' : ''
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('italic') ? 'bg-gray-200' : ''
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('underline') ? 'bg-gray-200' : ''
              }`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('strike') ? 'bg-gray-200' : ''
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('code') ? 'bg-gray-200' : ''
              }`}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* Text Alignment */}
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
              }`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''
              }`}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* Lists */}
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('bulletList') ? 'bg-gray-200' : ''
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('orderedList') ? 'bg-gray-200' : ''
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* Block Elements */}
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('blockquote') ? 'bg-gray-200' : ''
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded"
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {/* Media & Links */}
            <button
              onClick={addLink}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded ${
                editor.isActive('link') ? 'bg-gray-200' : ''
              }`}
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={addImage}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded"
              title="Add Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 min-h-[300px] max-h-[600px] overflow-y-auto border border-gray-300 rounded-b-lg">
        {isHtmlMode ? (
          <textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="w-full h-full min-h-[300px] p-4 font-mono text-sm border-0 focus:ring-0 resize-none"
            placeholder="Enter HTML content..."
          />
        ) : (
          <EditorContent
            editor={editor}
            className="h-full min-h-[300px] p-4 [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_li]:ml-2 [&_.ProseMirror_li]:mb-1 [&_.ProseMirror_li]:pl-2 [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2"
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        {isHtmlMode ? (
          'HTML Mode - Switch to Visual mode to see formatted content'
        ) : (
          'Supports paste from Google Docs, Word, and other rich text sources. Images from Google Docs will be automatically uploaded to media library when you publish. Double-click any image or link to edit its properties.'
        )}
      </div>

      {/* Image Edit Modal */}
      <ImageEditModal
        isOpen={imageEditModal.isOpen}
        onClose={() => setImageEditModal({
          isOpen: false,
          data: { src: '', alt: '', title: '' }
        })}
        onSave={handleImageEditSave}
        initialData={imageEditModal.data}
      />

      {/* Link Edit Modal */}
      <LinkEditModal
        isOpen={linkEditModal.isOpen}
        onClose={() => setLinkEditModal({
          isOpen: false,
          data: { href: '', text: '', target: '' }
        })}
        onSave={handleLinkEditSave}
        onRemove={handleLinkRemove}
        initialData={linkEditModal.data}
      />
    </div>
  )
}
