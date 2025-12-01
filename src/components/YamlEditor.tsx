import Editor from '@monaco-editor/react'
import { useRef, useEffect } from 'react'
import { Finding } from '@/lib/types'

interface YamlEditorProps {
  value: string
  onChange: (value: string) => void
  findings?: Finding[]
  readonly?: boolean
}

export function YamlEditor({ value, onChange, findings = [], readonly = false }: YamlEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    monaco.editor.defineTheme('k8s-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1a1a2e',
        'editor.foreground': '#f0f0f0',
        'editor.lineHighlightBackground': '#25254a40',
        'editor.selectionBackground': '#4a4a7a',
        'editorCursor.foreground': '#5ce1e6',
        'editorLineNumber.foreground': '#6a6a8a',
        'editorLineNumber.activeForeground': '#5ce1e6',
      },
    })

    monaco.editor.setTheme('k8s-dark')
  }

  useEffect(() => {
    if (!editorRef.current || findings.length === 0) return

    const editor = editorRef.current
    const monaco = (window as any).monaco

    const decorations = findings.map((finding) => {
      const severity = finding.severity
      let className = 'bg-info/20'
      let glyphClassName = 'info-glyph'
      
      if (severity === 'CRITICAL' || severity === 'HIGH') {
        className = 'bg-destructive/20'
        glyphClassName = 'error-glyph'
      } else if (severity === 'MEDIUM') {
        className = 'bg-warning/20'
        glyphClassName = 'warning-glyph'
      }

      return {
        range: new monaco.Range(finding.line, 1, finding.line, 1000),
        options: {
          isWholeLine: true,
          className,
          glyphMarginClassName: glyphClassName,
          glyphMarginHoverMessage: { value: finding.message },
          hoverMessage: { value: `**${finding.severity}**: ${finding.message}` },
        },
      }
    })

    const decorationIds = editor.deltaDecorations([], decorations)

    return () => {
      editor.deltaDecorations(decorationIds, [])
    }
  }, [findings])

  return (
    <div className="h-full w-full border border-border rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme="k8s-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, monospace',
          lineNumbers: 'on',
          rulers: [],
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderWhitespace: 'selection',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: readonly,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  )
}
