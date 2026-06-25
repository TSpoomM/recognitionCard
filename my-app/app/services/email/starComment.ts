export type StarSection = {
  label: "S" | "T" | "A" | "R";
  title: string;
  text: string;
};

export class StarCommentParser {
  static parse(comment: string): StarSection[] {
    const sections: StarSection[] = [
      { label: "S", title: "Situation", text: "" },
      { label: "T", title: "Task", text: "" },
      { label: "A", title: "Action", text: "" },
      { label: "R", title: "Result", text: "" },
    ];
    const sectionByLabel = new Map(sections.map((section) => [section.label, section]));
    const matches = Array.from(comment.matchAll(/(^|\s)(S|T|A|R)\s*[:\-]\s*/gi));

    if (matches.length === 0) return [];

    matches.forEach((match, index) => {
      const label = match[2].toUpperCase() as StarSection["label"];
      const section = sectionByLabel.get(label);

      if (!section || match.index === undefined) return;

      const textStart = match.index + match[0].length;
      const nextMatchIndex = matches[index + 1]?.index ?? comment.length;
      section.text = comment.slice(textStart, nextMatchIndex).trim();
    });

    return sections.filter((section) => section.text);
  }
}
