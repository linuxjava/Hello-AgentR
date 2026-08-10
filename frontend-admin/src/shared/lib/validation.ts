import { z } from 'zod'

export const usernameSchema = z
  .string()
  .min(4, '用户名须为 4–32 位字母、数字或下划线')
  .max(32, '用户名须为 4–32 位字母、数字或下划线')
  .regex(/^[a-zA-Z0-9_]+$/, '用户名须为 4–32 位字母、数字或下划线')

export const passwordSchema = z
  .string()
  .min(8, '密码须为 8–64 位，且包含字母与数字')
  .max(64, '密码须为 8–64 位，且包含字母与数字')
  .regex(/[A-Za-z]/, '密码须为 8–64 位，且包含字母与数字')
  .regex(/[0-9]/, '密码须为 8–64 位，且包含字母与数字')
