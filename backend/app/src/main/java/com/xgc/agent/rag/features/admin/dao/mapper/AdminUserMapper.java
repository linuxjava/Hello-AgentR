package com.xgc.agent.rag.features.admin.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xgc.agent.rag.features.admin.dao.entity.AdminUserDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * AdminUser MyBatis-Plus Mapper。
 *
 * <p>删除操作为物理删除（实体无 {@code @TableLogic}）。</p>
 */
@Mapper
public interface AdminUserMapper extends BaseMapper<AdminUserDO> {
}
