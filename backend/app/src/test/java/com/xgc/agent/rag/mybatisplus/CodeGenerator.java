package com.xgc.agent.rag.mybatisplus;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.DataSourceConfig;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.config.TemplateType;
import com.baomidou.mybatisplus.generator.config.rules.DateType;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;
import com.baomidou.mybatisplus.generator.fill.Column;
import org.junit.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.FileSystemResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;

/**
 * MyBatis-Plus 代码生成器。
 * <p>
 * 按业务模块生成：同一业务下的多张表输出到同一包路径。
 * 数据源从 {@code application.yaml} 的 {@code spring.datasource.*} 读取。
 * <pre>
 * com.xgc.agent.rag.{MODULE}
 *   ├── dao.entity
 *   ├── dao.mapper
 *   ├── service
 *   └── service.impl
 * resources/mapper/{MODULE}/
 * </pre>
 * 使用前修改 {@link #MODULE} 与 {@link #TABLES}，在 app 模块下运行本测试。
 */
public class CodeGenerator {

    /**
     * 业务模块名（多表共用同一输出路径）。
     * 例如 knowledge → com.xgc.agent.rag.knowledge.*
     */
    private static final String MODULE = "knowledge";

    /** 该业务下需要生成的表；至少配置一张 */
    private static final String[] TABLES = {
            "t_knowledge_base",
            // "t_knowledge_document",
            // "t_knowledge_chunk",
    };

    private static final String TABLE_PREFIX = "t_";

    @Test
    public void run() {
        if (MODULE == null || MODULE.isEmpty()) {
            throw new IllegalStateException("请先配置业务模块名 MODULE");
        }
        if (TABLES.length == 0) {
            throw new IllegalStateException("请至少配置一张业务表 TABLES");
        }

        Path appDir = resolveAppDir();
        DataSourceConfig dataSource = loadDataSource(appDir);
        String javaOutputDir = appDir.resolve("src/main/java").toString();
        String xmlOutputDir = appDir.resolve("src/main/resources/mapper/" + MODULE).toString();

        FastAutoGenerator.create(dataSource.url(), dataSource.username(), dataSource.password())
                .globalConfig(builder -> builder
                        .author("xgc")
                        .outputDir(javaOutputDir)
                        .commentDate("yyyy-MM-dd")
                        .dateType(DateType.ONLY_DATE)
                        .disableOpenDir()
                )
                .packageConfig(builder -> builder
                        .parent("com.xgc.agent.rag")
                        .moduleName(MODULE)
                        .entity("dao.entity")
                        .mapper("dao.mapper")
                        .service("service")
                        .serviceImpl("service.impl")
                        .xml("mapper")
                        .pathInfo(Collections.singletonMap(OutputFile.xml, xmlOutputDir))
                )
                .strategyConfig(builder -> builder
                        .addInclude(TABLES)
                        .addTablePrefix(TABLE_PREFIX)//生成类名时会去掉前缀
                        .entityBuilder()
                        .enableLombok()
                        .enableTableFieldAnnotation()
                        .idType(IdType.ASSIGN_ID)
                        .formatFileName("%sDO")
                        .logicDeleteColumnName("deleted")
                        .logicDeletePropertyName("deleted")
                        .addTableFills(
                                new Column("create_time", FieldFill.INSERT),
                                new Column("update_time", FieldFill.INSERT_UPDATE)
                        )
                        .naming(NamingStrategy.underline_to_camel)
                        .columnNaming(NamingStrategy.underline_to_camel)
                        .mapperBuilder()
                        .enableMapperAnnotation()
                        .formatMapperFileName("%sMapper")
                        .formatXmlFileName("%sMapper")
                        .serviceBuilder()
                        .formatServiceFileName("%sService")
                        .formatServiceImplFileName("%sServiceImpl")
                )
                .templateConfig(builder -> builder.disable(TemplateType.CONTROLLER))
                .templateEngine(new FreemarkerTemplateEngine())
                .execute();
    }

    /**
     * 兼容在 backend、backend/app、仓库根目录下运行。
     */
    private static Path resolveAppDir() {
        Path userDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        Path[] candidates = {
                userDir,
                userDir.resolve("app"),
                userDir.resolve("backend/app"),
        };
        for (Path candidate : candidates) {
            if (Files.isDirectory(candidate.resolve("src/main/java"))) {
                return candidate;
            }
        }
        throw new IllegalStateException("无法定位 app 模块目录，当前 user.dir=" + userDir);
    }

    /**
     * 从 app 模块的 application.yaml 读取 spring.datasource 配置。
     */
    private static DataSourceConfig loadDataSource(Path appDir) {
        Path yamlPath = appDir.resolve("src/main/resources/application.yaml");
        if (!Files.isRegularFile(yamlPath)) {
            throw new IllegalStateException("未找到配置文件: " + yamlPath);
        }
        try {
            List<PropertySource<?>> sources = new YamlPropertySourceLoader()
                    .load("application", new FileSystemResource(yamlPath));
            if (sources.isEmpty()) {
                throw new IllegalStateException("配置文件为空: " + yamlPath);
            }
            PropertySource<?> source = sources.get(0);
            return new DataSourceConfig(
                    requireProperty(source, "spring.datasource.url"),
                    requireProperty(source, "spring.datasource.username"),
                    requireProperty(source, "spring.datasource.password")
            );
        } catch (IOException e) {
            throw new IllegalStateException("读取配置文件失败: " + yamlPath, e);
        }
    }

    private static String requireProperty(PropertySource<?> source, String key) {
        Object value = source.getProperty(key);
        if (value == null || value.toString().isEmpty()) {
            throw new IllegalStateException("缺少配置项: " + key);
        }
        return value.toString();
    }

    private static final class DataSourceConfig {
        private final String url;
        private final String username;
        private final String password;

        private DataSourceConfig(String url, String username, String password) {
            this.url = url;
            this.username = username;
            this.password = password;
        }

        private String url() {
            return url;
        }

        private String username() {
            return username;
        }

        private String password() {
            return password;
        }
    }
}
