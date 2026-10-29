import { create } from "zustand";
import { detectAuthMethod } from "@/lib/validation/auth";
import { CountryItem } from "@/components/formElement/CountryListItem";

export type AuthFlow = "signup" | "signin";
export type AuthMethod = "email" | "phone";

export { CountryItem };

export interface ProfileData {
  firstName: string;
  lastName: string;
  userName: string;
  isUsernameVerified: boolean;
}

export interface OnboardingState {
  flow: AuthFlow;
  authMethod: AuthMethod;
  identifier: string;
  otp: string;
  profile: ProfileData;
  gender: string;
  country: CountryItem | null;
  isAuthenticated: boolean;

  // Actions
  setFlow: (flow: AuthFlow) => void;
  setAuthMethod: (method: AuthMethod) => void;
  setIdentifier: (identifier: string, method?: AuthMethod) => void;
  setOtp: (otp: string) => void;
  setProfile: (profile: Partial<ProfileData>) => void;
  setGender: (gender: string) => void;
  setCountry: (country: CountryItem | null) => void;
  setIsAuthenticated: (status: boolean) => void;
  resetOnboarding: () => void;
}

const DEFAULT_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  userName: "",
  isUsernameVerified: false,
};

const DEFAULT_COUNTRY: CountryItem = {
  id: "ca",
  name: "Canada",
  region: "North America",
  flagEmoji: "🇨🇦",
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  flow: "signup",
  authMethod: "email",
  identifier: "",
  otp: "",
  profile: DEFAULT_PROFILE,
  gender: "man",
  country: DEFAULT_COUNTRY,
  isAuthenticated: false,

  setFlow: (flow) => set({ flow }),
  setAuthMethod: (authMethod) => set({ authMethod }),
  setIdentifier: (identifier, method) => {
    const trimmed = identifier.trim();
    const resolvedMethod = method || detectAuthMethod(trimmed);
    set({
      identifier: trimmed,
      authMethod: resolvedMethod,
    });
  },
  setOtp: (otp) => set({ otp }),
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
      otp: "",
      profile: DEFAULT_PROFILE,
      gender: "man",
      country: DEFAULT_COUNTRY,
      isAuthenticated: false,
    }),
}));
