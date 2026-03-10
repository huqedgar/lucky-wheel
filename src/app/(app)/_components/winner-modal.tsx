"use client"

import type { Participant } from "@/types/participant.type"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WinnerModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  winner: Participant | null
  remainingParticipants: number
  onClose: () => void
}

const WinnerModal = ({
  isOpen,
  onOpenChange,
  winner,
  remainingParticipants,
  onClose,
}: WinnerModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open && remainingParticipants === 1) {
          setTimeout(onClose, 500)
        }
      }}
    >
      <DialogContent className="font-bangers tracking-widest sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-4xl text-yellow-500">
            🎉 Chúc mừng! 🎉
          </DialogTitle>
          <DialogDescription className="pt-6 text-center">
            <div className="relative">
              <div className="rounded-lg bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-8 uppercase">
                <div className="text-3xl font-bold uppercase text-purple-800">{winner?.name}</div>
                <div className="mt-4 text-xl font-medium text-purple-600">đã được chọn!</div>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <span className="animate-bounce text-2xl">🎈</span>
              <span className="animate-bounce text-2xl delay-100">🎁</span>
              <span className="animate-bounce text-2xl delay-200">🎊</span>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default WinnerModal
