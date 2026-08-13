package com.xgc.agent.rag.features.knowledge.dao.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 知识库容器持久化实体。
 *
 * <p>对应表 {@code t_knowledge_base}。不使用 {@code @TableLogic}：产品要求物理删除后
 * Namespace 立刻可复用；逻辑删除会继续占用唯一约束。</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("t_knowledge_base")
public class KnowledgeBaseDO {

    /**
     * 主键 ID（Snowflake 字符串）。
     */
    @TableId(type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 显示名；去空白后全局唯一；可改。
     */
    private String name;

    /**
     * 可选说明。ALWAYS 策略是为了 PUT 时能把描述清空（默认 NOT_NULL 会跳过 null）。
     */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private String description;

    /**
     * 存储/检索隔离键；创建后业务层禁止改此列。
     */
    private String namespace;

    /**
     * 创建时绑定的向量模型标识；创建后业务层禁止改此列。
     */
    private String embeddingModel;

    /**
     * 创建者 AdminUser id；只做审计。
     */
    private String createdBy;

    /**
     * 最后修改者 AdminUser id。
     */
    private String updatedBy;

    /**
     * 创建时间（插入时自动填充）。
     */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 最后更新时间（插入与更新时自动填充）。
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}
