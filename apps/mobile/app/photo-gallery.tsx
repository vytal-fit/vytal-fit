import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Plus } from "lucide-react-native";

import { useTheme } from "./_layout";
import type { Colors } from "@/colors";
import { t } from "@/i18n";
import { listMedia, type MediaAssetItem } from "@/lib/auth-api";

type GalleryImage = { id: string; url: string; date: string };

export default function PhotoGalleryScreen() {
  const C = useTheme();
  const styles = makeStyles(C);
  const router = useRouter();
  const [photos, setPhotos] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    void listMedia()
      .then((assets: MediaAssetItem[]) => {
        if (cancelled) return;
        const images = assets
          .filter((asset) => asset.type === "image" && Boolean(asset.url))
          .map<GalleryImage>((asset) => ({
            id: asset.id,
            url: asset.url as string,
            date:
              typeof asset.createdAt === "string"
                ? asset.createdAt.slice(0, 10)
                : asset.createdAt instanceof Date
                  ? asset.createdAt.toISOString().slice(0, 10)
                  : "",
          }));
        setPhotos(images);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={C.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("photoGallery.title")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={C.green} />
            </View>
          ) : loadError ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>{t("alert.error")}</Text>
            </View>
          ) : photos.length === 0 ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>{t("common.empty")}</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <View style={styles.photoPlaceholder}>
                    {photo.url ? (
                      <Image
                        source={{ uri: photo.url }}
                        style={styles.photoImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Camera size={28} color={C.muted} strokeWidth={1.5} />
                    )}
                  </View>
                  {Boolean(photo.date) && <Text style={styles.photoDate}>{photo.date}</Text>}
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="#080c0a" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>{t("photoGallery.addPhoto")}</Text>
          </TouchableOpacity>

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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  grid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20,
  },
  photoCard: {
    width: "48%",
  },
  photoPlaceholder: {
    aspectRatio: 1, borderRadius: 14, backgroundColor: C.surface2,
    borderWidth: 1, borderColor: C.border, alignItems: "center",
    justifyContent: "center", overflow: "hidden",
  },
  photoImage: {
    width: "100%", height: "100%",
  },
  stateBox: {
    alignItems: "center", justifyContent: "center", paddingVertical: 48,
    marginBottom: 20,
  },
  stateText: {
    fontSize: 14, color: C.muted, textAlign: "center",
  },
  photoDate: {
    fontSize: 11, color: C.muted, fontWeight: "600", marginTop: 6,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: C.green, borderRadius: 14, paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 15, fontWeight: "800", color: "#080c0a", letterSpacing: 1,
  },
}); }
