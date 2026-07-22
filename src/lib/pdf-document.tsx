import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import path from "path";
import { Block, isRtl } from "./blocks";

// Register a Latin+Hebrew font (Rubik, OFL) from the bundled file.
Font.register({
  family: "Rubik",
  src: path.join(process.cwd(), "public/fonts/Rubik-Regular.ttf"),
});
// Avoid hyphenation splitting mid-word.
Font.registerHyphenationCallback((word) => [word]);

const INK = "#0C1218";
const INDIGO = "#4D54F5";
const LIME = "#C7E402";
const MUTED = "#6B7280";
const BORDER = "#E6E3E3";

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48, fontFamily: "Rubik", fontSize: 10, color: INK },
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: INK },
  brand: { fontSize: 16, color: INK },
  brandSub: { fontSize: 8, color: MUTED, marginTop: 2 },
  meta: { textAlign: "right", fontSize: 9, color: MUTED },
  title: { fontSize: 20, marginBottom: 4 },
  subtitle: { fontSize: 10, color: MUTED, marginBottom: 18 },
  h3: { fontSize: 13, color: INK, marginTop: 12, marginBottom: 4 },
  p: { fontSize: 10, lineHeight: 1.5, marginBottom: 6, color: "#222" },
  li: { fontSize: 10, lineHeight: 1.5, marginBottom: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 10 },
  sigBox: { marginTop: 16, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10 },
  sigRow: { flexDirection: "row", gap: 40, marginTop: 20, color: MUTED },
  table: { marginTop: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  trHead: { flexDirection: "row", backgroundColor: "#F8F6F6", borderBottomWidth: 1, borderBottomColor: BORDER },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  th: { fontSize: 8, color: MUTED, padding: 6 },
  td: { fontSize: 9, padding: 6 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  totalLabel: { fontSize: 9, color: MUTED, marginRight: 12, alignSelf: "center" },
  totalVal: { fontSize: 15, color: INDIGO },
  accent: { height: 3, backgroundColor: LIME, width: 60, marginBottom: 16 },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: MUTED, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
});

function money(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${Math.round(n)}`;
  }
}

export type PdfData = {
  proposalNumber: string;
  title: string;
  version: number;
  company: string;
  currency: string;
  blocks: Block[];
  lineItems: { product: string; description: string | null; quantity: number; unitPrice: number; discountPct: number; vatPct: number; isOptional: boolean }[];
  signatures?: { signerName: string; signerRole: string | null; signerEmail: string; signedAt: string; ipAddress: string | null }[];
};

function lineTotal(it: PdfData["lineItems"][number]) {
  const base = it.quantity * it.unitPrice;
  return base * (1 - it.discountPct / 100) * (1 + it.vatPct / 100);
}

export function ProposalPdf({ data }: { data: PdfData }) {
  const grand = data.lineItems.filter((i) => !i.isOptional).reduce((sm, i) => sm + lineTotal(i), 0);

  return (
    <Document title={`${data.proposalNumber} — ${data.title}`}>
      <Page size="A4" style={s.page}>
        <View style={s.headerBar} fixed>
          <View>
            <Text style={s.brand}>ArchiTech</Text>
            <Text style={s.brandSub}>Think Deep. Implement Smart.</Text>
          </View>
          <View>
            <Text style={s.meta}>{data.proposalNumber} · V{data.version}</Text>
            <Text style={s.meta}>{data.company}</Text>
          </View>
        </View>

        <View style={s.accent} />
        <Text style={s.title}>{data.title}</Text>
        <Text style={s.subtitle}>Prepared for {data.company}</Text>

        {data.blocks.map((b) => {
          const align = (b.dir ?? (isRtl(b.text) ? "rtl" : "ltr")) === "rtl" ? "right" : "left";
          switch (b.type) {
            case "heading":
              return <Text key={b.id} style={[s.h3, { textAlign: align }]}>{b.text}</Text>;
            case "paragraph":
              return <Text key={b.id} style={[s.p, { textAlign: align }]}>{b.text}</Text>;
            case "bulleted-list":
              return (
                <View key={b.id}>
                  {(b.text ?? "").split("\n").filter(Boolean).map((line, i) => (
                    <Text key={i} style={[s.li, { textAlign: align }]}>•  {line}</Text>
                  ))}
                </View>
              );
            case "divider":
              return <View key={b.id} style={s.divider} />;
            case "signature":
              return (
                <View key={b.id} style={s.sigBox}>
                  <Text style={{ fontSize: 11 }}>{b.text || "Signature"}</Text>
                  <View style={s.sigRow}>
                    <Text>Name: ______________</Text>
                    <Text>Date: ______________</Text>
                  </View>
                </View>
              );
            default:
              return null;
          }
        })}

        {data.lineItems.length > 0 && (
          <View wrap={false}>
            <Text style={s.h3}>Pricing</Text>
            <View style={s.table}>
              <View style={s.trHead}>
                <Text style={[s.th, { flex: 2 }]}>Product</Text>
                <Text style={[s.th, { flex: 3 }]}>Description</Text>
                <Text style={[s.th, { flex: 1, textAlign: "right" }]}>Qty</Text>
                <Text style={[s.th, { flex: 1.5, textAlign: "right" }]}>Unit</Text>
                <Text style={[s.th, { flex: 1.5, textAlign: "right" }]}>Total</Text>
              </View>
              {data.lineItems.map((it, i) => (
                <View style={s.tr} key={i}>
                  <Text style={[s.td, { flex: 2 }]}>{it.product}</Text>
                  <Text style={[s.td, { flex: 3, color: MUTED }]}>{it.description ?? "—"}</Text>
                  <Text style={[s.td, { flex: 1, textAlign: "right" }]}>{it.quantity}</Text>
                  <Text style={[s.td, { flex: 1.5, textAlign: "right" }]}>{money(it.unitPrice, data.currency)}</Text>
                  <Text style={[s.td, { flex: 1.5, textAlign: "right" }]}>{money(lineTotal(it), data.currency)}</Text>
                </View>
              ))}
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total (incl. VAT)</Text>
              <Text style={s.totalVal}>{money(grand, data.currency)}</Text>
            </View>
          </View>
        )}

        {data.signatures && data.signatures.length > 0 && (
          <View style={s.sigBox} wrap={false}>
            <Text style={{ fontSize: 11, marginBottom: 6 }}>Signed</Text>
            {data.signatures.map((sg, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 10 }}>{sg.signerName}{sg.signerRole ? ` · ${sg.signerRole}` : ""}</Text>
                <Text style={{ fontSize: 8, color: MUTED }}>{sg.signerEmail} · {sg.signedAt} · IP {sg.ipAddress ?? "—"}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.footer} fixed>
          <Text>{data.proposalNumber}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
