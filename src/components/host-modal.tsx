import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const HOST_CODE = "2025";

interface HostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onHostAuthenticated: () => void;
  hostCode: string;
  setHostCode: (code: string) => void;
}

const HostModal = ({
  isOpen,
  onOpenChange,
  onHostAuthenticated,
  hostCode,
  setHostCode,
}: HostModalProps) => {
  const handleHostCodeSubmit = () => {
    if (hostCode === HOST_CODE) {
      onHostAuthenticated();
      onOpenChange(false);
      toast.success("Đã kích hoạt host!");
      setHostCode("");
    } else {
      toast.warning("Mã không đúng!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="font-bangers tracking-widest sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác thực Host</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            type="password"
            placeholder="Nhập mã host"
            value={hostCode}
            onChange={(e) => setHostCode(e.target.value)}
          />
          <Button onClick={handleHostCodeSubmit}>Xác nhận</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HostModal;
