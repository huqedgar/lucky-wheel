import { Participant } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GrandPrizeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  winner: Participant | null;
}

const GrandPrizeModal = ({
  isOpen,
  onOpenChange,
  winner,
}: GrandPrizeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="font-bangers tracking-widest sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="text-4xl text-yellow-500">🌟 GIẢI ĐẶC BIỆT 🌟</div>
          </DialogTitle>
          <DialogDescription className="pt-6 text-center">
            <div className="relative">
              <div className="rounded-lg bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 p-8 uppercase">
                <div className="text-xl font-medium text-yellow-600">
                  xin chúc mừng
                </div>
                <div className="mt-4 text-3xl font-bold uppercase text-red-500">
                  {winner?.name}
                </div>
                <div className="mt-4 text-xl font-medium text-yellow-600">
                  may mắn trúng giải đặc biệt
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <span className="animate-bounce text-2xl">🏆</span>
              <span className="animate-bounce text-2xl delay-100">👑</span>
              <span className="animate-bounce text-2xl delay-200">💝</span>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default GrandPrizeModal;
