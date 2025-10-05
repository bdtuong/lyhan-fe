"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Calendar, Clock, ImagePlus, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { Event } from "@/hooks/useEvents"

type Props = {
  mode: "create" | "edit"
  initialData?: Partial<Event>
  onSubmit: (formData: FormData) => Promise<void>
}

export function EventForm({ mode, initialData, onSubmit }: Props) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [startDate, setStartDate] = useState(initialData?.startTime?.slice(0, 10) || "")
  const [startTime, setStartTime] = useState(initialData?.startTime?.slice(11, 16) || "")
  const [endDate, setEndDate] = useState(initialData?.endTime?.slice(0, 10) || "")
  const [endTime, setEndTime] = useState(initialData?.endTime?.slice(11, 16) || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [errors, setErrors] = useState<{ field?: string; message?: string }>({})

  const fieldClass =
    "bg-neutral-800 border border-white/10 text-white placeholder-gray-400 focus-visible:ring-white [color-scheme:dark]"

  const startISO = useMemo(() => {
    if (!startDate || !startTime) return ""
    return new Date(`${startDate}T${startTime}`).toISOString()
  }, [startDate, startTime])

  const endISO = useMemo(() => {
    if (!endDate || !endTime) return ""
    return new Date(`${endDate}T${endTime}`).toISOString()
  }, [endDate, endTime])

  const endDateMin = startDate || undefined
  const endTimeMin = useMemo(() => {
    if (startDate && endDate && startDate === endDate) return startTime || undefined
    return undefined
  }, [startDate, endDate, startTime])

  const validate = () => {
    if (!title.trim()) return { field: "title", message: "Title is required." }
    if (!location.trim()) return { field: "location", message: "Location is required." }
    if (!startDate || !startTime) return { field: "startTime", message: "Start time is required." }
    if (!endDate || !endTime) return { field: "endTime", message: "End time is required." }
    if (new Date(endISO) < new Date(startISO))
      return { field: "endTime", message: "End time must be after start time." }
    if (!description.trim()) return { field: "description", message: "Description is required." }
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
    <Card className="bg-neutral-900 border border-white/10 text-white shadow-xl">
      <div className="px-6 py-5 border-b border-white/10">
        <h2 className="text-xl font-semibold">
          {mode === "create" ? "Create a New Event" : "Edit Event"}
        </h2>
        <p className="text-sm text-gray-400">Fields marked with * are required.</p>
      </div>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title + Location */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={fieldClass}
              />
              {errors.field === "title" && (
                <p className="text-sm text-red-400">{errors.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldClass}
              />
              {errors.field === "location" && (
                <p className="text-sm text-red-400">{errors.message}</p>
              )}
            </div>
          </div>

          {/* Time Range */}
          <div className="space-y-3">
            <Label>Event Time *</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (endDate && e.target.value > endDate) setEndDate(e.target.value)
                  }}
                  className={fieldClass}
                />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={endDate}
                  min={endDateMin}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={fieldClass}
                />
                <Input
                  type="time"
                  value={endTime}
                  min={endTimeMin}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
            {errors.field === "endTime" && (
              <p className="text-sm text-red-400">{errors.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldClass}
              rows={5}
            />
            {errors.field === "description" && (
              <p className="text-sm text-red-400">{errors.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Event Image (optional)</Label>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="group relative flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/20 rounded-xl p-6 bg-neutral-800/60 text-center"
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
                  <ImagePlus className="h-6 w-6 text-white/60" />
                  <p className="text-sm">
                    Drag & drop or{" "}
                    <button
                      type="button"
                      onClick={onBrowse}
                      className="text-white underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, WebP • ≤ 5MB</p>
                </>
              ) : (
                <div className="w-full max-w-md relative">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="h-56 w-full object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-white text-black hover:bg-neutral-200"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Saving..." : mode === "create" ? "Create Event" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
