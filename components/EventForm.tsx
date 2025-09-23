"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Calendar, MapPin, Clock, ImagePlus, X } from "lucide-react"
import type { Event } from "@/hooks/useEvents"

type Props = {
  mode: "create" | "edit"
  initialData?: Partial<Event>
  onSubmit: (formData: FormData) => Promise<void>
}

export function EventForm({ mode, initialData, onSubmit }: Props) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [startDate, setStartDate] = useState(
    initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 10) : ""
  )
  const [startTime, setStartTime] = useState(
    initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(11, 16) : ""
  )
  const [endDate, setEndDate] = useState(
    initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 10) : ""
  )
  const [endTime, setEndTime] = useState(
    initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(11, 16) : ""
  )
  const [location, setLocation] = useState(initialData?.location || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ field?: string; message?: string }>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // 🔧 style cho input/textarea ở nền tối
  const fieldClass =
    "bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-400 " +
    "focus-visible:ring-blue-500 [color-scheme:dark]"

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "")
      setLocation(initialData.location || "")
      setDescription(initialData.description || "")
    }
  }, [initialData])

  const startISO = useMemo(() => {
    if (!startDate || !startTime) return ""
    return new Date(`${startDate}T${startTime}:00`).toISOString()
  }, [startDate, startTime])

  const endISO = useMemo(() => {
    if (!endDate || !endTime) return ""
    return new Date(`${endDate}T${endTime}:00`).toISOString()
  }, [endDate, endTime])

  const endDateMin = startDate || undefined
  const endTimeMin = useMemo(() => {
    if (startDate && endDate && startDate === endDate) return startTime || undefined
    return undefined
  }, [startDate, endDate, startTime])

  const validate = () => {
    if (!title.trim()) return { field: "title", message: "Vui lòng nhập tiêu đề." }
    if (!location.trim()) return { field: "location", message: "Vui lòng nhập địa điểm." }
    if (!startDate || !startTime) return { field: "startTime", message: "Chọn ngày & giờ bắt đầu." }
    if (!endDate || !endTime) return { field: "endTime", message: "Chọn ngày & giờ kết thúc." }
    if (startISO && endISO && new Date(endISO) < new Date(startISO))
      return { field: "endTime", message: "Thời gian kết thúc phải ≥ thời gian bắt đầu." }
    if (!description.trim()) return { field: "description", message: "Vui lòng nhập mô tả." }
    return {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    setErrors(err)
    if (err.message) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("location", location)
      formData.append("startTime", startISO)
      formData.append("endTime", endISO)
      if (imageFile) formData.append("images", imageFile)

      await onSubmit(formData)

      if (mode === "create") {
        setTitle("")
        setStartDate("")
        setStartTime("")
        setEndDate("")
        setEndTime("")
        setLocation("")
        setDescription("")
        setImageFile(null)
        setErrors({})
      }
    } finally {
      setSubmitting(false)
    }
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) setImageFile(file)
  }

  const onBrowse = () => fileInputRef.current?.click()

  return (
    <Card className="mb-8 border-slate-700 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-xl shadow-black/30">
      <div className="rounded-t-xl bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700 px-6 py-5 text-white">
        <h2 className="text-lg font-semibold tracking-wide">
          {mode === "create" ? "Tạo sự kiện mới" : "Chỉnh sửa sự kiện"}
        </h2>
        <p className="text-white/70 text-sm mt-0.5">Điền thông tin bên dưới. Trường bắt buộc có dấu *</p>
      </div>

      <CardContent className="p-6 text-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-100">Tiêu đề *</Label>
              <div className="relative">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={`pl-10 ${fieldClass}`}
                  aria-invalid={errors.field === "title"}
                />
                <div className="pointer-events-none absolute left-3 top-2.5 text-blue-400">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              {errors.field === "title" && (
                <p className="text-xs text-red-400">{errors.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-100">Địa điểm *</Label>
              <div className="relative">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className={`pl-10 ${fieldClass}`}
                  aria-invalid={errors.field === "location"}
                />
                <div className="pointer-events-none absolute left-3 top-2.5 text-blue-400">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
              {errors.field === "location" && (
                <p className="text-xs text-red-400">{errors.message}</p>
              )}
            </div>
          </div>

          {/* Time range */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 backdrop-blur">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-md bg-slate-800 p-1.5 text-blue-400">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-slate-100">Thời gian sự kiện *</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate" className="text-slate-100">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const v = e.target.value
                      setStartDate(v)
                      if (endDate && v && endDate < v) setEndDate(v)
                    }}
                    required
                    className={fieldClass}
                  />
                </div>
                <div>
                  <Label htmlFor="startTime" className="text-slate-100">Giờ bắt đầu</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="endDate" className="text-slate-100">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    min={endDateMin}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className={`${fieldClass}`}
                    aria-invalid={errors.field === "endTime"}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-slate-100">Giờ kết thúc</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    min={endTimeMin}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className={`${fieldClass}`}
                    aria-invalid={errors.field === "endTime"}
                  />
                </div>
              </div>
            </div>

            {errors.field === "endTime" && (
              <p className="mt-2 text-xs text-red-400">{errors.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-100">Mô tả *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className={fieldClass}
              aria-invalid={errors.field === "description"}
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              {errors.field === "description" ? (
                <p className="text-xs text-red-400">{errors.message}</p>
              ) : (
                <span className="text-xs text-slate-400">Viết ngắn gọn, rõ ràng.</span>
              )}
              <span className="text-xs text-slate-400">{description.length}/1000</span>
            </div>
          </div>

          {/* Image uploader */}
          <div className="space-y-2">
            <Label className="text-slate-100">Ảnh sự kiện (tùy chọn)</Label>

            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/60 p-6 text-center transition hover:bg-slate-800"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />

              {!imageFile ? (
                <>
                  <div className="rounded-full bg-slate-800 p-3 text-blue-400">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      Kéo & thả ảnh vào đây hoặc{" "}
                      <button
                        type="button"
                        onClick={onBrowse}
                        className="text-blue-400 underline decoration-blue-700/40 underline-offset-4 hover:text-blue-300"
                      >
                        chọn ảnh
                      </button>
                    </p>
                    <p className="text-xs text-slate-400">PNG, JPG, WEBP • ≤ 5MB</p>
                  </div>
                </>
              ) : (
                <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-slate-700 bg-slate-900/80">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="h-56 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="absolute right-2 top-2 rounded-full bg-slate-900/90 p-1.5 text-slate-100 shadow hover:bg-slate-900"
                    aria-label="Xóa ảnh"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="truncate text-xs text-slate-200">{imageFile.name}</span>
                    <button
                      type="button"
                      onClick={onBrowse}
                      className="text-xs font-medium text-blue-400 hover:underline"
                    >
                      Đổi ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 text-white"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Đang lưu..." : mode === "create" ? "Tạo sự kiện" : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
