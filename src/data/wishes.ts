// ✏️ EDIT ME, Jm — this is a draft. Replace any paragraph with your own words. Sections render top to bottom.

export type NoteSection = { kind: "greeting" | "body" | "prayer" | "verse" | "signature"; text: string };

export const wishes: NoteSection[] = [
  {
    kind: "greeting",
    text: "Dear mio Mami,",
  },
  {
    kind: "body",
    text: "Today is your day, so ya kere io ase ste for you, nuay man io sen ara para kompra kuntigo gift, pero i hope this somehow made you happy..",
  },
  {
    kind: "body",
    text: "I want to let you know na maskin pakilaya io tan grow up, and komo hinde ya tan miss kung mami (maskin tan miss man, tan drama lang gat si mami), pirmi io tan appreciate todo tuyu sacrifices para kunamon.. sorry if duru io kabesa chenebes, pero sina ya gayot pag chene yatu bintata bwahahaha.. ",
  },
  {
    kind: "prayer",
    text: "Mio prayer para kuntigo is more joy, love, and peace na bida.. Ya keda io poco emotional reviewing el mga old photos, ya mira io diatun old memories, and ya pensa tamen io since de antes on how life has also been hard para kuntigo mi.. But despite that, i thank God always na itu dimio mami, and kuntigo kumigo ya dale si God.. I pray na man bless pa tamen kuntigo si God, and keda pa mas healthy and connected diatun relationship as a family in God's will mwamwa..",
  },
  {
    kind: "verse",
    text: "“The Lord blesdsd thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee: The Lord lift up his countenance upon thee, and give thee peace.” — Numbers (KJV)",
  },
  {
    kind: "signature",
    text: "Happy Birthday, Mami. I love you. From your always daw baby (Damulag) — Jm",
  },
];
