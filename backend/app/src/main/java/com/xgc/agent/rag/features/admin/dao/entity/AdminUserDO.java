package com.xgc.agent.rag.features.admin.dao.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
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
 * 管理端账号（AdminUser）持久化实体。
 *
 * <p>对应表 {@code t_admin_user}；与 EndUser 身份隔离。
 * 本实体 intentionally 不使用 {@code @TableLogic}，删除为物理删除。</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@TableName("t_admin_user")
public class AdminUserDO {

    /**
     * 主键 ID（Snowflake 字符串）。
     */
    @TableId(type = IdType.ASSIGN_ID)
    private String id;

    /**
     * 登录用户名；全局唯一；创建后不可变更；长度 4–32，仅字母数字下划线。
     */
    private String username;

    /**
     * 密码哈希（BCrypt）；禁止在 API 响应中返回。
     */
    private String passwordHash;

    /**
     * 角色：{@link AdminUserRole#ADMIN} 管理员，{@link AdminUserRole#STAFF} 运营人员。
     */
    private AdminUserRole role;

    /**
     * 是否为 Bootstrap Admin（系统初始管理员标记）；为 true 时不可删除，且标记不可去除。
     */
    private Boolean bootstrap;

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
