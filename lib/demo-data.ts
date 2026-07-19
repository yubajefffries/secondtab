// Demo dataset so the app is fully explorable before a Supabase instance is
// provisioned. Mirrors the shapes in supabase/migrations. Data matches the
// reference design so the build can be visually verified against the mockups.

export type StageKey =
  | "new_lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Stage {
  id: StageKey;
  name: string;
  color: string; // token name, e.g. "stage-1"
  probability: number;
}

export const stages: Stage[] = [
  { id: "new_lead", name: "New Lead", color: "stage-1", probability: 10 },
  { id: "qualified", name: "Qualified", color: "stage-2", probability: 30 },
  { id: "proposal", name: "Proposal", color: "stage-3", probability: 55 },
  { id: "negotiation", name: "Negotiation", color: "stage-4", probability: 75 },
  { id: "won", name: "Won", color: "stage-5", probability: 100 },
];

export interface Deal {
  id: string;
  name: string;
  company: string;
  contact: string;
  value: number;
  stage: StageKey;
  nextStep: string;
  nextStepDate: string;
  tag?: { label: string; tone: "brand" | "info" | "warning" | "success" | "neutral" | "danger" };
  owner: string;
  closedOn?: string;
}

export const deals: Deal[] = [
  { id: "d1", name: "Fleet wrap program", company: "ACME Corporation", contact: "Sarah Johnson", value: 75000, stage: "new_lead", nextStep: "Intro call", nextStepDate: "May 28", tag: { label: "New Lead", tone: "brand" }, owner: "Olivia Bennett" },
  { id: "d2", name: "Lab rebrand", company: "Brighton Labs", contact: "Michael Chen", value: 45000, stage: "new_lead", nextStep: "Discovery call", nextStepDate: "May 29", tag: { label: "Inbound", tone: "info" }, owner: "Olivia Bennett" },
  { id: "d3", name: "Office park signage", company: "Pine Valley Inc.", contact: "Emily Davis", value: 60000, stage: "new_lead", nextStep: "Send info pack", nextStepDate: "May 30", tag: { label: "Referral", tone: "info" }, owner: "Olivia Bennett" },
  { id: "d4", name: "Global rollout", company: "Global Solutions", contact: "James Miller", value: 120000, stage: "qualified", nextStep: "Needs assessment", nextStepDate: "May 27", tag: { label: "Enterprise", tone: "neutral" }, owner: "Olivia Bennett" },
  { id: "d5", name: "Summit refresh", company: "Summit Systems", contact: "Lisa Patel", value: 85000, stage: "qualified", nextStep: "Product demo", nextStepDate: "May 28", tag: { label: "Product Qualified", tone: "success" }, owner: "Olivia Bennett" },
  { id: "d6", name: "Horizon expansion", company: "Blue Horizon LLC", contact: "Daniel Kim", value: 110000, stage: "qualified", nextStep: "ROI discussion", nextStepDate: "May 30", tag: { label: "High Priority", tone: "danger" }, owner: "Olivia Bennett" },
  { id: "d7", name: "Vertex platform", company: "Vertex Technologies", contact: "Mark Thompson", value: 150000, stage: "proposal", nextStep: "Review proposal", nextStepDate: "Jun 2", tag: { label: "Enterprise", tone: "neutral" }, owner: "Olivia Bennett" },
  { id: "d8", name: "Lighthouse pilot", company: "Lighthouse Group", contact: "Rachel Green", value: 95000, stage: "proposal", nextStep: "Proposal review", nextStepDate: "Jun 3", tag: { label: "Decision Maker Engaged", tone: "info" }, owner: "Olivia Bennett" },
  { id: "d9", name: "Nexus integration", company: "Nexus Industries", contact: "Tom Anderson", value: 130000, stage: "proposal", nextStep: "Contract review", nextStepDate: "Jun 4", tag: { label: "Strategic", tone: "neutral" }, owner: "Olivia Bennett" },
  { id: "d10", name: "Quantum contract", company: "Quantum Corp.", contact: "Kevin Wright", value: 125000, stage: "negotiation", nextStep: "Negotiate terms", nextStepDate: "Jun 5", tag: { label: "High Priority", tone: "danger" }, owner: "Olivia Bennett" },
  { id: "d11", name: "Silverline renewal", company: "Silverline Software", contact: "Amanda Lee", value: 80000, stage: "negotiation", nextStep: "Discount approval", nextStepDate: "Jun 6", tag: { label: "Pricing Discussion", tone: "neutral" }, owner: "Olivia Bennett" },
  { id: "d12", name: "Titan analytics", company: "Titan Analytics", contact: "Brian Wilson", value: 95000, stage: "negotiation", nextStep: "Executive review", nextStepDate: "Jun 7", tag: { label: "Executive Sponsor", tone: "neutral" }, owner: "Olivia Bennett" },
  { id: "d13", name: "Marble storefronts", company: "Marble Group", contact: "Stephanie Rogers", value: 75000, stage: "won", nextStep: "", nextStepDate: "", tag: { label: "New Customer", tone: "success" }, owner: "Olivia Bennett", closedOn: "May 22, 2025" },
  { id: "d14", name: "Coastal campaign", company: "Coastal Media", contact: "Travis Jordan", value: 60000, stage: "won", nextStep: "", nextStepDate: "", tag: { label: "Upsell", tone: "brand" }, owner: "Olivia Bennett", closedOn: "May 21, 2025" },
  { id: "d15", name: "Atlas partnership", company: "Atlas Partners", contact: "Jeff Baker", value: 85000, stage: "won", nextStep: "", nextStepDate: "", tag: { label: "Expansion", tone: "info" }, owner: "Olivia Bennett", closedOn: "May 19, 2025" },
];

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  company: string;
  owner: string;
  lastActivity: string;
  tags: string[];
}

