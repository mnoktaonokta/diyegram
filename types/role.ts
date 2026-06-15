export type Role = "DIETITIAN" | "CLIENT";

export function getRoleHomePath(role: Role) {
  return role === "DIETITIAN" ? "/dietitian" : "/client";
}
