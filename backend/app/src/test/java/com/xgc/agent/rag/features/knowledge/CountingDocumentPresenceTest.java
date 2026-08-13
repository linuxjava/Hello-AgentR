package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.rag.features.knowledge.dao.mapper.KnowledgeDocumentMapper;
import com.xgc.agent.rag.features.knowledge.service.impl.CountingDocumentPresence;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CountingDocumentPresenceTest {

    @Mock
    private KnowledgeDocumentMapper mapper;

    @Test
    void hasDocuments_afterCountPositive() {
        when(mapper.selectCount(any())).thenReturn(2L);
        CountingDocumentPresence presence = new CountingDocumentPresence(mapper);
        assertThat(presence.count("kb-1")).isEqualTo(2L);
        assertThat(presence.hasDocuments("kb-1")).isTrue();
    }

    @Test
    void hasDocuments_whenZero() {
        when(mapper.selectCount(any())).thenReturn(0L);
        CountingDocumentPresence presence = new CountingDocumentPresence(mapper);
        assertThat(presence.hasDocuments("kb-1")).isFalse();
    }
}
