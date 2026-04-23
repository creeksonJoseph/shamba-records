import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateField } from "@/api/hooks/useFields";
import { useUsers } from "@/api/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function NewFieldDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [agentId, setAgentId] = useState<string>("");

  const { data: users } = useUsers();

  const agents = useMemo(() => users?.filter((u) => u.role === "agent") ?? [], [users]);

  const mutation = useCreateField();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      { name, location, assigned_agent: agentId },
      {
        onSuccess: () => {
          toast.success("Field created");
          setOpen(false);
          setName("");
          setLocation("");
          setAgentId("");
        },
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> New field
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New field</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">Location</Label>
            <Input
              id="loc"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Village, region"
            />
          </div>
          <div className="space-y-2">
            <Label>Assigned agent</Label>
            <Select value={agentId} onValueChange={setAgentId} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} — {a.email}
                  </SelectItem>
                ))}
                {agents.length === 0 && (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No agents yet. Add one from Users.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !agentId}>
              Create field
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
