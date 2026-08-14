package com.xgc.agent.rag.features.knowledge;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import com.xgc.agent.rag.features.knowledge.util.OriginalFilenameRules;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OriginalFilenameRulesTest {

    @Test
    void resolve_nullOrBlankKeepsStored() {
        assertThat(OriginalFilenameRules.resolve("handbook.pdf", null)).isEqualTo("handbook.pdf");
        assertThat(OriginalFilenameRules.resolve("handbook.pdf", "  ")).isEqualTo("handbook.pdf");
    }

    @Test
    void resolve_renamesStemAndKeepsStoredSuffixCasing() {
        assertThat(OriginalFilenameRules.resolve("handbook.PDF", " 手册.pdf ")).isEqualTo("手册.PDF");
    }

    @Test
    void resolve_fileWithoutSuffixRenamesWholeName() {
        assertThat(OriginalFilenameRules.resolve("README", "说明")).isEqualTo("说明");
    }

    @Test
    void resolve_rejectsExtensionChange() {
        assertThatThrownBy(() -> OriginalFilenameRules.resolve("handbook.pdf", "handbook.md"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILENAME_EXTENSION_LOCKED.code());
        assertThatThrownBy(() -> OriginalFilenameRules.resolve("handbook.pdf", "handbook"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILENAME_EXTENSION_LOCKED.code());
        assertThatThrownBy(() -> OriginalFilenameRules.resolve("README", "README.txt"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILENAME_EXTENSION_LOCKED.code());
    }

    @Test
    void resolve_rejectsBlankStemPathCharsAndOversize() {
        assertThatThrownBy(() -> OriginalFilenameRules.resolve("a.pdf", ".pdf"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILENAME_INVALID.code());
        assertThatThrownBy(() -> OriginalFilenameRules.resolve("a.pdf", "../x.pdf"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILENAME_INVALID.code());
        assertThatThrownBy(() -> OriginalFilenameRules.resolve("a.pdf", "a:b.pdf"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILENAME_INVALID.code());
        assertThatThrownBy(() -> OriginalFilenameRules.resolve("a.pdf", "x".repeat(509) + ".pdf"))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.FILENAME_INVALID.code());
    }
}
