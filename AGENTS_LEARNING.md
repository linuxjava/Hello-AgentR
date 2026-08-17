# Agent Learning Log

This file is auto-maintained by AI agents as a self-improving mistake log.
Each iteration captures a concrete mistake, the pattern to avoid, and the better approach.
Do not edit past entries; append only.

---

## Agent Learning Log: Iteration #1

**Date**: 2026-08-11 | **Task**: Knowledge grilling
**Signal**: User correction

### ❌ Mistake Made
grilling 第 1 轮一次抛出 Q1–Q5。用户要求「一个一个提问，每个问题提供推荐答案」。

### 🚫 Pattern to Avoid
- **No 一轮抛完整 frontier**：用户已声明串行提问时，不要按 grilling 默认「整前沿一起问」。

### ✅ Better Approach
该用户会话里每次只问一个 ❓，附 ➡️ 建议，等回复再问下一题。

---

## Agent Learning Log: Iteration #2

**Date**: 2026-08-11 | **Task**: Knowledge grilling
**Signal**: User correction

### ❌ Mistake Made
用测试侧 `KnowledgeBaseDO` 的字段当领域规格来提问和推荐。用户明确「不要参考 KnowledgeBaseDO」。

### 🚫 Pattern to Avoid
- **No 探路代码当 ubiquitous language**：test 包实体不是已接受的产品模型。

### ✅ Better Approach
从产品切片与场景提问；字段等用户拍板后再写入 `CONTEXT.md`。

---

## Agent Learning Log: Iteration #3

**Date**: 2026-08-11 | **Task**: 词汇表放置
**Signal**: User correction

### ❌ Mistake Made
曾准备把词汇表放进 `版本迭代/V0.1`、`V0.2`，用版本号当主键。用户叫停并改选按上下文目录。

### 🚫 Pattern to Avoid
- **No 词汇表进版本夹**：语言跨版本生效；按版本拆会导致复制或把同一域切开。

### ✅ Better Approach
词汇表放 `docs/backend/context/<context>/CONTEXT.md`；版本夹只放 PRD，用链接引用。

---

## Agent Learning Log: Iteration #4

**Date**: 2026-08-15 | **Task**: Document 上传去 byte[] / 流式改造
**Signal**: User correction

### ❌ Mistake Made
在 `DocumentServiceImpl#upload` 用 `transferTo` 自建临时文件，并误称 `MultipartFile.getInputStream()` 是一次性流；实际每次调用返回新流，探测与上传可各开一流。

### 🚫 Pattern to Avoid
- **No 把 MultipartFile 当成单次 InputStream**：在已有可重复 `getInputStream()` 时再 `transferTo` 落盘，增加无磁盘 I/O 与清理负担。
- **No 用笼统「流只能读一遍」掩盖框架契约**：先核对 `MultipartFile` / `Part` 语义再选编排。

### ✅ Better Approach
MIME 用 `file.getInputStream()` + Tika `detect(InputStream, Metadata)`；`ObjectStorage.put` 再 `getInputStream()` 一次并传入 `file.getSize()`；仅在非 Multipart、或明确需要可重试落盘时再使用 `Path` 重载。
