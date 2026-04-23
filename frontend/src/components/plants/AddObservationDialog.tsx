import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { useAddObservation } from "@/api/hooks/usePlants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddObservationDialog({ plantId }: { plantId: string }) {
  const [open, setOpen] = useState(false);
  const [observation, setObservation] = useState("");

  const mutation = useAddObservation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      { id: plantId, observation },
      {
        onSuccess: () => {
          toast.success("Observation logged");
          setOpen(false);
          setObservation("");
        },
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><MessageSquarePlus className="mr-1 h-4 w-4" /> Add observation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add observation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="obs2">Note</Label>
            <Textarea id="obs2" required value={observation} onChange={(e) => setObservation(e.target.value)} rows={4} placeholder="What did you notice?" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !observation.trim()}>Log note</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
