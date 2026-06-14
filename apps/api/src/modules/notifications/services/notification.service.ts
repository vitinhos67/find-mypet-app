import { getFirebaseMessaging } from "../../../shared/firebase/firebaseAdmin";
import { supabaseAdmin } from "../../../shared/supabase/supabaseAdmin";

export class NotificationService {
  async notifyOutsideSafeZone(
    petId: string,
    ownerId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    const [petResult, sharesResult] = await Promise.all([
      supabaseAdmin.from("pets").select("name").eq("id", petId).maybeSingle(),
      supabaseAdmin
        .from("pet_shares")
        .select("shared_with_user_id")
        .eq("pet_id", petId),
    ]);

    const petName = petResult.data?.name ?? "Seu pet";

    const sharedUserIds = (sharesResult.data ?? []).map((r) => r.shared_with_user_id);
    const allUserIds = Array.from(new Set([ownerId, ...sharedUserIds]));

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .in("id", allUserIds)
      .not("fcm_token", "is", null);

    const tokens = (profiles ?? [])
      .map((p) => p.fcm_token as string)
      .filter(Boolean);

    if (tokens.length === 0) return;

    try {
      const response = await getFirebaseMessaging().sendEachForMulticast({
        tokens,
        notification: {
          title: `🚨 ${petName} saiu da zona segura!`,
          body: "Seu pet foi detectado fora da área segura. Verifique agora.",
        },
        data: {
          petId,
          type: "OUTSIDE_SAFE_ZONE",
          latitude: String(latitude),
          longitude: String(longitude),
        },
        android: {
          priority: "high",
          notification: { channelId: "safezone_alerts" },
        },
        apns: {
          payload: { aps: { sound: "default", badge: 1 } },
        },
      });

      const failed = response.responses.filter((r) => !r.success).length;
      if (failed > 0) {
        console.warn(`[NotificationService] ${failed}/${tokens.length} tokens falharam no envio.`);
      }
    } catch (err) {
      console.error("[NotificationService] Erro ao enviar FCM:", err);
    }
  }
}
