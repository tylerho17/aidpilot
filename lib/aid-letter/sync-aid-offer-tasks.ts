import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AID_OFFER_TASK_SOURCE,
  aidOfferTaskPrefix,
  buildRecommendedAidOfferTasks,
} from "@/lib/aid-letter/buildAidHealthReport";
import { buildScholarshipGapTasks } from "@/lib/aid-letter/buildScholarshipGapPlan";
import { calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import { isAidTaskComplete } from "@/lib/data-helpers";
import type { UserAidOffer } from "@/lib/types";

export async function syncAidOfferTasks(
  supabase: SupabaseClient,
  userId: string,
  offer: UserAidOffer
): Promise<void> {
  const calc = calculateAidOfferFromRecord(offer);
  const recommended = [
    ...buildRecommendedAidOfferTasks(offer, calc),
    ...buildScholarshipGapTasks(offer, calc),
  ];
  const recommendedKeys = new Set(recommended.map((task) => task.plan_key));
  const prefix = aidOfferTaskPrefix(offer.id);
  const now = new Date().toISOString();

  const { data: existing, error: loadError } = await supabase
    .from("aid_tasks")
    .select("id, plan_key, status")
    .eq("user_id", userId)
    .eq("task_source", AID_OFFER_TASK_SOURCE)
    .like("plan_key", `${prefix}%`);

  if (loadError) throw loadError;

  for (const task of existing ?? []) {
    if (!task.plan_key || recommendedKeys.has(task.plan_key) || isAidTaskComplete(task.status)) {
      continue;
    }

    const { error } = await supabase
      .from("aid_tasks")
      .update({ status: "Complete", updated_at: now })
      .eq("id", task.id)
      .eq("user_id", userId);

    if (error) throw error;
  }

  for (const task of recommended) {
    const { data: row } = await supabase
      .from("aid_tasks")
      .select("id, status")
      .eq("user_id", userId)
      .eq("plan_key", task.plan_key)
      .maybeSingle();

    const payload = {
      user_id: userId,
      plan_key: task.plan_key,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category,
      task_source: AID_OFFER_TASK_SOURCE,
      action_url: task.action_url,
      updated_at: now,
    };

    if (row?.id) {
      const updatePayload = isAidTaskComplete(row.status)
        ? {
            title: payload.title,
            description: payload.description,
            priority: payload.priority,
            category: payload.category,
            action_url: payload.action_url,
            updated_at: now,
          }
        : payload;

      const { error } = await supabase.from("aid_tasks").update(updatePayload).eq("id", row.id).eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("aid_tasks").insert(payload);
      if (error) throw error;
    }
  }
}

export async function completeAidOfferTasks(supabase: SupabaseClient, userId: string, offerId: string): Promise<void> {
  const prefix = aidOfferTaskPrefix(offerId);
  const now = new Date().toISOString();

  const { data: existing, error: loadError } = await supabase
    .from("aid_tasks")
    .select("id, status")
    .eq("user_id", userId)
    .eq("task_source", AID_OFFER_TASK_SOURCE)
    .like("plan_key", `${prefix}%`);

  if (loadError) throw loadError;

  for (const task of existing ?? []) {
    if (isAidTaskComplete(task.status)) continue;

    const { error } = await supabase
      .from("aid_tasks")
      .update({ status: "Complete", updated_at: now })
      .eq("id", task.id)
      .eq("user_id", userId);

    if (error) throw error;
  }
}