export const people: Person[] = [
  { id: "p1", name: "Sarah Johnson", email: "sarah@acmecorp.com", phone: "(555) 201-4432", title: "Operations Director", company: "ACME Corporation", owner: "Olivia Bennett", lastActivity: "Today", tags: ["Customer"] },
  { id: "p2", name: "James Miller", email: "james@globalsolutions.com", phone: "(555) 318-2201", title: "VP Marketing", company: "Global Solutions", owner: "Olivia Bennett", lastActivity: "Yesterday", tags: ["Prospect"] },
  { id: "p3", name: "Michael Chen", email: "mchen@brightonlabs.io", phone: "(555) 442-9911", title: "Founder", company: "Brighton Labs", owner: "Olivia Bennett", lastActivity: "2 days ago", tags: ["Prospect", "Inbound"] },
  { id: "p4", name: "Emily Davis", email: "emily.davis@pinevalley.com", phone: "(555) 210-7788", title: "Facilities Manager", company: "Pine Valley Inc.", owner: "Olivia Bennett", lastActivity: "3 days ago", tags: ["Prospect"] },
  { id: "p5", name: "Mark Thompson", email: "mark@vertextech.com", phone: "(555) 604-1120", title: "CTO", company: "Vertex Technologies", owner: "Olivia Bennett", lastActivity: "This week", tags: ["Enterprise"] },
  { id: "p6", name: "Rachel Green", email: "rachel@lighthousegroup.co", phone: "(555) 771-3345", title: "Program Lead", company: "Lighthouse Group", owner: "Olivia Bennett", lastActivity: "This week", tags: ["Prospect"] },
  { id: "p7", name: "Kevin Wright", email: "kevin@quantumcorp.com", phone: "(555) 090-5566", title: "Procurement", company: "Quantum Corp.", owner: "Olivia Bennett", lastActivity: "Last week", tags: ["Negotiation"] },
  { id: "p8", name: "Stephanie Rogers", email: "steph@marblegroup.com", phone: "(555) 415-8890", title: "Owner", company: "Marble Group", owner: "Olivia Bennett", lastActivity: "May 22", tags: ["Customer"] },
];

export interface Company {
  id: string;
  name: string;
  industry: string;
  domain: string;
  phone: string;
  owner: string;
  openDeals: number;
  totalValue: number;
  people: number;
  status: "Customer" | "Prospect" | "Partner";
}

export const companies: Company[] = [
  { id: "c1", name: "ACME Corporation", industry: "Manufacturing", domain: "acmecorp.com", phone: "(555) 201-4400", owner: "Olivia Bennett", openDeals: 1, totalValue: 75000, people: 3, status: "Prospect" },
  { id: "c2", name: "Bright Homes", industry: "Realty & Construction", domain: "brighthomes.com", phone: "(555) 300-1200", owner: "Olivia Bennett", openDeals: 1, totalValue: 94500, people: 2, status: "Prospect" },
  { id: "c3", name: "Global Solutions", industry: "Consulting", domain: "globalsolutions.com", phone: "(555) 318-2200", owner: "Olivia Bennett", openDeals: 1, totalValue: 120000, people: 4, status: "Prospect" },
  { id: "c4", name: "Vertex Technologies", industry: "Software", domain: "vertextech.com", phone: "(555) 604-1100", owner: "Olivia Bennett", openDeals: 1, totalValue: 150000, people: 2, status: "Prospect" },
  { id: "c5", name: "Quantum Corp.", industry: "Logistics", domain: "quantumcorp.com", phone: "(555) 090-5500", owner: "Olivia Bennett", openDeals: 1, totalValue: 125000, people: 2, status: "Customer" },
  { id: "c6", name: "Marble Group", industry: "Retail", domain: "marblegroup.com", phone: "(555) 415-8800", owner: "Olivia Bennett", openDeals: 0, totalValue: 75000, people: 1, status: "Customer" },
  { id: "c7", name: "Coastal Media", industry: "Media", domain: "coastalmedia.co", phone: "(555) 233-9090", owner: "Olivia Bennett", openDeals: 0, totalValue: 60000, people: 1, status: "Customer" },
];

