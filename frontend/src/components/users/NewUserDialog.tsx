import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/lib/api";
import { useCreateUser } from "@/api/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function NewUserDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("agent");

  const mutation = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      { name, email, password, role },
      {
        onSuccess: () => {
          toast.success("User created");
          setOpen(false);
          setName(""); setEmail(""); setPassword(""); setRole("agent");
        },
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-1 h-4 w-4" /> Add user</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add user</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="uname">Name</Label>
            <Input id="uname" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uemail">Email</Label>
            <Input id="uemail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upw">Temporary password</Label>
            <Input id="upw" type="text" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>Create user</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
