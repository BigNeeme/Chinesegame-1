import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface RoomJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
  isJoining: boolean;
  error?: string;
}

export function RoomJoinModal({
  isOpen,
  onClose,
  onJoin,
  isJoining,
  error,
}: RoomJoinModalProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onJoin(code.toUpperCase());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Game Room</DialogTitle>
          <DialogDescription>
            Enter the 6-character room code to join a game
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">Room Code</Label>
            <Input
              id="room-code"
              placeholder="ABCDEF"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              className="font-mono text-2xl text-center tracking-widest uppercase"
              maxLength={6}
              autoComplete="off"
              autoFocus
              data-testid="input-room-code"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-join"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={code.length !== 6 || isJoining}
              className="flex-1"
              data-testid="button-confirm-join"
            >
              {isJoining ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Join Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
