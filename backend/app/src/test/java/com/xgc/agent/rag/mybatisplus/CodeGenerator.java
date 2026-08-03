package com.xgc.agent.rag.mybatisplus;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.config.TemplateType;
import com.baomidou.mybatisplus.generator.config.rules.DateType;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;
import com.baomidou.mybatisplus.generator.fill.Column;
import org.junit.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;

/**
 * MyBatis-Plus 代码生成器。
 * <p>
 * 运行前修改 {@link #TABLES}，然后执行本测试方法。
 * 请在 {@code backend/app} 模块下运行，保证输出路径正确。
 */
public class CodeGenerator {

    /** 数据源（与 application.yaml 保持一致） */
    private static final String JDBC_URL = "jdbc:postgresql://127.0.0.1:5432/ragent?client_encoding=UTF8";
    private static final String JDBC_USER = "postgres";
    private static final String JDBC_PASSWORD = "postgres@Xiao123456";

    /** 需要生成的表；留空数组表示生成库中全部表 */
    private static final String[] TABLES = {
            "t_knowledge_base",
    };

    @Test
    public void run() {
        Path appDir = resolveAppDir();
        String javaOutputDir = appDir.resolve("src/main/java").toString();
        String xmlOutputDir = appDir.resolve("src/main/resources/mapper").toString();

        FastAutoGenerator.create(JDBC_URL, JDBC_USER, JDBC_PASSWORD)
                .globalConfig(builder -> builder
                        .author("xgc")
                        .outputDir(javaOutputDir)
                        .commentDate("yyyy-MM-dd")
                        .dateType(DateType.ONLY_DATE)
                        .disableOpenDir()
                )
                .packageConfig(builder -> builder
                        .parent("com.xgc.agent.rag")
                        .entity("dao.entity")
                        .mapper("dao.mapper")
                        .service("service")
                        .serviceImpl("service.impl")
                        .xml("mapper")
                        .pathInfo(Collections.singletonMap(OutputFile.xml, xmlOutputDir))
                )
                .strategyConfig(builder -> {
                    if (TABLES.length > 0) {
                        builder.addInclude(TABLES);
                    }
                    builder.addTablePrefix("t_")
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
                            .formatServiceImplFileName("%sServiceImpl");
                })
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
}
