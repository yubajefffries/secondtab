"use client";

import * as React from "react";
import { people as seedPeople, type Person } from "@/lib/demo-data";

// Session-scoped mutable layer over the static demo dataset. Pages read
// through this store so demo interactions (creating a contact) are visible
// everywhere in the app. Replaced by live Supabase queries in Phase 1 wiring.
interface DemoStore {
  people: Person[];
  addPerson: (person: Omit<Person, "id" | "owner" | "lastActivity">) => Person;
  newContactOpen: boolean;
  setNewContactOpen: (open: boolean) => void;
}

const DemoStoreContext = React.createContext<DemoStore | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = React.useState<Person[]>(seedPeople);
  const [newContactOpen, setNewContactOpen] = React.useState(false);

  const addPerson = React.useCallback(
    (person: Omit<Person, "id" | "owner" | "lastActivity">) => {
      const created: Person = {
        ...person,
        id: `p-new-${Date.now()}`,
        owner: "Olivia Bennett",
        lastActivity: "Just now",
      };
      setPeople((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const value = React.useMemo(
    () => ({ people, addPerson, newContactOpen, setNewContactOpen }),
    [people, addPerson, newContactOpen]
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const ctx = React.useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return ctx;
}
