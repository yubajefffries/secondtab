"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemoStore } from "@/lib/demo-store";

export function NewContactDialog() {
  const { newContactOpen, setNewContactOpen, addPerson } = useDemoStore();
  const router = useRouter();
  const pathname = usePathname();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addPerson({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      title: String(data.get("title") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      tags: ["Prospect"],
    });
    setNewContactOpen(false);
    if (pathname !== "/contacts") router.push("/contacts");
  }

  return (
    <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
      <DialogContent>
        <DialogTitle>New contact</DialogTitle>
        <DialogDescription>
          Add a person to your contacts. Only a name is required — fill in the rest as you
          learn it.
        </DialogDescription>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nc-name" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <Input id="nc-name" name="name" placeholder="Jordan Rivera" required autoFocus />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="nc-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <Input id="nc-email" name="email" type="email" placeholder="jordan@company.com" />
            </div>
            <div>
              <label htmlFor="nc-phone" className="mb-1.5 block text-sm font-medium">
                Phone
              </label>
              <Input id="nc-phone" name="phone" type="tel" placeholder="(555) 000-0000" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="nc-title" className="mb-1.5 block text-sm font-medium">
                Job title
              </label>
              <Input id="nc-title" name="title" placeholder="Owner" />
            </div>
            <div>
              <label htmlFor="nc-company" className="mb-1.5 block text-sm font-medium">
                Company
              </label>
              <Input id="nc-company" name="company" placeholder="Company name" />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setNewContactOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
