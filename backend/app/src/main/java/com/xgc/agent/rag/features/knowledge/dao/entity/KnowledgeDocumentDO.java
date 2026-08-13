package com.xgc.agent.rag.features.knowledge.dao.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Map;

/**
 * Document 持久化实体。
 *
 * <p>不使用 {@code @TableLogic}：删除须同步去掉对象存储中的源文件，逻辑删除会让占用检查与桶不一致。
 * {@code autoResultMap} 是为了让 JSONB 走 JacksonTypeHandler。</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName(value = "t_knowledge_document", autoResultMap = true)
public class KnowledgeDocumentDO {

    /**
     * 主键；上传时先生成再拼 objectKey，故业务层赋值，不用插入后再读回。
     */
    @TableId(type = IdType.INPUT)
    private String id;

    /**
     * 所属知识库。
     */
    private String knowledgeBaseId;

    /**
     * 原始文件名；非唯一键。
     */
    private String originalFilename;

    /**
     * Tika 规范化后的 MIME。
     */
    private String mediaType;

    /**
     * 字节大小。
     */
    private Long byteSize;

    /**
     * 本阶段恒 UPLOADED。
     */
    private String status;

    /**
     * 运营开关；与摄入状态解耦。默认启用，禁用不删对象、仍计入 documentCount。
     */
    @Builder.Default
    private Boolean enabled = Boolean.TRUE;

    /**
     * OVERLAPPING / STRUCTURE_AWARE。
     */
    private String chunkStrategy;

    /**
     * 策略参数 JSON；用 TEXT 避免 PostgreSQL JSONB 与 MyBatis 字符串绑定不匹配。
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> chunkStrategyParams;

    /**
     * 本阶段恒 LOCAL_FILE。
     */
    private String sourceType;

    /**
     * 存储键；禁止映射到对外 DTO。
     */
    private String objectKey;

    /**
     * 创建者。
     */
    private String createdBy;

    /**
     * 最后修改者。
     */
    private String updatedBy;

    /**
     * 创建时间。
     */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 更新时间；改策略时必须刷新以支撑「按更新时间倒序」。
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}
