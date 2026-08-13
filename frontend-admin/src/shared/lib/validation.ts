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

/** 与后端 Name 规则对齐：去首尾空白后 1–64。 */
export const knowledgeNameSchema = z
  .string()
  .trim()
  .min(1, '名称为 1–64 字')
  .max(64, '名称为 1–64 字')

/** 创建后不可改；仅小写字母与数字，避免与隔离键漂移。 */
export const knowledgeNamespaceSchema = z
  .string()
  .regex(/^[a-z0-9]{2,32}$/, '命名空间须为 2–32 位小写字母或数字')

export const knowledgeDescriptionSchema = z.string().max(200, '描述最长 200 字')
