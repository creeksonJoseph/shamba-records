import { useState } from "react";
import { Layers } from "lucide-react";
import { toast } from "sonner";
import type { Plant, Stage } from "@/lib/types";
import { useUpdateStage } from "@/api/hooks/usePlants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STAGES: Stage[] = ["planted", "growing", "ready", "harvested"];

export function UpdateStageDialog({ plant }: { plant: Plant }) {
  const [open, setOpen] = useState(false);
  const [newStage, setNewStage] = useState<Stage>(plant.stage);
  const [observation, setObservation] = useState("");

  const mutation = useUpdateStage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      { id: plant.id, new_stage: newStage, observation: observation || undefined },
      {
        onSuccess: () => {
          toast.success("Stage updated");
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
        <Button variant="outline"><Layers className="mr-1 h-4 w-4" /> Update stage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Update stage</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>New stage</Label>
            <Select value={newStage} onValueChange={(v) => setNewStage(v as Stage)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="obs">Observation (optional)</Label>
            <Textarea id="obs" value={observation} onChange={(e) => setObservation(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>Save stage</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
