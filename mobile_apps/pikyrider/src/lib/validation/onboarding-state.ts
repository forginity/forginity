import type { UserProfileSummary } from "../../types/auth-api.types";

export type UiGenderOption = "man" | "woman" | "nonbinary" | "prefer_not_to_say";
export type BackendGenderOption = "male" | "female" | "other" | "prefer_not_to_say";

export const DEFAULT_ONBOARDING_GENDER: UiGenderOption = "man";

export interface OnboardingProfileDraft {
  firstName: string;
  lastName: string;
  userName: string;
  isUsernameVerified: boolean;
}

export const EMPTY_PROFILE_DRAFT: OnboardingProfileDraft = {
  firstName: "",
  lastName: "",
  userName: "",
  isUsernameVerified: false,
};

export function mapGenderToBackend(val: string): BackendGenderOption {
  if (val === "woman" || val === "female") return "female";
  if (val === "man" || val === "male") return "male";
  if (val === "prefer_not_to_say") return "prefer_not_to_say";
  return "other";
}

export function normalizeGenderForUi(val?: string | null): UiGenderOption | null {
  if (!val) return null;
  const normalized = val.trim().toLowerCase();
  if (normalized === "man" || normalized === "male") return "man";
  if (normalized === "woman" || normalized === "female") return "woman";
  if (normalized === "nonbinary" || normalized === "other") return "nonbinary";
  if (normalized === "prefer_not_to_say") return "prefer_not_to_say";
  return null;
}

export interface HydratedUserDraft {
  profile: OnboardingProfileDraft;
  gender: UiGenderOption;
  countryCode: string | null;
}

export function resolveHydratedUserState(
  incomingUser: UserProfileSummary,
  previous: {
    userId: string | null;
    profile: OnboardingProfileDraft;
    gender: string;
    countryCode: string | null;
  }
): HydratedUserDraft {
  const isSameUser =
    previous.userId !== null && previous.userId === incomingUser.id;
  const fallbackProfile = isSameUser ? previous.profile : EMPTY_PROFILE_DRAFT;
  const fallbackGender = isSameUser
    ? normalizeGenderForUi(previous.gender) ?? DEFAULT_ONBOARDING_GENDER
    : DEFAULT_ONBOARDING_GENDER;
  const fallbackCountryCode = isSameUser ? previous.countryCode : null;

  const nameParts = incomingUser.name
    ? incomingUser.name.trim().split(/\s+/)
    : [];
  const firstName =
    incomingUser.firstName ||
    nameParts[0] ||
    fallbackProfile.firstName;
  const lastName =
    incomingUser.lastName ||
    (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "") ||
    fallbackProfile.lastName;
  const userName = incomingUser.username ?? fallbackProfile.userName;
  const isUsernameVerified = incomingUser.username
    ? true
    : fallbackProfile.isUsernameVerified;

  return {
    profile: {
      firstName,
      lastName,
      userName,
      isUsernameVerified,
    },
    gender: normalizeGenderForUi(incomingUser.gender) ?? fallbackGender,
    countryCode: incomingUser.country || fallbackCountryCode,
  };
}
