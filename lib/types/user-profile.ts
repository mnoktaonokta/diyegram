export type GenderOption = "male" | "female" | "other" | "";

export type UserProfileSettings = {
  firstName: string;
  lastName: string;
  age: string;
  height: string;
  gender: GenderOption;
  email: string;
  avatarUrl: string;
  /** Diyetisyen sosyal profil unvanı */
  professionalTitle: string;
  /** Diyetisyen sosyal profil biyografisi */
  bio: string;
};

export type PasswordChangeForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
