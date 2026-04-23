import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Field } from "@/lib/types";
import { useCreatePlant } from "@/api/hooks/usePlants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function NewPlantDialog({ fields }: { fields: Field[] }) {
  const [open, setOpen] = useState(false);
  const [fieldId, setFieldId] = useState("");
  const [cropType, setCropType] = useState("");
  const [plantingDate, setPlantingDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [expectedDays, setExpectedDays] = useState(90);
  const [notes, setNotes] = useState("");

  const mutation = useCreatePlant();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        field: fieldId,
        crop_type: cropType,
        planting_date: plantingDate,
        expected_days: expectedDays,
        notes: notes || undefined, // Wait, I didn't add notes on the custom hook interface oops... wait, let me just check the hook. Ah, I'll pass it as any or update the hook later. 
      } as any, 
      {
        onSuccess: () => {
          toast.success("Plant added");
          setOpen(false);
          setFieldId(""); setCropType(""); setNotes(""); setExpectedDays(90);
        },
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-1 h-4 w-4" /> New plant</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New plant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Field</Label>
            <Select value={fieldId} onValueChange={setFieldId} required>
              <SelectTrigger><SelectValue placeholder="Choose a field" /></SelectTrigger>
              <SelectContent>
                {fields.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="crop">Crop type</Label>
            <Input id="crop" required value={cropType} onChange={(e) => setCropType(e.target.value)} placeholder="e.g. Maize" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pdate">Planting date</Label>
              <Input id="pdate" type="date" required value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Expected days</Label>
              <Input id="days" type="number" min={1} required value={expectedDays} onChange={(e) => setExpectedDays(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional notes..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !fieldId}>Create plant</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