export interface TaskItem {
  id: string;
  title: string;
  relatedTo: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  status: "open" | "completed";
  assignee: string;
}

export const tasks: TaskItem[] = [
  { id: "t1", title: "Follow up with James", relatedTo: "Bright Homes", due: "Today", priority: "High", status: "open", assignee: "Olivia Bennett" },
  { id: "t2", title: "Send proposal", relatedTo: "ACME Landscaping", due: "Tomorrow", priority: "Medium", status: "open", assignee: "Olivia Bennett" },
  { id: "t3", title: "Prepare for discovery call", relatedTo: "Greenfield Plumbing", due: "May 23", priority: "Medium", status: "open", assignee: "Olivia Bennett" },
  { id: "t4", title: "Review contract", relatedTo: "Oakwood Construction", due: "May 24", priority: "Low", status: "open", assignee: "Olivia Bennett" },
  { id: "t5", title: "Check in with Sarah", relatedTo: "Sarah Johnson", due: "May 26", priority: "Low", status: "open", assignee: "Olivia Bennett" },
  { id: "t6", title: "Log wrap install photos", relatedTo: "Marble Group", due: "May 27", priority: "Medium", status: "open", assignee: "Olivia Bennett" },
  { id: "t7", title: "Update QuickBooks mapping", relatedTo: "Settings", due: "May 28", priority: "Low", status: "completed", assignee: "Olivia Bennett" },
];

export interface ActivityItem {
  id: string;
  type: "lead" | "deal" | "email" | "task" | "meeting";
  title: string;
  subtitle: string;
  time: string;
}

export const recentActivity: ActivityItem[] = [
  { id: "a1", type: "lead", title: "New lead created", subtitle: "Sarah Johnson", time: "10:24 AM" },
  { id: "a2", type: "deal", title: "Deal moved to Proposal", subtitle: "ACME Landscaping", time: "9:15 AM" },
  { id: "a3", type: "email", title: "Email opened", subtitle: "Proposal Follow-up", time: "8:42 AM" },
  { id: "a4", type: "task", title: "Task completed", subtitle: "Follow up with James", time: "Yesterday" },
  { id: "a5", type: "meeting", title: "Meeting scheduled", subtitle: "Discovery Call with Bright Homes", time: "Yesterday" },
];

export interface Integration {
  name: string;
  status: "Healthy" | "Warning" | "Error";
  lastSync: string;
}

export const integrations: Integration[] = [
  { name: "Google Workspace", status: "Healthy", lastSync: "Synced just now" },
  { name: "Outlook Calendar", status: "Healthy", lastSync: "Synced 2m ago" },
  { name: "QuickBooks Online", status: "Warning", lastSync: "Last synced 1h ago" },
  { name: "Mailchimp", status: "Healthy", lastSync: "Synced 5m ago" },
  { name: "Twilio", status: "Healthy", lastSync: "Synced just now" },
];

export const kpis = [
  { label: "New Leads", value: "28", delta: "16% vs last week", direction: "up" as const, tone: "brand" as const },
  { label: "Open Deals", value: "42", delta: "8% vs last week", direction: "up" as const, tone: "success" as const },
  { label: "Revenue This Month", value: "$48,650", delta: "21% vs last month", direction: "up" as const, tone: "accent" as const },
  { label: "Overdue Tasks", value: "7", delta: "12% vs last week", direction: "down" as const, tone: "warning" as const },
  { label: "Pending Approvals", value: "3", delta: "No change", direction: "flat" as const, tone: "neutral" as const },
];

export const sparklines: Record<string, number[]> = {
  "New Leads": [4, 6, 5, 8, 7, 9, 8, 11, 10, 12],
  "Open Deals": [30, 32, 31, 35, 34, 38, 37, 40, 41, 42],
  "Revenue This Month": [20, 24, 22, 28, 26, 32, 30, 38, 42, 48],
  "Overdue Tasks": [10, 9, 11, 8, 9, 7, 8, 6, 7, 7],
  "Pending Approvals": [3, 3, 4, 3, 3, 2, 3, 3, 3, 3],
};

export const currentUser = {
  name: "Olivia Bennett",
  org: "Bennett Services",
  email: "olivia@bennettservices.com",
  role: "owner",
};

export function dealsByStage(stage: StageKey) {
  return deals.filter((d) => d.stage === stage);
}

export function stageTotal(stage: StageKey) {
  return dealsByStage(stage).reduce((sum, d) => sum + d.value, 0);
}
