import { create } from "zustand";
import { detectAuthMethod } from "@/lib/validation/auth";
import {
  DEFAULT_ONBOARDING_GENDER,
  EMPTY_PROFILE_DRAFT,
  resolveHydratedUserState,
  type OnboardingProfileDraft,
} from "@/lib/validation/onboarding-state";
import { CountryItem } from "@/components/formElement/CountryListItem";
import type { UserProfileSummary } from "../types/auth-api.types";

export type AuthFlow = "signup" | "signin";
export type AuthMethod = "email" | "phone" | "google";

export { CountryItem };

export type ProfileData = OnboardingProfileDraft;

export interface OnboardingState {
  flow: AuthFlow;
  authMethod: AuthMethod;
  identifier: string;
  requestId: string | null;
  isNewUser: boolean | null;
  cooldownSeconds: number | null;
  otp: string;
  onboardingToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: UserProfileSummary | null;
  profile: ProfileData;
  gender: string;
  country: CountryItem | null;
  isAuthenticated: boolean;

  // Actions
  startAuthFlow: (flow: AuthFlow) => void;
  setFlow: (flow: AuthFlow) => void;
  setAuthMethod: (method: AuthMethod) => void;
  setIdentifier: (identifier: string, method?: AuthMethod) => void;
  setRequestId: (requestId: string | null) => void;
  setIsNewUser: (isNewUser: boolean | null) => void;
  setCooldownSeconds: (cooldownSeconds: number | null) => void;
  setAuthInitiateData: (data: {
    requestId: string;
    isNewUser: boolean;
    cooldownSeconds?: number;
  }) => void;
  setOtp: (otp: string) => void;
  setOnboardingToken: (token: string | null) => void;
  setSessionTokens: (accessToken: string, refreshToken: string) => void;
  setCurrentUser: (user: UserProfileSummary | null) => void;
  setProfile: (profile: Partial<ProfileData>) => void;
  setGender: (gender: string) => void;
  setCountry: (country: CountryItem | null) => void;
  setIsAuthenticated: (status: boolean) => void;
  resetOnboarding: () => void;
}

const DEFAULT_PROFILE: ProfileData = EMPTY_PROFILE_DRAFT;

const INITIAL_DRAFT_STATE = {
  identifier: "",
  requestId: null as string | null,
  isNewUser: null as boolean | null,
  cooldownSeconds: null as number | null,
  otp: "",
  onboardingToken: null as string | null,
  currentUser: null as UserProfileSummary | null,
  profile: DEFAULT_PROFILE,
  gender: DEFAULT_ONBOARDING_GENDER,
  country: null as CountryItem | null,
};

export const COUNTRIES_DATA: CountryItem[] = [
  { id: "ca", name: "Canada", region: "North America", flagEmoji: "🇨🇦" },
  { id: "us", name: "United States", region: "North America", flagEmoji: "🇺🇸" },
  { id: "fr", name: "France", region: "Europe", flagEmoji: "🇫🇷" },
  { id: "ch", name: "Switzerland", region: "Europe", flagEmoji: "🇨🇭" },
  { id: "at", name: "Austria", region: "Europe", flagEmoji: "🇦🇹" },
  { id: "jp", name: "Japan", region: "Asia", flagEmoji: "🇯🇵" },
  { id: "nz", name: "New Zealand", region: "Oceania", flagEmoji: "🇳🇿" },
  { id: "no", name: "Norway", region: "Europe", flagEmoji: "🇳🇴" },
  { id: "it", name: "Italy", region: "Europe", flagEmoji: "🇮🇹" },
  { id: "in", name: "India", region: "Asia", flagEmoji: "🇮🇳" },
];

export function resolveCountry(code?: string | null): CountryItem | null {
  if (!code) return null;
  const match = COUNTRIES_DATA.find(
    (c) => c.id.toLowerCase() === code.trim().toLowerCase()
  );
  if (match) return match;
  return {
    id: code.toLowerCase(),
    name: code.toUpperCase(),
    region: "Global",
    flagEmoji: "🌐",
  };
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  flow: "signup",
  authMethod: "email",
  identifier: "",
  requestId: null,
  isNewUser: null,
  cooldownSeconds: null,
  otp: "",
  onboardingToken: null,
  accessToken: null,
  refreshToken: null,
  currentUser: null,
  profile: DEFAULT_PROFILE,
  gender: "man",
  country: null,
  isAuthenticated: false,

  startAuthFlow: (flow) =>
    set({
      flow,
      authMethod: "email",
      ...INITIAL_DRAFT_STATE,
    }),
  setFlow: (flow) => set({ flow }),
  setAuthMethod: (authMethod) => set({ authMethod }),
  setIdentifier: (identifier, method) =>
    set((state) => {
      const trimmed = identifier.trim();
      const resolvedMethod = method || detectAuthMethod(trimmed);
      const isDifferentAccount =
        state.identifier.trim().toLowerCase() !== trimmed.toLowerCase();

      return {
        ...(isDifferentAccount ? INITIAL_DRAFT_STATE : {}),
        identifier: trimmed,
        authMethod: resolvedMethod,
      };
    }),
  setRequestId: (requestId) => set({ requestId }),
  setIsNewUser: (isNewUser) => set({ isNewUser }),
  setCooldownSeconds: (cooldownSeconds) => set({ cooldownSeconds }),
  setAuthInitiateData: ({ requestId, isNewUser, cooldownSeconds }) =>
    set({
      requestId,
      isNewUser,
      cooldownSeconds: cooldownSeconds || 60,
    }),
  setOtp: (otp) => set({ otp }),
  setOnboardingToken: (onboardingToken) => set({ onboardingToken }),
  setSessionTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken, isAuthenticated: true }),
  setCurrentUser: (currentUser) =>
    set((state) => {
      if (!currentUser) {
        return { currentUser: null };
      }

      const hydrated = resolveHydratedUserState(currentUser, {
        userId: state.currentUser?.id ?? null,
        profile: state.profile,
        gender: state.gender,
        countryCode: state.country?.id ?? null,
      });

      return {
        currentUser,
        identifier: currentUser.email || state.identifier,
        country: hydrated.countryCode
          ? resolveCountry(hydrated.countryCode)
          : null,
        profile: hydrated.profile,
        gender: hydrated.gender,
      };
    }),
  setProfile: (updatedProfile) =>
    set((state) => ({
      profile: {
        ...state.profile,
        ...updatedProfile,
      },
    })),

  setGender: (gender) => set({ gender }),
  setCountry: (country) => set({ country }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  resetOnboarding: () =>
    set({
      flow: "signup",
      authMethod: "email",
      identifier: "",
      requestId: null,
      isNewUser: null,
      cooldownSeconds: null,
      otp: "",
      onboardingToken: null,
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      profile: DEFAULT_PROFILE,
      gender: "man",
      country: null,
      isAuthenticated: false,
    }),
}));
