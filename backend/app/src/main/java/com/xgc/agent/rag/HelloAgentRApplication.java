package com.xgc.agent.rag;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.xgc.agent.rag")
public class HelloAgentRApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelloAgentRApplication.class, args);
    }

}
