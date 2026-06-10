import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText, File, Shield } from "lucide-react-native";

import { useTheme } from "./_layout";
import type { Colors } from "@/colors";

type DocStatus = "signed" | "pending";
type DocIcon = "pdf" | "contract" | "waiver";

const documents = [
  { id: "d-1", name: "Contrato de Adesao", icon: "contract" as DocIcon, date: "2024-01-15", status: "signed" as DocStatus },
  { id: "d-2", name: "Regulamento Interno", icon: "pdf" as DocIcon, date: "2024-01-15", status: "signed" as DocStatus },
  { id: "d-3", name: "Declaracao PAR-Q", icon: "waiver" as DocIcon, date: "2024-01-15", status: "signed" as DocStatus },
  { id: "d-4", name: "Termo de Responsabilidade", icon: "waiver" as DocIcon, date: "2026-01-01", status: "signed" as DocStatus },
  { id: "d-5", name: "Atualizacao de Dados 2026", icon: "pdf" as DocIcon, date: "2026-06-01", status: "pending" as DocStatus },
];

function getIcon(type: DocIcon, C: Colors) {
  switch (type) {
    case "pdf": return <FileText size={22} color={C.red} strokeWidth={2} />;
    case "contract": return <File size={22} color={C.blue} strokeWidth={2} />;
    case "waiver": return <Shield size={22} color={C.amber} strokeWidth={2} />;
  }
}

export default function DossierViewerScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Documentos</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {documents.map((doc) => (
            <TouchableOpacity key={doc.id} style={styles.docCard}>
              <View style={styles.iconBox}>
                {getIcon(doc.icon, C)}
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docDate}>{doc.date}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                doc.status === "signed"
                  ? { backgroundColor: C.green + "18" }
                  : { backgroundColor: C.amber + "18" },
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: doc.status === "signed" ? C.green : C.amber },
                ]}>
                  {doc.status === "signed" ? "Assinado" : "Pendente"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(C: Colors) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.text },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  docCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 16,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.surface2,
    alignItems: "center", justifyContent: "center",
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 15, fontWeight: "700", color: C.text },
  docDate: { fontSize: 12, color: C.muted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
}); }
