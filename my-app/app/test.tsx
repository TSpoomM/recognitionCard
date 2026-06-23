// import { createFileRoute } from "@tanstack/react-router";
// import { useState } from "react";
// import { Check, ChevronLeft, ChevronRight, Search, Sparkles, Send, Users, Award, MessageSquareHeart } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import { Toaster } from "@/components/ui/sonner";

// export const Route = createFileRoute("/")({
//     head: () => ({
//         meta: [
//             { title: "Recognition — Celebrate your teammates" },
//             { name: "description", content: "Send recognition to your teammates across five core values: Respect, Leadership, Communication, Professionalism, and Integrity." },
//             { property: "og:title", content: "Recognition" },
//             { property: "og:description", content: "Celebrate teammates across five core values." },
//         ],
//     }),
//     component: RecognitionPage,
// });

// type Person = { id: string; name: string; role: string; team: string };

// const PEOPLE: Person[] = [
//     { id: "1", name: "Somchai Prasert", role: "Product Designer", team: "Design" },
//     { id: "2", name: "Anna Wijaya", role: "Frontend Engineer", team: "Engineering" },
//     { id: "3", name: "Pim Suriyong", role: "Engineering Manager", team: "Engineering" },
//     { id: "4", name: "Krit Boonmee", role: "Data Analyst", team: "Data" },
//     { id: "5", name: "Mei Tanaka", role: "Product Manager", team: "Product" },
//     { id: "6", name: "Daranee Phorn", role: "QA Engineer", team: "Engineering" },
//     { id: "7", name: "Noah Chen", role: "Backend Engineer", team: "Engineering" },
//     { id: "8", name: "Ratchada Lim", role: "UX Researcher", team: "Design" },
//     { id: "9", name: "Sarawut Inta", role: "DevOps", team: "Engineering" },
//     { id: "10", name: "Lisa Wong", role: "Marketing Lead", team: "Marketing" },
// ];

// type TypeKey = "respect" | "leadership" | "communication" | "professionalism" | "integrity";
// const TYPES: { key: TypeKey; en: string; th: string; emoji: string; tint: string; ring: string }[] = [
//     { key: "respect", en: "RESPECT", th: "ความเคารพ", emoji: "🤝", tint: "bg-rose-50 text-rose-700", ring: "ring-rose-300" },
//     { key: "leadership", en: "LEADERSHIP", th: "ความเป็นผู้นำ", emoji: "🧭", tint: "bg-amber-50 text-amber-700", ring: "ring-amber-300" },
//     { key: "communication", en: "COMMUNICATION", th: "การสื่อสาร", emoji: "💬", tint: "bg-sky-50 text-sky-700", ring: "ring-sky-300" },
//     { key: "professionalism", en: "PROFESSIONALISM", th: "ความมืออาชีพ", emoji: "🎯", tint: "bg-violet-50 text-violet-700", ring: "ring-violet-300" },
//     { key: "integrity", en: "INTEGRITY", th: "ความซื่อสัตย์", emoji: "🛡️", tint: "bg-emerald-50 text-emerald-700", ring: "ring-emerald-300" },
// ];

// function initials(name: string) {
//     return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// function RecognitionPage() {
//     const [step, setStep] = useState<1 | 2 | 3>(1);
//     const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
//     const [selectedTypes, setSelectedTypes] = useState<TypeKey[]>([]);
//     const [comment, setComment] = useState("");
//     const [query, setQuery] = useState("");

//     const filtered = PEOPLE.filter(
//         (p) =>
//             p.name.toLowerCase().includes(query.toLowerCase()) ||
//             p.team.toLowerCase().includes(query.toLowerCase()) ||
//             p.role.toLowerCase().includes(query.toLowerCase()),
//     );

//     const togglePerson = (id: string) =>
//         setSelectedPeople((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
//     const toggleType = (k: TypeKey) =>
//         setSelectedTypes((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

//     const canNext =
//         (step === 1 && selectedPeople.length > 0) ||
//         (step === 2 && selectedTypes.length > 0) ||
//         (step === 3 && comment.trim().length >= 5);

//     const handleSubmit = () => {
//         toast.success("Recognition sent 🎉", {
//             description: `${selectedPeople.length} teammate${selectedPeople.length > 1 ? "s" : ""} · ${selectedTypes.length} value${selectedTypes.length > 1 ? "s" : ""}`,
//         });
//         setStep(1);
//         setSelectedPeople([]);
//         setSelectedTypes([]);
//         setComment("");
//     };

