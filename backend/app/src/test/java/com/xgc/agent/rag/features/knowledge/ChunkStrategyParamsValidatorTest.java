package com.xgc.agent.rag.features.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.chunk.ChunkStrategyParamsValidator;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ChunkStrategyParamsValidatorTest {

    private ChunkStrategyParamsValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ChunkStrategyParamsValidator(new ObjectMapper());
    }

    @Test
    void overlapping_valid() {
        Map<String, Object> params = validator.parseAndValidate(
                "OVERLAPPING", "{\"chunkSize\":512,\"overlap\":64}");
        assertThat(params).containsEntry("chunkSize", 512).containsEntry("overlap", 64);
    }

    @Test
    void overlapping_overlapTooLarge_rejects() {
        assertThatThrownBy(() -> validator.parseAndValidate(
                "OVERLAPPING", "{\"chunkSize\":10,\"overlap\":10}"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID.code());
    }

    @Test
    void overlapping_withStructureKeys_rejects() {
        assertThatThrownBy(() -> validator.parseAndValidate(
                "OVERLAPPING",
                "{\"defaultChunkSize\":1,\"maxChunkSize\":2,\"minChunkSize\":1,\"overlap\":0}"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID.code());
    }

    @Test
    void unknownStrategy_rejects() {
        assertThatThrownBy(() -> validator.parseAndValidate("FOO", "{\"chunkSize\":8,\"overlap\":1}"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.CHUNK_STRATEGY_INVALID.code());
    }

    @Test
    void structureAware_minGreaterThanDefault_rejects() {
        assertThatThrownBy(() -> validator.parseAndValidate(
                "STRUCTURE_AWARE",
                "{\"defaultChunkSize\":10,\"maxChunkSize\":20,\"minChunkSize\":15,\"overlap\":0}"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.CHUNK_STRATEGY_PARAMS_INVALID.code());
    }
}
