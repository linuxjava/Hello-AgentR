package com.xgc.agent.rag.knowledge.service.impl;

import com.xgc.agent.rag.knowledge.service.DocumentPresence;
import org.springframework.stereotype.Component;

/**
 * V0.2 默认实现：尚无 Document，恒视为空库。
 */
@Component
public class EmptyDocumentPresence implements DocumentPresence {

    @Override
    public boolean hasDocuments(String knowledgeBaseId) {
        return false;
    }
}