//     const selectedPeopleObjs = PEOPLE.filter((p) => selectedPeople.includes(p.id));
//     const selectedTypeObjs = TYPES.filter((t) => selectedTypes.includes(t.key));

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/40">
//             <Toaster richColors position="top-center" />

//             {/* Header */}
//             <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
//                 <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
//                     <div className="flex items-center gap-2">
//                         <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 text-white shadow-sm">
//                             <Sparkles className="h-4 w-4" />
//                         </div>
//                         <div>
//                             <p className="text-sm font-semibold text-slate-900">Kudos</p>
//                             <p className="text-xs text-slate-500">Recognize your teammates</p>
//                         </div>
//                     </div>
//                     <Badge variant="secondary" className="hidden sm:inline-flex">
//                         <Award className="mr-1 h-3 w-3" /> 5 core values
//                     </Badge>
//                 </div>
//             </header>

//             <main className="mx-auto max-w-3xl px-6 py-8 sm:py-12">
//                 {/* Stepper */}
//                 <Stepper step={step} />

//                 <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
//                     {step === 1 && (
//                         <div>
//                             <Header
//                                 icon={<Users className="h-5 w-5" />}
//                                 title="Choose people to recognize"
//                                 subtitle="Pick one or more teammates."
//                             />
//                             <div className="mt-5 relative">
//                                 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                                 <Input
//                                     placeholder="Search by name, team, role…"
//                                     value={query}
//                                     onChange={(e) => setQuery(e.target.value)}
//                                     className="pl-9"
//                                 />
//                             </div>

//                             {selectedPeople.length > 0 && (
//                                 <div className="mt-4 flex flex-wrap gap-2">
//                                     {selectedPeopleObjs.map((p) => (
//                                         <button
//                                             key={p.id}
//                                             onClick={() => togglePerson(p.id)}
//                                             className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-white"
//                                         >
//                                             {p.name}
//                                             <span className="opacity-60 group-hover:opacity-100">×</span>
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}

//                             <ul className="mt-5 grid gap-2 sm:grid-cols-2">
//                                 {filtered.map((p) => {
//                                     const active = selectedPeople.includes(p.id);
//                                     return (
//                                         <li key={p.id}>
//                                             <button
//                                                 onClick={() => togglePerson(p.id)}
//                                                 className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${active
//                                                         ? "border-violet-500 bg-violet-50/60 ring-2 ring-violet-200"
//                                                         : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
//                                                     }`}
//                                             >
//                                                 <Avatar className="h-10 w-10">
//                                                     <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700">
//                                                         {initials(p.name)}
//                                                     </AvatarFallback>
//                                                 </Avatar>
//                                                 <div className="min-w-0 flex-1">
//                                                     <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
//                                                     <p className="truncate text-xs text-slate-500">
//                                                         {p.role} · {p.team}
//                                                     </p>
//                                                 </div>
//                                                 <span
//                                                     className={`grid h-5 w-5 place-items-center rounded-full border ${active ? "border-violet-500 bg-violet-500 text-white" : "border-slate-300 bg-white"
//                                                         }`}
//                                                 >
//                                                     {active && <Check className="h-3 w-3" />}
//                                                 </span>
//                                             </button>
//                                         </li>
//                                     );
//                                 })}
//                                 {filtered.length === 0 && (
//                                     <li className="col-span-full py-8 text-center text-sm text-slate-500">No teammates found.</li>
//                                 )}
//                             </ul>
//                         </div>
//                     )}

//                     {step === 2 && (
//                         <div>
//                             <Header
//                                 icon={<Award className="h-5 w-5" />}
//                                 title="Choose recognition types"
//                                 subtitle="Select one or more core values that fit."
//                             />
//                             <div className="mt-5 grid gap-3 sm:grid-cols-2">
//                                 {TYPES.map((t) => {
//                                     const active = selectedTypes.includes(t.key);
//                                     return (
//                                         <button
//                                             key={t.key}
//                                             onClick={() => toggleType(t.key)}
//                                             className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition ${active
//                                                     ? `border-transparent ring-2 ${t.ring} bg-white`
//                                                     : "border-slate-200 bg-white hover:border-slate-300"
//                                                 }`}
//                                         >
//                                             <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg ${t.tint}`}>
//                                                 {t.emoji}
//                                             </div>
//                                             <div className="min-w-0 flex-1">
//                                                 <p className="text-sm font-semibold tracking-wide text-slate-900">{t.en}</p>
//                                                 <p className="mt-0.5 text-xs text-slate-500">{t.th}</p>
//                                             </div>
//                                             <span
//                                                 className={`grid h-5 w-5 place-items-center rounded-full border ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
//                                                     }`}
//                                             >
//                                                 {active && <Check className="h-3 w-3" />}
//                                             </span>
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     )}

