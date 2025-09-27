import { Editor } from "@/components/editor"

export default function EditorPage() {
  return (
    <div
      className="min-h-screen bg-top bg-repeat"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "100% auto",
      }}
    >
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🎀 Góc Sáng Tạo 🎀</h1>
            <p className="text-lg text-pink-200">
              Tải ảnh nền xinh xinh ✨, vẽ bằng cọ dễ thương 🖌️, 
              rồi lưu lại bức tranh nhỏ xinh của bạn nha 💖
            </p>
          </div>

          <Editor />
        </div>
      </div>
    </div>
  )
}
