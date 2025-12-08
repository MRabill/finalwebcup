import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Briefcase, Star, Award, Users, X } from "lucide-react"

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  title: string
  type: "milestone" | "plan"
  initialData?: any
}

export default function FormModal({ isOpen, onClose, onSubmit, title, type, initialData }: FormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    iconType: "briefcase"
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        date: initialData.date || "",
        iconType: initialData.iconType || "briefcase"
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const iconOptions = [
    { value: "briefcase", icon: <Briefcase className="h-5 w-5 text-indigo-400" />, label: "Work" },
    { value: "star", icon: <Star className="h-5 w-5 text-yellow-400" />, label: "Achievement" },
    { value: "award", icon: <Award className="h-5 w-5 text-emerald-400" />, label: "Recognition" },
    { value: "users", icon: <Users className="h-5 w-5 text-blue-400" />, label: "Team" }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/95 backdrop-blur-md border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {type === "milestone" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="date" className="text-sm font-medium text-gray-300">Date</Label>
                <Input
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="e.g., June 2023"
                  className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Icon</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {iconOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, iconType: option.value })}
                      className={`p-2 rounded-lg border transition-all duration-200 ${
                        formData.iconType === option.value
                          ? "bg-indigo-500/20 border-indigo-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {option.icon}
                        <span className="text-xs text-gray-400">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-300">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter title"
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 