// Shared block model for proposal content. Stored as JSON in Proposal.contentJson.

export type BlockType =
  | "heading"
  | "paragraph"
  | "bulleted-list"
  | "divider"
  | "image"
  | "signature";

export type Block = {
  id: string;
  type: BlockType;
  // heading/paragraph: text; bulleted-list: newline-separated items; image: url; signature: label
  text?: string;
  url?: string;
  dir?: "ltr" | "rtl";
};

export type ProposalContent = { blocks: Block[] };

export const EMPTY_CONTENT: ProposalContent = { blocks: [] };

export function isRtl(text = "") {
  // Any Hebrew/Arabic character → treat block as RTL.
  return /[֐-׿؀-ۿ]/.test(text);
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  "bulleted-list": "Bulleted list",
  divider: "Divider",
  image: "Image",
  signature: "Signature section",
};
