package com.xgc.agent.rag;

import com.xgc.agent.rag.features.knowledge.properties.ModelCatalogProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(scanBasePackages = "com.xgc.agent")
@EnableConfigurationProperties(ModelCatalogProperties.class)
public class HelloAgentRApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelloAgentRApplication.class, args);
    }

}
