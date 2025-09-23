import { Editor } from "@/components/editor"

export default function EditorPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Editor</h1>
          <p className="text-muted-foreground text-lg">
            Upload a background, add stickers, draw with cute brushes, and export your creation 🎨
          </p>
        </div>

        <Editor />
      </div>
    </div>
  )
}