//                     {step === 3 && (
//                         <div>
//                             <Header
//                                 icon={<MessageSquareHeart className="h-5 w-5" />}
//                                 title="Write your message"
//                                 subtitle="Be specific — call out what they did and the impact."
//                             />

//                             <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
//                                 <div className="flex flex-wrap items-center gap-2">
//                                     <span className="text-xs font-medium text-slate-500">To</span>
//                                     {selectedPeopleObjs.map((p) => (
//                                         <span key={p.id} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
//                                             {p.name}
//                                         </span>
//                                     ))}
//                                 </div>
//                                 <div className="mt-3 flex flex-wrap items-center gap-2">
//                                     <span className="text-xs font-medium text-slate-500">For</span>
//                                     {selectedTypeObjs.map((t) => (
//                                         <span key={t.key} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.tint}`}>
//                                             {t.emoji} {t.en}
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>

//                             <Textarea
//                                 value={comment}
//                                 onChange={(e) => setComment(e.target.value)}
//                                 placeholder="Thanks for stepping up during the launch — your calm communication kept the team focused…"
//                                 className="mt-4 min-h-[160px] resize-none"
//                                 maxLength={500}
//                             />
//                             <div className="mt-1 flex justify-between text-xs text-slate-400">
//                                 <span>{comment.trim().length < 5 ? "At least 5 characters." : "Looks good."}</span>
//                                 <span>{comment.length}/500</span>
//                             </div>
//                         </div>
//                     )}

//                     {/* Footer nav */}
//                     <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
//                         <Button
//                             variant="ghost"
//                             onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
//                             disabled={step === 1}
//                         >
//                             <ChevronLeft className="mr-1 h-4 w-4" /> Back
//                         </Button>

//                         <p className="hidden text-xs text-slate-500 sm:block">
//                             Step {step} of 3
//                         </p>

//                         {step < 3 ? (
//                             <Button
//                                 onClick={() => setStep((s) => ((s + 1) as 1 | 2 | 3))}
//                                 disabled={!canNext}
//                                 className="bg-slate-900 hover:bg-slate-800"
//                             >
//                                 Continue <ChevronRight className="ml-1 h-4 w-4" />
//                             </Button>
//                         ) : (
//                             <Button
//                                 onClick={handleSubmit}
//                                 disabled={!canNext}
//                                 className="bg-gradient-to-r from-violet-600 to-rose-500 hover:opacity-95"
//                             >
//                                 <Send className="mr-1.5 h-4 w-4" /> Send recognition
//                             </Button>
//                         )}
//                     </div>
//                 </section>

//                 <p className="mt-6 text-center text-xs text-slate-400">
//                     Built to celebrate the small wins. Recognize often.
//                 </p>
//             </main>
//         </div>
//     );
// }

// function Header({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
//     return (
//         <div className="flex items-start gap-3">
//             <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white">{icon}</div>
//             <div>
//                 <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
//                 <p className="text-sm text-slate-500">{subtitle}</p>
//             </div>
//         </div>
//     );
// }

// function Stepper({ step }: { step: 1 | 2 | 3 }) {
//     const labels = ["Choose people", "Choose types", "Write comment"];
//     return (
//         <ol className="flex items-center gap-2 sm:gap-4">
//             {labels.map((label, i) => {
//                 const n = (i + 1) as 1 | 2 | 3;
//                 const done = step > n;
//                 const active = step === n;
//                 return (
//                     <li key={label} className="flex flex-1 items-center gap-2">
//                         <div
//                             className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold transition ${done
//                                     ? "bg-emerald-500 text-white"
//                                     : active
//                                         ? "bg-slate-900 text-white"
//                                         : "bg-slate-200 text-slate-500"
//                                 }`}
//                         >
//                             {done ? <Check className="h-4 w-4" /> : n}
//                         </div>
//                         <span
//                             className={`hidden text-sm sm:inline ${active ? "font-medium text-slate-900" : "text-slate-500"}`}
//                         >
//                             {label}
//                         </span>
//                         {i < labels.length - 1 && (
//                             <div className={`mx-1 h-px flex-1 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
//                         )}
//                     </li>
//                 );
//             })}
//         </ol>
//     );
// }
